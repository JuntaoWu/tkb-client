
module game {

    export class GameScreenMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "GameScreenMediator";

        private proxy: GameProxy;

        private world: p2.World;
        private cueArea: p2.Body;
        private debugDraw: p2DebugDraw;

        private _wall: Wall;
        private _holes: Holes;
        private _ball: game.Balls;
        private _star: game.Stars;
        private _cue: game.Cue;

        private cueState: CueState;

        private _currentLevel: number = 0;
        public get currentLevel(): number {
            return this._currentLevel;
        }
        public set currentLevel(v: number) {
            this._currentLevel = v;
            this.gameScreen.currentLevel = `第 ${v + 1} 关`;
        }

        public constructor(viewComponent: any) {
            super(GameScreenMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");

            this.gameScreen.addEventListener(egret.Event.ADDED_TO_STAGE, this.initData, this);
        }

        public async initData() {
            console.log("GameScreen initData");
            this.proxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;
            await this.proxy.initialize();

            this.createWorld();
            this.createCueArea();
            this.createDebug();

            this.gameScreen.stage.addChild(this._wall = new game.Wall(this.world, this.proxy.levelsArray[this.currentLevel].walls));
            this.gameScreen.stage.addChild(this._holes = new game.Holes(this.world, this.proxy.levelsArray[this.currentLevel].holes));
            this.gameScreen.stage.addChild(this._ball = new game.Balls(this.world, this.proxy.levelsArray[this.currentLevel].balls));
            this.gameScreen.stage.addChild(this._star = new game.Stars(this.world, this.proxy.levelsArray[this.currentLevel].stars));
            this.createMaterial();
            this.hitListener();
            this.gameScreen.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchEvent, this);
            this.gameScreen.addEventListener(egret.TouchEvent.TOUCH_END, this.touchEvent, this);
            this.gameScreen.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.touchEvent, this);
            this.gameScreen.addEventListener(egret.Event.ENTER_FRAME, this.loop, this);

            this.gameScreen.btnRestart.addEventListener(egret.TouchEvent.TOUCH_TAP, this.reloadCurrentLevel, this);
            this.gameScreen.btnGo.addEventListener(egret.TouchEvent.TOUCH_TAP, this.changeLevel, this);
            this.gameScreen.btnBack.addEventListener(egret.TouchEvent.TOUCH_TAP, this.navigateToLevel, this);
        }

        public navigateToLevel() {
            this.gameScreen.removeChildren();
            this.sendNotification(SceneCommand.CHANGE, Scene.Level);
        }

        private createWorld(): void {
            const world: p2.World = new p2.World();
            world.sleepMode = p2.World.BODY_SLEEPING;
            world.applyGravity = false;
            world.useFrictionGravityOnZeroGravity = true;
            world.frictionGravity = 0;
            this.world = world;
        }

        private createCueArea(): void {
            const stageWidth: number = egret.MainContext.instance.stage.stageWidth;
            const stageHeight: number = egret.MainContext.instance.stage.stageHeight;
            const wallShape: p2.Box = new p2.Box({
                width: 640,
                height: 280
            });

            const wallBody: p2.Body = new p2.Body();
            console.log(wallBody.type == p2.Body.STATIC);
            wallBody.displays = [];
            wallBody.position[0] = 360;
            wallBody.position[1] = 1080;
            wallBody.addShape(wallShape);
            wallShape.collisionGroup = 0;
            wallShape.collisionMask = 0;

            this.world.addBody(wallBody);
            this.cueArea = wallBody;
        }

        private createMaterial() {
            var wallMaterial = new p2.Material(0)
                , ballMaterial = new p2.Material(0)
                , wallBallContactMaterial = new p2.ContactMaterial(wallMaterial, ballMaterial);

            wallBallContactMaterial.restitution = 1;

            this._wall.upWall.material = wallMaterial;
            this._wall.downWall.material = wallMaterial;
            this._wall.leftWall.material = wallMaterial;
            this._wall.rightWall.material = wallMaterial;

            for (var wallIndex = 0; wallIndex < this._wall.airWallBodys.length; wallIndex++) {
                let wall: p2.Body = this._wall.airWallBodys[wallIndex];
                wall.shapes[0].material = wallMaterial;
            }

            for (var ballIndex = 0; ballIndex < this._ball.ballShapes.length; ballIndex++) {
                var ball = this._ball.ballShapes[ballIndex];
                ball.material = ballMaterial;
            }
            this.world.addContactMaterial(wallBallContactMaterial);
        }

        public async reloadCurrentLevel() {
            this.updateLevel(this.currentLevel);
        }

        public async changeLevel() {
            const level = +this.gameScreen.txtLevel.text;
            if (!level) {
                return;
            }
            this.updateLevel(level - 1);
        }

        public async updateLevel(level: number) {
            if (this._cue) {
                this._cue.cueBody.shapes[1].collisionMask = 0;
            }
            this.currentLevel = level;
            let levelsArray = this.proxy.levelsArray;
            this.currentLevel %= levelsArray.length;
            this._wall.updateConfig(levelsArray[this.currentLevel].walls);
            this._holes.updateConfig(levelsArray[this.currentLevel].holes);
            this._ball.updateConfig(levelsArray[this.currentLevel].balls);
            this._star.updateConfig(levelsArray[this.currentLevel].stars);
        }

        private hitListener() {
            this.world.on("endContact", (t) => {

                this._star.starBodies.forEach(star => {

                });

                this._holes.holes.forEach(hole => {
                    if (t.bodyA === hole || t.bodyB === hole) {
                        this._ball.ballBody.forEach((ballBody, i) => {
                            if (t.bodyA === ballBody || t.bodyB === ballBody) {
                                this.world.removeBody(ballBody);
                                this._ball.removeBallBmp(i);

                                if (this._ball.types[i] == game.BodyType.TYPE_HERO) {
                                    console.log("hero falls in a hole.");
                                    this.updateLevel(this.currentLevel);
                                }
                                else if (this._ball.types[i] == game.BodyType.TYPE_ENEMY) {
                                    console.log("enemy falls in a hole.");
                                    this.updateLevel(this.currentLevel + 1);
                                }
                            }
                        });
                    }
                });

                this._wall.airWallBodys.forEach((i, wallIndex) => {
                    if (this._wall.airWallTypes[wallIndex] == game.BodyType.TYPE_ATTACK_WALL
                        || this._wall.airWallTypes[wallIndex] == game.BodyType.TYPE_ATTACK_MOVING_WALL
                        || this._wall.airWallTypes[wallIndex] == game.BodyType.TYPE_ATTACK_MOVING_WALL_V) {
                        if (t.bodyA === i || t.bodyB === i) {

                            this._ball.ballBody.forEach((m, index) => {
                                if (t.bodyA === m || t.bodyB === m) {
                                    console.log(index, "HP -1");
                                    --this._ball.hps[index];
                                }
                            });

                            if (this._ball.hps.some((hp, index) => (hp <= 0 && this._ball.types[index] == game.BodyType.TYPE_HERO))) {
                                console.log("hero dead.");
                                this.updateLevel(this.currentLevel);
                            }
                            else if (this._ball.hps.some((hp, index) => (hp <= 0 && this._ball.types[index] == game.BodyType.TYPE_ENEMY))) {
                                console.log("enemy dead.");
                                this.updateLevel(this.currentLevel + 1);
                            }
                        }
                    }

                });
            });
        }


        // 创建调试试图
        private createDebug(): void {

            this.debugDraw = new p2DebugDraw(this.world);
            var sprite: egret.Sprite = new egret.Sprite();
            this.gameScreen.stage.addChild(sprite);
            this.debugDraw.setSprite(sprite);
        }


        private mouseStart: Array<number>;
        private mouseMove: Array<number>;
        private mouseEnd: Array<number>;

        private touchEvent(e: egret.TouchEvent) {
            switch (e.type) {
                case egret.TouchEvent.TOUCH_BEGIN: {
                    this._cue.cueBody.shapes[1].collisionMask = 0;

                    if (!this.cueArea.getAABB().containsPoint([e.stageX, e.stageY])) {
                        console.log("TOUCH_BEGIN: outside cueArea, contains point false");
                        return;
                    }

                    console.log("TOUCH_BEGIN");
                    //                if (this.cueBallState == game.CueBallState.CUEBALLVISIBLE) {

                    // if (this._cueBall.cueBallBody) {
                    //     this._cueBall.cueBallBody.sleepState = p2.Body.SLEEPY;
                    // }

                    // if (!this._cue) {
                    //this.stage.addChild(this._cue = new game.Cue(600, 200, this.world));
                    // }

                    this._cue.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchEvent, this);
                    this._cue.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.touchEvent, this);
                    this._cue.addEventListener(egret.TouchEvent.TOUCH_END, this.touchEvent, this);
                    this.createMaterial();
                    //                }

                    this._cue.cueBody.position = [e.stageX, e.stageY];
                    // this._cue.cueGroup.y = e.stageY;
                    this.mouseStart = new Array(e.stageX, e.stageY);
                    //this.mouseStart = new Array(this._cueBall.cueBallBody.position[0], this._cueBall.cueBallBody.position[1]);
                    break;
                }
                case egret.TouchEvent.TOUCH_END: {

                    if (!this.cueArea.getAABB().containsPoint([e.stageX, e.stageY])) {
                        console.log("TOUCH_END: outside cueArea, contains point false");
                        return;
                    }

                    console.log("TOUCH_END");

                    egret.Tween.get(this._cue.cueBmp).to({
                        scaleX: 1.5,
                        scaleY: 1.5
                    }, 500).call(() => {
                        //this.world.removeBody(this._cue.cueBody);
                        //this.stage.removeChild(this._cue);
                        this._cue.cueBody.shapes[1].collisionMask = -1;
                        this._cue.cueBmp.scaleX = 1;
                        this._cue.cueBmp.scaleY = 1;
                        this.cueState = game.CueState.CUEOFF;
                    });
                    this.mouseEnd = new Array(e.stageX, e.stageY);

                    this._ball.ballBody.forEach(ballBody => {
                        let aRedBall = new Array();
                        p2.vec2.subtract(aRedBall, ballBody.position, this.mouseEnd);

                        if (this._cue.cueBody.aabb.containsPoint(ballBody.position)) {
                            if (aRedBall && aRedBall.length > 1) {
                                p2.vec2.scale(aRedBall, aRedBall, 200 / Math.sqrt(aRedBall[0] * aRedBall[0] + aRedBall[1] * aRedBall[1]));
                                ballBody.applyImpulse(aRedBall, this.mouseEnd);
                            }
                        }
                    });
                    this.mouseStart = null;
                    this.mouseEnd = null;
                    break;
                }
                case egret.TouchEvent.TOUCH_MOVE: {
                    if (!this.cueArea.getAABB().containsPoint([e.stageX, e.stageY])) {
                        console.log("TOUCH_MOVE: outside cueArea, contains point false");
                        return;
                    }

                    console.log("TOUCH_MOVE");
                    this._cue.cueBody.position = [e.stageX, e.stageY];
                    // this._cue.cueGroup.y = e.stageY;
                    break;
                }
            }
        }

        private loop(): void {
            this.world.step(60 / 1000);
            this.debugDraw.drawDebug();
            this.world.step(.1),
                this.debugDraw.drawDebug();
            for (var t = 0; t < this.world.bodies.length; t++) {
                var i = this.world.bodies[t]
                    , o = i.displays[0];
                o && (o.x = i.position[0],
                    o.y = i.position[1])
            }

            if (this.cueState != game.CueState.CUEON) {
                if (!this._cue) {
                    this._cue = new game.Cue(200, 600, this.world);
                    this._cue.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.touchEvent, this);
                    this._cue.addEventListener(egret.TouchEvent.TOUCH_END, this.touchEvent, this);
                    // this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchEvent, this);
                    // this.addEventListener(egret.TouchEvent.TOUCH_END, this.touchEvent, this);
                    // this.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.touchEvent, this);
                }
                this.gameScreen.stage.addChild(this._cue);
                this.cueState = game.CueState.CUEON;
            }
        }

        public listNotificationInterests(): Array<any> {
            return [
                GameProxy.PLAYER_UPDATE,
                GameProxy.SEAT_UPDATE,
                GameProxy.FIRST_ONE,
                GameProxy.NEXT_NR,
                GameProxy.TONGZHI,
                GameProxy.BAOWU_TONGZHI,
                GameProxy.TOUPIAO_UI,
                GameProxy.PIAO_SHU,
                GameProxy.ZONG_PIAOSHU,
                GameProxy.START_TWO,
                GameProxy.ONE_YBRSKILL,
                GameProxy.ONE_ZGQSKILL,
                GameProxy.TOUREN,
                GameProxy.TOUREN_JIEGUO,
                GameCommand.JOIN_ROOM,
                GameProxy.START_TOUPIAO_BUTTON,
                GameProxy.ROLEING,
                GameProxy.AUTH_EDN
            ];
        }

        public handleNotification(notification: puremvc.INotification): void {
            var data: any = notification.getBody();
            switch (notification.getName()) {

            }
        }

        public get gameScreen(): GameScreen {
            return this.viewComponent as GameScreen;
        }

        public startGame() {
            this.sendNotification(GameCommand.START_GAME);
        }
    }

}