
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

        public currentLevelId: string;

        public predefinedAnswer: Answer;
        public currentAnswer: Answer;

        private collectedStar: boolean[] = [false, false, false];

        public constructor(viewComponent: any) {
            super(GameScreenMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");

            this.gameScreen.addEventListener(egret.Event.ADDED_TO_STAGE, this.initData, this);
        }

        public async initData() {
            console.log("GameScreen initData");
            this.proxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;
            await this.proxy.initialize();

            this.currentLevel = this.proxy.currentLevel;

            this.gameScreen.powerLabelBinding = `${this.proxy.currentPower}/20`;

            this.createWorld();
            this.createCueArea();
            this.createDebug();

            this.gameScreen.addChild(this._wall = new game.Wall(this.world, this.proxy.levelsArray[this.currentLevel].walls));
            this.gameScreen.addChild(this._holes = new game.Holes(this.world, this.proxy.levelsArray[this.currentLevel].holes));
            this.gameScreen.addChild(this._ball = new game.Balls(this.world, this.proxy.levelsArray[this.currentLevel].balls));
            this.gameScreen.addChild(this._star = new game.Stars(this.world, this.proxy.levelsArray[this.currentLevel].stars));

            this.gameScreen.addChild(this._cue = new game.Cue(360, 1100, this.world));
            this._cue.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchEvent, this);
            this._cue.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.touchEvent, this);
            this._cue.addEventListener(egret.TouchEvent.TOUCH_END, this.touchEvent, this);

            this.createMaterial();
            this.hitListener();
            this.gameScreen.groupPhysics.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchEvent, this);
            this.gameScreen.groupPhysics.addEventListener(egret.TouchEvent.TOUCH_END, this.touchEvent, this);
            this.gameScreen.groupPhysics.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.touchEvent, this);
            this.gameScreen.addEventListener(egret.Event.ENTER_FRAME, this.loop, this);

            this.gameScreen.btnRestart.addEventListener(egret.TouchEvent.TOUCH_TAP, this.reloadCurrentLevel, this);
            this.gameScreen.btnGo.addEventListener(egret.TouchEvent.TOUCH_TAP, this.changeLevel, this);
            this.gameScreen.btnBack.addEventListener(egret.TouchEvent.TOUCH_TAP, this.navigateToLevelScreen, this);
            this.gameScreen.btnTip.addEventListener(egret.TouchEvent.TOUCH_TAP, this.playPredefinedTips, this);
            this.gameScreen.btnCurrentTip.addEventListener(egret.TouchEvent.TOUCH_TAP, this.playCurrentTips, this);
            this.gameScreen.btnConfirmTip.addEventListener(egret.TouchEvent.TOUCH_TAP, this.confirmTips, this);

            this.gameScreen.toggleSwitch.addEventListener(egret.Event.CHANGE, this.toggleTestMode, this);

            this.loadLevel(this.currentLevel);
        }

        public toggleTestMode(event: egret.Event) {
            this.gameScreen.testMode = this.gameScreen.toggleSwitch.selected;
        }

        public navigateToLevelScreen(event: egret.TouchEvent) {
            SoundPool.playSoundEffect("tap-sound");
            this.backToLevelScreen();
        }

        private backToLevelScreen() {
            this._wall.clear();
            this._ball.clear();
            this._holes.clear();
            this._cue.clear();
            this._star.clear();
            this.world.clear();
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
            var ballBallContactMaterial = new p2.ContactMaterial(ballMaterial, ballMaterial);

            ballBallContactMaterial.friction = 0;
            ballBallContactMaterial.restitution = 1;
            wallBallContactMaterial.friction = 0;
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

            if (this._cue) {
                this._cue.cueBody.shapes[0].material = ballMaterial;
            }

            this.world.addContactMaterial(wallBallContactMaterial);
            this.world.addContactMaterial(ballBallContactMaterial);
        }

        public async reloadCurrentLevel(event: egret.TouchEvent) {
            SoundPool.playSoundEffect("tap-sound");
            this.loadLevel(this.currentLevel);
        }

        public async changeLevel(event: egret.TouchEvent) {
            SoundPool.playSoundEffect("tap-sound");
            const level = +this.gameScreen.txtLevel.text;
            if (!level) {
                return;
            }
            this.proxy.updateLevel(level - 1);
        }

        private async loadLevel(level: number) {

            this.gameScreen.starCount = 0;
            this.collectedStar = [false, false, false];

            if (this._cue) {
                this._cue.clear();
                this._cue = undefined;
            }

            this.gameScreen.addChild(this._cue = new game.Cue(360, 1100, this.world));
            this._cue.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchEvent, this);
            this._cue.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.touchEvent, this);
            this._cue.addEventListener(egret.TouchEvent.TOUCH_END, this.touchEvent, this);

            if (this._cue) {
                this._cue.cueBody.shapes[1].collisionMask = 0;
            }
            this.currentLevel = level;
            let levelsArray = this.proxy.levelsArray;
            this.currentLevel %= levelsArray.length;
            this.currentLevelId = levelsArray[this.currentLevel]._id;
            this._wall.updateConfig(levelsArray[this.currentLevel].walls);
            this._holes.updateConfig(levelsArray[this.currentLevel].holes);
            this._ball.updateConfig(levelsArray[this.currentLevel].balls);
            this._star.updateConfig(levelsArray[this.currentLevel].stars);

            this.createMaterial();
            this.world.time = 0;
            this.predefinedAnswer = levelsArray[this.currentLevel].answer;
        }

        public playPredefinedTips(event: egret.TouchEvent) {
            SoundPool.playSoundEffect("tap-sound");
            this.playTips(this.predefinedAnswer);
        }

        public playCurrentTips(event: egret.TouchEvent) {
            SoundPool.playSoundEffect("tap-sound");
            this.playTips(this.currentAnswer);
        }

        public playTips(answer: Answer) {
            if (!answer) {
                console.log("No answer recorded");
                return;
            }

            const { x, y, time } = answer;

            this.loadLevel(this.currentLevel);

            this._cue.dragonBone.visible = true;
            this._cue.dragonBone.animation.play("hover", 0);
            egret.Tween.get(this._cue.cueBody).to({ position: [x, y] }, 200);

            this.play(x, y, time);
        }

        private postStepAnswer() {
            let cueX = this.cueX;
            let cueY = this.cueY;

            if (!this.started && this.world.time >= this.cueTime) {

                cueX = this.cueX;
                cueY = this.cueY;

                this.started = true;
                console.log("play start:", this.world.time);
                this._cue.cueBody.position = [cueX, cueY];
                this.mouseStart = [cueX, cueY];

                this._cue.dragonBone.animation.play("expoler", 1);
                SoundPool.playSoundEffect("zhangfei-sound");
            }
            if (!this.impulsed && this.world.time >= this.cueTime + 2.1) {
                this.impulsed = true;

                this._cue.cueBody.shapes[1].collisionMask = -1;

                this.mouseEnd = [cueX, cueY];

                this._ball.ballBody.forEach(ballBody => {
                    let aRedBall = new Array();
                    p2.vec2.subtract(aRedBall, ballBody.position, this.mouseEnd);

                    if (this._cue.cueBody.aabb.containsPoint(ballBody.position)) {
                        if (aRedBall && aRedBall.length > 1) {
                            p2.vec2.scale(aRedBall, aRedBall, 200 / Math.sqrt(aRedBall[0] * aRedBall[0] + aRedBall[1] * aRedBall[1]));
                            console.log("applyImpulse: ", this.world.time, aRedBall);
                            ballBody.applyImpulse(aRedBall, this.mouseEnd);
                        }
                    }
                });

                this.mouseStart = null;
                this.mouseEnd = null;

                let onExplorerCompleted = () => {

                    this._cue.dragonBone.removeEventListener(dragonBones.EventObject.COMPLETE, onExplorerCompleted, this);

                    if (this.cueArea.getAABB().containsPoint([cueX, cueY])) {
                        console.log("TOUCH_END: inside cueArea, contains point true");

                        this.collectScore(cueX, cueY, 0);
                    }
                }

                this._cue.dragonBone.addEventListener(dragonBones.EventObject.COMPLETE, onExplorerCompleted, this);
            }
            else if (this.impulsed) {
                if (this._ball.ballBody.some(m => m.world && m.sleepState != p2.Body.SLEEPING)) {
                    return;
                }
                let sleepCount = this._ball.ballBody.filter(m => {
                    return m.sleepState == p2.Body.SLEEPING;
                }).length;
                console.log(`Current sleeping: ${sleepCount}`);

                this.failed();
            }
        }

        private clearState() {
            this.cueTime = 0;
            this.started = false;
            this.impulsed = false;

            if (this.world.has("postStep", this.postStepAnswer)) {
                this.world.off("postStep", this.postStepAnswer);
            }
        }

        private victory() {
            this.clearState();

            if (!this.gameScreen.testMode) {
                egret.setTimeout(() => {
                    this.cueX = 0;
                    this.cueY = 0;
                    this.sendNotification(SceneCommand.SHOW_VICTORY_WINDOW, this.collectedStar.filter(m => m).length);
                }, this, 1000);
            }
            else {
                this.cueX = 0;
                this.cueY = 0;
            }
        }

        private failed() {
            this.clearState();

            this.cueX = 0;
            this.cueY = 0;
            if (!this.gameScreen.testMode) {
                this.sendNotification(SceneCommand.SHOW_FAILED_WINDOW);
            }
        }

        private started: boolean = false;
        private impulsed: boolean = false;
        private cueX: number = 0;
        private cueY: number = 0;
        private cueTime: number = 0;

        private play(x: number, y: number, time: number = 0) {
            this.cueX = x;
            this.cueY = y;
            this.cueTime = time;
            this.started = false;
            this.impulsed = false;
            //play expoler only when not started.
            // let started = false;
            // let impulsed = false;
            // let postStepAnswer = () => {
            //     if (!started && this.world.time >= time) {
            //         started = true;
            //         console.log("play start:", this.world.time);
            //         this._cue.cueBody.position = [x, y];
            //         this.mouseStart = [x, y];

            //         this._cue.dragonBone.animation.play("expoler", 1);
            //         SoundPool.playSoundEffect("zhangfei-sound");
            //     }
            //     if (!impulsed && this.world.time >= time + 2.1) {
            //         impulsed = true;

            //         this._cue.cueBody.shapes[1].collisionMask = -1;
            //         this.cueState = game.CueState.CUEOFF;

            //         this.mouseEnd = new Array(x, y);

            //         this._ball.ballBody.forEach(ballBody => {
            //             let aRedBall = new Array();
            //             p2.vec2.subtract(aRedBall, ballBody.position, this.mouseEnd);

            //             if (this._cue.cueBody.aabb.containsPoint(ballBody.position)) {
            //                 if (aRedBall && aRedBall.length > 1) {
            //                     p2.vec2.scale(aRedBall, aRedBall, 200 / Math.sqrt(aRedBall[0] * aRedBall[0] + aRedBall[1] * aRedBall[1]));
            //                     console.log("applyImpulse: ", this.world.time, aRedBall);
            //                     ballBody.applyImpulse(aRedBall, this.mouseEnd);
            //                 }
            //             }
            //         });

            //         this.mouseStart = null;
            //         this.mouseEnd = null;

            //         let onExplorerCompleted = () => {

            //             this._cue.dragonBone.removeEventListener(dragonBones.EventObject.COMPLETE, onExplorerCompleted, this);

            //             if (this.cueArea.getAABB().containsPoint([x, y])) {
            //                 console.log("TOUCH_END: inside cueArea, contains point true");

            //                 this.collectScore(x, y, 0);
            //             }
            //         }

            //         this._cue.dragonBone.addEventListener(dragonBones.EventObject.COMPLETE, onExplorerCompleted, this);
            //     }
            //     else if (impulsed) {
            //         //this.world.off("postStep", postStepAnswer);
            //         let sleepCount = this.world.bodies.filter(m => {
            //             return m.sleepState == p2.Body.SLEEPING;
            //         }).length;
            //         console.log(`Current sleeping: ${sleepCount}`);
            //     }
            // };
            if (this.world.has("postStep", this.postStepAnswer)) {
                this.world.off("postStep", this.postStepAnswer);
            }
            this.world.on("postStep", this.postStepAnswer, this);
        }

        public confirmTips(event: egret.TouchEvent) {
            let token = localStorage.getItem("token");
            if (platform.env == "prod") {
                token = "";
            }
            var request = new egret.HttpRequest();
            request.responseType = egret.HttpResponseType.TEXT;
            request.open(`${game.Constants.Endpoints.service}level/updateAnswer?token=${token}&id=${this.currentLevelId || ""}`, egret.HttpMethod.POST);
            request.setRequestHeader("Content-Type", "application/json");
            request.send(JSON.stringify({
                answer: this.currentAnswer
            }));
            request.addEventListener(egret.Event.COMPLETE, (event: egret.Event) => {
                console.log(`confirmTips via app server end.`);

                let req = <egret.HttpRequest>(event.currentTarget);
                let res = JSON.parse(req.response);
                if (res.error) {
                    console.error(res.message);
                }
                //todo: Invalid code

                this.predefinedAnswer = this.currentAnswer;
                this.proxy.levelsArray[this.currentLevel].answer = this.predefinedAnswer;

            }, this);
        }

        private hitListener() {

            this.world.on("beginContact", (t) => {
                this._star.starBodies.forEach((star, index) => {
                    if (t.bodyA === star || t.bodyB === star) {

                        this.world.removeBody(star);
                        this._star.removeStarBmp(index);
                        this.collectScore(star.position[0], star.position[1], 1);
                    }
                });

                this._holes.holes.forEach(hole => {
                    if (t.bodyA === hole || t.bodyB === hole) {
                        this._ball.ballBody.forEach((ballBody, i) => {
                            if (t.bodyA === ballBody || t.bodyB === ballBody) {
                                let position = ballBody.position;
                                this.world.removeBody(ballBody);

                                SoundPool.playSoundEffect("dead-sound");

                                if (this._ball.types[i] == game.BodyType.TYPE_HERO) {
                                    console.log("hero falls in a hole.");
                                    this._ball.removeBallBmp(i);

                                    this.failed();
                                }
                                else if (this._ball.types[i] == game.BodyType.TYPE_ENEMY) {
                                    let ballUI = this._ball.ballBmps[i] as BallUI;
                                    ballUI.dead();
                                    this.collectScore(position[0], position[1], 2);
                                    console.log("enemy falls in a hole.");

                                    this.victory();

                                    egret.setTimeout(() => {
                                        this._ball.removeBallBmp(i);
                                    }, this, 1000);
                                }
                                else {
                                    this._ball.removeBallBmp(i);
                                }
                            }
                        });
                    }
                });

                this._wall.wallBodys.forEach((i, wallIndex) => {
                    if (t.bodyA == i || t.bodyB == i) {
                        console.log(t);
                        let ball = t.bodyA == i ? t.bodyB : t.bodyA;
                        let pointX = ball.position[0] + t.contactEquations[0].contactPointA[0];
                        let pointY = ball.position[1] + t.contactEquations[0].contactPointA[1];
                        let dragonBone = DragonBones.createDragonBone("caodead", "hityellow");
                        dragonBone.x = pointX;
                        dragonBone.y = pointY;
                        this.gameScreen.addChild(dragonBone);
                        dragonBone.animation.play("newAnimation", 1);

                        SoundPool.playSoundEffect("hit-sound");

                        let onHitCompleted = () => {
                            dragonBone.removeEventListener(dragonBones.EventObject.COMPLETE, onHitCompleted, this);
                            this.gameScreen.removeChild(dragonBone);
                        };
                        dragonBone.addEventListener(dragonBones.EventObject.COMPLETE, onHitCompleted, this);
                    }
                });

                this._wall.airWallBodys.forEach((i, wallIndex) => {
                    if (t.bodyA === i || t.bodyB === i) {
                        let ball = t.bodyA == i ? t.bodyB : t.bodyA;
                        let pointX = ball.position[0] + t.contactEquations[0].contactPointA[0];
                        let pointY = ball.position[1] + t.contactEquations[0].contactPointA[1];

                        let dragonBone;
                        if (this._wall.airWallTypes[wallIndex] == game.BodyType.TYPE_ATTACK_WALL
                            || this._wall.airWallTypes[wallIndex] == game.BodyType.TYPE_ATTACK_MOVING_WALL
                            || this._wall.airWallTypes[wallIndex] == game.BodyType.TYPE_ATTACK_MOVING_WALL_V) {

                            dragonBone = DragonBones.createDragonBone("caodead", "hitred");
                            dragonBone.x = pointX;
                            dragonBone.y = pointY;
                            this.gameScreen.addChild(dragonBone);
                            dragonBone.animation.play("beici", 1);
                        }
                        else {
                            dragonBone = DragonBones.createDragonBone("caodead", "hityellow");
                            dragonBone.x = pointX;
                            dragonBone.y = pointY;
                            this.gameScreen.addChild(dragonBone);
                            dragonBone.animation.play("newAnimation", 1);

                            SoundPool.playSoundEffect("hit-sound");
                        }
                        let onHitCompleted = () => {
                            dragonBone.removeEventListener(dragonBones.EventObject.COMPLETE, onHitCompleted, this);
                            this.gameScreen.removeChild(dragonBone);
                        };
                        dragonBone.addEventListener(dragonBones.EventObject.COMPLETE, onHitCompleted, this);
                    }
                });
            });

            this.world.on("endContact", (t) => {

                this._wall.airWallBodys.forEach((i, wallIndex) => {
                    if (this._wall.airWallTypes[wallIndex] == game.BodyType.TYPE_ATTACK_WALL
                        || this._wall.airWallTypes[wallIndex] == game.BodyType.TYPE_ATTACK_MOVING_WALL
                        || this._wall.airWallTypes[wallIndex] == game.BodyType.TYPE_ATTACK_MOVING_WALL_V) {
                        if (t.bodyA === i || t.bodyB === i) {

                            this._ball.ballBody.forEach((m, index) => {
                                if (t.bodyA === m || t.bodyB === m) {
                                    console.log(index, "HP -1");
                                    this._ball.updateHP(index, -1);

                                    if (this._ball.hps[index] <= 0) {

                                        SoundPool.playSoundEffect("dead-sound");

                                        if (this._ball.types[index] == game.BodyType.TYPE_HERO) {
                                            console.log("hero dead.");
                                            this.world.removeBody(m);
                                            this._ball.removeBallBmp(index);

                                            this.failed();
                                        }
                                        else if (this._ball.types[index] == game.BodyType.TYPE_ENEMY) {
                                            console.log("enemy dead.");
                                            this.collectScore(m.position[0], m.position[1], 2);
                                            this.world.removeBody(m);
                                            let ballUI = this._ball.ballBmps[index] as BallUI;
                                            ballUI.dead();

                                            this.victory();

                                            egret.setTimeout(() => {
                                                this._ball.removeBallBmp(index);
                                            }, this, 1000);
                                        }
                                        else if (this._ball.types[index] == game.BodyType.TYPE_MASS) {
                                            console.log("mass dead.");
                                            this.world.removeBody(m);
                                            this._ball.removeBallBmp(index);
                                        }
                                    }
                                    else {
                                        SoundPool.playSoundEffect("cut-sound");
                                    }
                                }
                            });
                        }
                    }

                });
            });
        }

        // 创建调试试图
        private createDebug(): void {
            if (platform.env == "dev") {
                this.debugDraw = new p2DebugDraw(this.world);
                var sprite: egret.Sprite = new egret.Sprite();
                this.gameScreen.addChild(sprite);
                this.debugDraw.setSprite(sprite);
            }
        }

        private mouseStart: Array<number>;
        private mouseMove: Array<number>;
        private mouseEnd: Array<number>;

        private collectScore(x: number, y: number, starIndex: number) {

            if (this.collectedStar[starIndex]) {
                return;
            }

            let collectedCount = this.collectedStar.filter(m => m).length;

            this.collectedStar[starIndex] = true;

            let scoreStarUI: ScoreStarUI = this.gameScreen[`scoreStarUI${starIndex}`];

            this.gameScreen.addChild(scoreStarUI);

            scoreStarUI.groupStar.visible = true;
            scoreStarUI.x = x;
            scoreStarUI.y = y;

            scoreStarUI.dragonBone.animation.play("starmove", 1);

            let starmoveComplete = () => {
                scoreStarUI.dragonBone.removeEvent(dragonBones.EventObject.COMPLETE, starmoveComplete, this);
                let star = this.gameScreen[`star${collectedCount}`];
                egret.Tween.get(scoreStarUI).to({ x: star.x + 261 + star.width / 2, y: star.y + 80 + star.height / 2 }, 500).call(() => {
                    scoreStarUI.dragonBone.animation.play("starin", 1);

                    SoundPool.playSoundEffect("star-sound");

                    let starinComplete = () => {
                        scoreStarUI.dragonBone.removeEvent(dragonBones.EventObject.COMPLETE, starinComplete, this);
                        scoreStarUI.groupStar.visible = false;
                        ++this.gameScreen.starCount;
                    };
                    scoreStarUI.dragonBone.once(dragonBones.EventObject.COMPLETE, starinComplete, this);
                });
            };
            scoreStarUI.dragonBone.once(dragonBones.EventObject.COMPLETE, starmoveComplete, this);
        }

        private touchEvent(e: egret.TouchEvent) {
            if (e.stageX < 40 || e.stageX > 680 || e.stageY < 240 || e.stageY > 1220) {
                return;
            }

            switch (e.type) {
                case egret.TouchEvent.TOUCH_BEGIN: {
                    console.log("TOUCH_BEGIN");

                    this._cue.cueBody.shapes[1].collisionMask = 0;
                    this._cue.dragonBone.visible = true;
                    this._cue.dragonBone.animation.play("hover", 0);

                    this.createMaterial();

                    this._cue.cueBody.position = [e.stageX, e.stageY];
                    this.mouseStart = new Array(e.stageX, e.stageY);

                    break;
                }
                case egret.TouchEvent.TOUCH_END: {
                    console.log("TOUCH_END");

                    this.currentAnswer = {
                        time: this.world.time,
                        x: e.stageX,
                        y: e.stageY,
                    };

                    this.play(e.stageX, e.stageY, this.world.time);

                    this.proxy.decreasePower(1);

                    break;
                }
                case egret.TouchEvent.TOUCH_MOVE: {
                    console.log("TOUCH_MOVE");

                    this._cue.cueBody.position = [e.stageX, e.stageY];

                    break;
                }
            }
        }

        private loop(): void {
            this.world.step(60 / 1000);
            if (platform.env == "dev") {
                this.debugDraw.drawDebug();
            }

            this.world.step(.1);
            if (platform.env == "dev") {
                this.debugDraw.drawDebug();
            }
            for (var t = 0; t < this.world.bodies.length; t++) {
                var i = this.world.bodies[t]
                    , o = i.displays[0];
                o && (o.x = i.position[0],
                    o.y = i.position[1])
            }

            if (this.cueState != game.CueState.CUEON) {
                if (!this._cue) {

                    // this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchEvent, this);
                    // this.addEventListener(egret.TouchEvent.TOUCH_END, this.touchEvent, this);
                    // this.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.touchEvent, this);
                }
                this._cue && this.gameScreen.addChild(this._cue);
                this.cueState = game.CueState.CUEON;
            }
        }

        public listNotificationInterests(): Array<any> {
            return [
                GameProxy.LEVEL_UPDATED,
                GameProxy.POWER_CHANGED,
                GameProxy.GAME_DISPOSE,
            ];
        }

        public handleNotification(notification: puremvc.INotification): void {
            var data: any = notification.getBody();
            switch (notification.getName()) {
                case GameProxy.LEVEL_UPDATED: {
                    this.loadLevel(this.proxy.currentLevel);
                    break;
                }
                case GameProxy.POWER_CHANGED: {
                    this.gameScreen.powerLabelBinding = `${this.proxy.currentPower}/20`;
                    break;
                }
                case GameProxy.GAME_DISPOSE: {
                    this.backToLevelScreen();
                    break;
                }
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