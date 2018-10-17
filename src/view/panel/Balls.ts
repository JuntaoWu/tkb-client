
module game {

    export class Balls extends egret.Sprite {
        public ballShapes = [];
        public ballBody = [];
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
            this.ballBmps.forEach((ballBmp, index) => {
                this.removeBallBmp(index);
            });
            this.ballBmps.length = 0;

            this.config.forEach(ball => {
                let clone = {
                    width: parseFloat(ball.width as string) * 100,
                    height: parseFloat(ball.height as string) * 100,
                    x: parseFloat(ball.x as string) * 100,
                    y: 1100 - parseFloat(ball.y as string) * 100 + 180
                };

                var t = new p2.Circle({
                    radius: clone.width / 2
                })
                    , i = new p2.Body({
                        mass: 1,
                        position: [clone.x, clone.y]
                    });
                i.addShape(t),
                    this.world.addBody(i);

                var o;
                switch (+ball.bodyType) {
                    case BodyType.TYPE_ENEMY:
                        o = new egret.Bitmap(RES.getRes("caocao"));
                        break;
                    case BodyType.TYPE_HERO:
                        o = new egret.Bitmap(RES.getRes("zhangfei"));
                        break;
                    case BodyType.TYPE_MASS:
                        o = new egret.Bitmap(RES.getRes("xiaobin"));
                        break;
                    default:
                        o = new egret.Bitmap(RES.getRes("caocao"));
                        break;
                }
                o.width = o.height = clone.width;
                o.anchorOffsetX = clone.width / 2;
                o.anchorOffsetY = clone.height / 2;
                this.addChild(o);
                i.displays = [o];
                this.ballBmps.push(o);
                this.ballShapes.push(t);
                this.ballBody.push(i);
                this.types.push(ball.bodyType);
                this.hps.push(3);
            });
        }

    }
}