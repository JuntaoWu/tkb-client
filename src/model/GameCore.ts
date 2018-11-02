
module game {

    export class GameCore extends puremvc.Proxy implements puremvc.IProxy {
        public static NAME: string = "GameCore";

        public connected: boolean = false;

        private updateId: any;

        private socket: SocketIOClient.Socket;

        //A list of recent server updates we interpolate across
        //This is the buffer that is the driving factor for our networking
        private serverUpdates: GameState[] = [];

        private gameProxy: GameProxy;

        //copies a 2d vector like object from one to another
        public pos(a) {
            return { x: a.x, y: a.y };
        }
        //Add a 2d vector with another one and return the resulting vector
        public v_add(a, b) {
            return { x: (a.x + b.x).fixed(), y: (a.y + b.y).fixed() };
        }
        //Subtract a 2d vector with another one and return the resulting vector
        public v_sub(a, b) {
            return { x: (a.x - b.x).fixed(), y: (a.y - b.y).fixed() };
        }
        //Multiply a 2d vector with a scalar value and return the resulting vector
        public v_mul_scalar(a, b) {
            return { x: (a.x * b).fixed(), y: (a.y * b).fixed() };
        }
        //For the server, we need to cancel the setTimeout that the polyfill creates
        public stop_update() {
            console.log("stopUpdate")
            window.cancelAnimationFrame(this.updateId);
        }
        //Simple linear interpolation
        public lerp(p, n, t) {
            var _t = Number(t);
            _t = (Math.max(0, Math.min(1, _t))).fixed();
            return (p + _t * (n - p)).fixed();
        }
        //Simple linear interpolation between 2 vectors
        public v_lerp(v, tv, t) { return { x: this.lerp(v.x, tv.x, t), y: this.lerp(v.y, tv.y, t) }; };

        public world: any = {
            width: 720,
            height: 1280,
        };

        public players: _.Dictionary<GamePlayer> = {
            self: new GamePlayer(this),
            other: new GamePlayer(this)
        };

        private ghosts: _.Dictionary<GamePlayer>;

        /**
         * Client configuration
         */
        private naiveApproach: boolean = true;
        private clientPredict: boolean = true;
        //The speed at which the clients move.
        private playerspeed = 120;
        //Set up some physics integration values
        private _pdt = 0.0001;                 //The physics update delta time
        private _pdte = new Date().getTime();  //The physics update last delta time
        //A local timer for precision on server and client
        public localTime = 0.016;            //The local timer
        private _dt = new Date().getTime();    //The local timer delta
        private _dte = new Date().getTime();   //The local timer last frame time
        public inputSeq = 0;
        private dt;
        private lastFrameTime;
        private viewport;
        private clientTime: number;
        private serverTime: number;
        private lastState: GameState;
        private netLatency;
        private netOffset;
        private bufferSize;
        private oldestTick;
        private clientSmoothing;
        private clientSmooth;
        private netPing = 0.001;              //The round trip time from here to the server,and back
        private lastPingTime = 0.001;        //The time we last sent a ping
        private fakeLag = 0;                //If we are simulating lag, this applies only to the input client (not others)
        private fakeLagTime = 0;
        private targetTime;
        private fps = 0;                       //The current instantaneous fps (1/this.dt)
        private fpsAvgCount = 0;             //The number of samples we have taken for fps_avg
        private fpsAvg = 0;                   //The current average fps displayed in the debug UI
        private fpsAvgAcc = 0;               //The accumulation of the last avgcount fps samples

        private lit = 0;
        private llt = new Date().getTime();

        constructor() {

            super(GameCore.NAME);

            //We create a player set, passing them
            //the game that is running them, as well
            this.players = {
                self: new GamePlayer(this),
                other: new GamePlayer(this)
            };

            //Debugging ghosts, to help visualize things
            this.ghosts = {
                //Our ghost position on the server
                server_pos_self: new GamePlayer(this),
                //The other players server position as we receive it
                server_pos_other: new GamePlayer(this),
                //The other players ghost destination position (the lerp)
                pos_other: new GamePlayer(this)
            };

            this.ghosts["pos_other"].state = 'dest_pos';

            this.ghosts["pos_other"].info_color = 'rgba(255,255,255,0.1)';

            this.ghosts["server_pos_self"].info_color = 'rgba(255,255,255,0.2)';
            this.ghosts["server_pos_other"].info_color = 'rgba(255,255,255,0.2)';

            this.ghosts["server_pos_self"].state = 'server_pos';
            this.ghosts["server_pos_other"].state = 'server_pos';

            this.ghosts["server_pos_self"].pos = { x: 20, y: 20 };
            this.ghosts["pos_other"].pos = { x: 500, y: 200 };
            this.ghosts["server_pos_other"].pos = { x: 500, y: 200 };
        }

        public static CUE_STARTED: string = "cue_started";
        public static CUE_ENDED: string = "cue_ended";

        public initialize() {
            //Start a physics loop, this is separate to the rendering
            //as this happens at a fixed frequency
            this.createPhysicsSimulation();

            //Start a fast paced timer for measuring time easier
            this.createTimer();

            //Client specific initialisation
            //Create the default configuration settings
            this.createConfiguration();
        }

        private createTimer() {
            setInterval(() => {
                this._dt = new Date().getTime() - this._dte;
                this._dte = new Date().getTime();
                this.localTime += this._dt / 1000.0;
            }, 4);
        }

        private createPhysicsSimulation() {
            setInterval(() => {
                this._pdt = (new Date().getTime() - this._pdte) / 1000.0;
                this._pdte = new Date().getTime();
                this.updatePhysics();
            }, 15);
        }

        private updatePhysics() {
            //Fetch the new direction from the input buffer,
            //and apply it to the state so we can smooth it in the visual state
            if (this.clientPredict) {
                this.players["self"].oldState.pos = this.pos(this.players["self"].curState.pos);
                var nd = this.processInput(this.players["self"]);
                this.players["self"].curState.pos = this.v_add(this.players["self"].oldState.pos, nd);
                this.players["self"].stateTime = this.localTime;
            }
        }

        public clientUpdate(position: { x: number, y: number }) {

            let inputs = this.players["self"].inputs;
            if (inputs && inputs[inputs.length - 1].inputs[0] == position) {
                return;
            }

            ++this.inputSeq;

            this.players["self"].inputs.push({
                inputs: [position],
                time: this.localTime.fixed(3),
                seq: this.inputSeq
            });

            let serverPacket = 'input.';
            serverPacket += `${position.x}-${position.y}.`;
            serverPacket += this.localTime.toFixed(3).replace('.', '-') + '.';
            serverPacket += this.inputSeq;

            this.socket.send(serverPacket);
        }

        private createConfiguration() {
            this.naiveApproach = true;        //Whether or not to use the naive approach
            this.clientPredict = true;         //Whether or not the client is predicting input
            this.inputSeq = 0;                 //When predicting client inputs, we store the last input as a sequence number
            this.clientSmoothing = true;       //Whether or not the client side prediction tries to smooth things out
            this.clientSmooth = 25;            //amount of smoothing to apply to client update dest

            this.netLatency = 0.001;           //the latency between the client and the server (ping/2)
            this.netPing = 0.001;              //The round trip time from here to the server,and back
            this.lastPingTime = 0.001;        //The time we last sent a ping
            this.fakeLag = 0;                //If we are simulating lag, this applies only to the input client (not others)
            this.fakeLagTime = 0;

            this.netOffset = 100;              //100 ms latency between server and client interpolation for other clients
            this.bufferSize = 2;               //The size of the server history to keep for rewinding/interpolating.
            this.targetTime = 0.01;            //the time where we want to be in the server timeline
            this.oldestTick = 0.01;            //the last time tick we have available in the buffer

            this.clientTime = 0.01;            //Our local 'clock' based on server time - client interpolation(net_offset).
            this.serverTime = 0.01;            //The time the server reported it was at, last we heard from it

            this.dt = 0.016;                    //The time that the last frame took to run
            this.fps = 0;                       //The current instantaneous fps (1/this.dt)
            this.fpsAvgCount = 0;             //The number of samples we have taken for fps_avg
            this.fpsAvg = 0;                   //The current average fps displayed in the debug UI
            this.fpsAvgAcc = 0;               //The accumulation of the last avgcount fps samples

            this.lit = 0;
            this.llt = new Date().getTime();
        }

        public connect() {

            this.gameProxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;

            this.socket = io(Constants.ServiceEndpoint);

            //Sent when we are disconnected (network, server down, etc)
            this.socket.on('disconnect', this.onDisconnect.bind(this));
            //Sent each tick of the server simulation. This is our authoritive update
            this.socket.on('onserverupdate', this.onServerUpdateRecieved.bind(this));
            //Handle when we connect to the server, showing state and storing id's.
            this.socket.on("onconnected", (message) => {
                console.log("onconnected", message);

                this.socket.send(`create.${CommonData.logon.openId}`);
            });
            //On error we just show that we are not connected for now. Can print the data.
            this.socket.on('error', this.onDisconnect.bind(this));
            //On message from the server, we parse the commands and send it to the handlers
            this.socket.on("message", (messageParts) => {
                console.log(messageParts);
                if (!messageParts) {
                    return;
                }
                let parts = messageParts.split(".");
                let messageType = parts[0] == "s" ? parts[1] : parts[0];
                let messageBody = parts[0] == "s" ? parts[2] : parts[1];

                this.onMessage(messageType, messageBody);
            });
        }

        public onServerUpdateRecieved(data: GameState) {
            //Lets clarify the information we have locally. One of the players is 'hosting' and
            //the other is a joined in client, so we name these host and client for making sure
            //the positions we get from the server are mapped onto the correct local sprites
            var player_host = this.players["self"].host ? this.players["self"] : this.players["other"];
            var player_client = this.players["self"].host ? this.players["other"] : this.players["self"];
            var this_player = this.players["self"];

            //Store the server time (this is offset by the latency in the network, by the time we get it)
            this.serverTime = data.t;
            //Update our local offset time from the last server update
            this.clientTime = this.serverTime - (this.netOffset / 1000);

            //One approach is to set the position directly as the server tells you.
            //This is a common mistake and causes somewhat playable results on a local LAN, for example,
            //but causes terrible lag when any ping/latency is introduced. The player can not deduce any
            //information to interpolate with so it misses positions, and packet loss destroys this approach
            //even more so. See 'the bouncing ball problem' on Wikipedia.

            if (this.naiveApproach) {

                if (data.hp) {
                    player_host.pos = this.pos(data.hp);
                }

                if (data.cp) {
                    player_client.pos = this.pos(data.cp);
                }

            } else {

                //Cache the data from the server,
                //and then play the timeline
                //back to the player with a small delay (net_offset), allowing
                //interpolation between the points.
                this.serverUpdates.push(data);

                //we limit the buffer in seconds worth of updates
                //60fps*buffer seconds = number of samples
                if (this.serverUpdates.length >= (60 * this.bufferSize)) {
                    this.serverUpdates.splice(0, 1);
                }

                //We can see when the last tick we know of happened.
                //If client_time gets behind this due to latency, a snap occurs
                //to the last tick. Unavoidable, and a reallly bad connection here.
                //If that happens it might be best to drop the game after a period of time.
                this.oldestTick = this.serverUpdates[0].t;

                //Handle the latest positions from the server
                //and make sure to correct our local predictions, making the server have final say.
                this.processNetPredictionCorrection();

            } //non naive
        }

        public processNetPredictionCorrection() {
            //No updates...
            if (!this.serverUpdates.length) return;

            //The most recent server update
            const latestServerData = this.serverUpdates[this.serverUpdates.length - 1];

            //Our latest server position
            var myServerPos = this.players["self"].host ? latestServerData.hp : latestServerData.cp;

            //Update the debug server position block
            this.ghosts["server_pos_self"].pos = this.pos(myServerPos);

            //here we handle our local input prediction ,
            //by correcting it with the server and reconciling its differences

            var myLastInputOnServer = this.players["self"].host ? latestServerData.his : latestServerData.cis;
            if (myLastInputOnServer) {
                //The last input sequence index in my local input list
                var lastInputSeqIndex = -1;
                //Find this input in the list, and store the index
                for (var i = 0; i < this.players["self"].inputs.length; ++i) {
                    if (this.players["self"].inputs[i].seq.toString() == myLastInputOnServer) {
                        lastInputSeqIndex = i;
                        break;
                    }
                }

                //Now we can crop the list of any updates we have already processed
                if (lastInputSeqIndex != -1) {
                    //so we have now gotten an acknowledgement from the server that our inputs here have been accepted
                    //and that we can predict from this known position instead

                    //remove the rest of the inputs we have confirmed on the server
                    var number_to_clear = Math.abs(lastInputSeqIndex - (-1));
                    this.players["self"].inputs.splice(0, number_to_clear);
                    //The player is now located at the new server position, authoritive server
                    this.players["self"].curState.pos = this.pos(myServerPos);
                    this.players["self"].lastInputSeq = lastInputSeqIndex;
                    //Now we reapply all the inputs that we have locally that
                    //the server hasn't yet confirmed. This will 'keep' our position the same,
                    //but also confirm the server position at the same time.
                    //todo:
                    // this.client_update_physics();
                    // this.client_update_local_position();

                } // if(lastInputSeqIndex != -1)
            } //if myLastInputOnServer
        }

        public onPing(messageBody: string) {

        }

        public onDisconnect() {

        }

        public onMessage(messageType, messageBody) {
            switch (messageType) {
                case 'host': //host a game requested
                    this.onHostGame(messageBody);
                    break;
                case 'reset': //ready a game requested
                    this.connected = true;
                    this.gameProxy.retryLevel();
                    break;
                case 'end': //end game requested
                    this.onDisconnect();
                    break;
                case 'ping': //server ping
                    this.onPing(messageBody);
                    break;
                case 'cueStart':
                    this.onCueStart(messageBody);
                    break;
                case 'cueEnd':
                    this.onCueEnd(messageBody);
                    break;
            }
        }

        public onHostGame(messageBody) {
            //The server sends the time when asking us to host, but it should be a new game.
            //so the value will be really small anyway (15 or 16ms)
            const serverTime = parseFloat(messageBody.replace('-', '.'));

            //Get an estimate of the current time on the server
            this.localTime = serverTime + this.netLatency;

            //Set the flag that we are hosting, this helps us position respawns correctly
            this.players["self"].host = true;

            //Update debugging information to display state
            this.players["self"].state = 'hosting.waiting for a player';
            this.players["self"].info_color = '#cc0000';
        }

        public onCueStart(messageBody) {
            this.sendNotification(GameCore.CUE_STARTED, messageBody);
        }

        public onCueEnd(messageBody) {
            this.sendNotification(GameCore.CUE_ENDED, messageBody);
        }

        processInput(player: GamePlayer) {

            //It's possible to have recieved multiple inputs by now,
            //so we process each one
            var x_dir = 0;
            var y_dir = 0;
            var ic = player.inputs.length;
            if (ic) {
                for (var j = 0; j < ic; ++j) {
                    //don't process ones we already have simulated locally
                    if (player.inputs[j].seq <= player.lastInputSeq) continue;

                    var input = player.inputs[j].inputs;
                    var c = input.length;
                    for (var i = 0; i < c; ++i) {
                        var key = input[i];
                        x_dir = key.x - player.curState.pos.x;
                        y_dir = key.y - player.curState.pos.y;
                    } //for all input values

                } //for each input command
            } //if we have inputs

            //we have a direction vector now, so apply the same physics as the client
            var resulting_vector = this.physics_movement_vector_from_direction(x_dir, y_dir);
            if (player.inputs.length) {
                //we can now clear the array since these have been processed
                player.lastInputTime = player.inputs[ic - 1].time;
                player.lastInputSeq = player.inputs[ic - 1].seq;
            }

            //give it back
            return resulting_vector;

        }

        physics_movement_vector_from_direction(x, y) {

            //Must be fixed step, at physics sync speed.
            return {
                x: (x * (this.playerspeed * 0.015)).fixed(3),
                y: (y * (this.playerspeed * 0.015)).fixed(3)
            };

        }

    }
}