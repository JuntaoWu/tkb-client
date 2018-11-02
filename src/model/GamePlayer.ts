module game {

    export class GamePlayer {

        public host: boolean;

        public pos = { x: 0, y: 0 };
        private size = { x: 16, y: 16, hx: 8, hy: 8 };
        public state = 'not-connected';
        private color = 'rgba(255,255,255,0.1)';
        public info_color = 'rgba(255,255,255,0.1)';
        private id = '';

        public oldState = { pos: { x: 0, y: 0 } };
        public curState = { pos: { x: 0, y: 0 } };
        public stateTime = new Date().getTime();

        public inputs: Input[] = [];
        public lastInputSeq: number;
        public lastInputTime: number;

        //The world bounds we are confined to
        private pos_limits = {
            x_min: this.size.hx,
            x_max: this.game.world.width - this.size.hx,
            y_min: this.size.hy,
            y_max: this.game.world.height - this.size.hy
        };

        constructor(private game: GameCore, public instance?: Client) {
            //The 'host' of a game gets created with a player instance since
            //the server already knows who they are. If the server starts a game
            //with only a host, the other player is set up in the 'else' below
            if (this.instance) {
                this.pos = { x: 20, y: 20 };
            } else {
                this.pos = { x: 500, y: 200 };
            }
        }
    }
}