
module game {

    export class Balls extends egret.Sprite {
        public ballShapes = [];
        public ballBody: p2.Body[] = [];
        public ballBmps = [];

        public types: BodyType[] = [];
        public hps: number[] = [];

        public constructor(private world: p2.World, private config: Array<GameObjectInfo> = []) {
            super();
            this.createBall();
        }

        public createBall() {
            this.updateConfig(this.config);
        }

        public clear() {
            this.ballBmps.forEach(ballBmp => {
                ballBmp && this.removeChild(ballBmp);
            });
            this.ballBmps.length = 0;
        }

        public removeBallBmp = function (e) {
            if (this.ballBmps[e]) {
                this.removeChild(this.ballBmps[e]);
                this.ballBmps[e] = undefined;
            }
        }

        public updateConfig(config: Array<GameObjectInfo> = []) {
            this.config = config;

            this.types.length = 0;
            this.hps.length = 0;

            this.ballBody.forEach(body => {
                body && this.world.removeBody(body);
            });
            this.ballBody.length = 0;
            this.ballShapes.length = 0;
            this.clear();

            this.config.forEach(ball => {
                let clone = {
                    width: parseFloat(ball.width as string) * 100,
                    height: parseFloat(ball.height as string) * 100,
                    x: parseFloat(ball.x as string) * 100,
                    y: 1100 - parseFloat(ball.y as string) * 100 + 180
                };

                var t = new p2.Circle({
                    radius: clone.width / 2
                });
                var i = new p2.Body({
                    mass: 1,
                    position: [clone.x, clone.y],
                });
                //i.allowSleep = false;
                i.sleepTimeLimit = 10;

                i.addShape(t);
                this.world.addBody(i);

                const o = new game.BallUI();
                switch (+ball.bodyType) {
                    case BodyType.TYPE_ENEMY:
                        o.updateUI("caocao", clone.width, +ball.hp);
                        break;
                    case BodyType.TYPE_HERO:
                        o.updateUI("liubei", clone.width, +ball.hp);
                        break;
                    case BodyType.TYPE_MASS:
                        o.updateUI("xiaobin", clone.width, +ball.hp);
                        break;
                    default:
                        o.updateUI("caocao", clone.width, +ball.hp);
                        break;
                }
                o.anchorOffsetX = clone.width / 2;
                o.anchorOffsetY = clone.height / 2 + 25;
                this.addChild(o);
                i.displays = [o];
                this.ballBmps.push(o);
                this.ballShapes.push(t);
                this.ballBody.push(i);
                this.types.push(ball.bodyType);
                this.hps.push(+ball.hp || 3);
            });
        }

        public updateHP(index, hp) {
            this.hps[index] += (+hp);
            this.ballBmps[index] && (this.ballBmps[index] as BallUI).updateHP(this.hps[index]);
        }

    }
}