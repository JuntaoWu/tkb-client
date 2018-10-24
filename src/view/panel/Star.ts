
module game {

    export class Stars extends egret.Sprite {
        public starShapes = [];
        public starBodies: p2.Body[] = [];
        public starBmps = [];

        public constructor(private world: p2.World, private config: Array<GameObjectInfo> = []) {
            super();
            this.createStar();
        }

        public createStar() {
            this.updateConfig(this.config);
        }

        public clear() {
            this.starBmps.forEach(ballBmp => {
                ballBmp && this.removeChild(ballBmp);
            });
            this.starBmps.length = 0;
        }

        public removeStarBmp = function (e) {
            if (this.starBmps[e]) {
                this.removeChild(this.starBmps[e]);
                this.starBmps[e] = undefined;
            }
        }

        public updateConfig(config: Array<GameObjectInfo> = []) {
            this.config = config;

            this.starBodies.forEach(body => {
                body && this.world.removeBody(body);
            });
            this.starBodies.length = 0;
            this.starShapes.length = 0;
            this.starBmps.forEach((starBmp, index) => {
                this.removeStarBmp(index);
            });
            this.starBmps.length = 0;

            this.config.forEach(star => {
                let clone = {
                    width: parseFloat(star.width as string) * 100,
                    height: parseFloat(star.height as string) * 100,
                    x: parseFloat(star.x as string) * 100,
                    y: 1100 - parseFloat(star.y as string) * 100 + 180
                };

                var t = new p2.Circle({
                    radius: clone.width / 2
                })
                    , i = new p2.Body({
                        mass: 0,
                        position: [clone.x, clone.y]
                    });
                i.addShape(t),
                    this.world.addBody(i);

                t.collisionResponse = false;

                var o = new egret.Bitmap(RES.getRes("star"));
                o.width = o.height = clone.width;
                o.anchorOffsetX = clone.width / 2;
                o.anchorOffsetY = clone.height / 2;
                this.addChild(o);
                i.displays = [o];
                this.starBmps.push(o);
                this.starShapes.push(t);
                this.starBodies.push(i);
            });
        }

    }
}