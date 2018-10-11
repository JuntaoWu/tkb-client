module game {

    export class Holes extends egret.Sprite {

        public holes: p2.Body[] = [];

        public constructor(private world: p2.World, private config: Array<GameObjectInfo> = []) {
            super();
            this.createHoles();
        }

        public createHoles() {
            this.updateConfig(this.config);
        }

        public updateConfig(config: Array<GameObjectInfo> = []) {
            this.config = config;
            this.holes.forEach(body => {
                this.world.removeBody(body);
            });
            this.holes.length = 0;

            this.config.forEach(hole => {

                let clone = {
                    width: parseFloat(hole.width as string) * 100,
                    height: parseFloat(hole.height as string) * 100,
                    x: parseFloat(hole.x as string) * 100,
                    y: 1100 - parseFloat(hole.y as string) * 100 + 180
                };

                var circle6 = new p2.Circle({
                    radius: clone.width / 2
                });
                var body = new p2.Body({
                    mass: 0,
                    position: [clone.x, clone.y]
                });
                body.addShape(circle6);

                var o;
                o = new egret.Bitmap(RES.getRes("trap"));
                o.width = o.height = clone.width;
                o.anchorOffsetX = clone.width / 2;
                o.anchorOffsetY = clone.height / 2;
                this.addChild(o);
                body.displays = [o];

                this.world.addBody(body);
                this.holes.push(body);
            });
        }
    }

}