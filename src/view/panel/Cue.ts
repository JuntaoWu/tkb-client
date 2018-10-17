
module game {

    export class Cue extends egret.Sprite {

        public cueGroup: eui.Group;
        public cueBmp: egret.Bitmap;
        public radarBmp: egret.Bitmap;
        public cueBody: p2.Body;

        public constructor(x, y, private world: p2.World) {
            super();
            this.createCue(x, y);
        }

        public clear() {
            this.world.removeBody(this.cueBody);
            this.removeChild(this.cueGroup);
        }

        createCue(x, y) {
            this.cueGroup = new eui.Group();
            this.cueGroup.x = x;
            this.cueGroup.y = y;
            this.cueGroup.width = 110;
            this.cueGroup.height = 110;

            this.radarBmp = new egret.Bitmap(RES.getRes("zhangfei_range")),
                this.radarBmp.anchorOffsetX = 125,
                this.radarBmp.anchorOffsetY = 125,
                this.radarBmp.width = 250,
                this.radarBmp.height = 250,
                this.cueGroup.addChild(this.radarBmp);

            this.cueBmp = new egret.Bitmap(RES.getRes("zhangfei")),
                this.cueBmp.anchorOffsetX = 55,
                this.cueBmp.anchorOffsetY = 55,
                this.cueBmp.width = 110,
                this.cueBmp.height = 110;
            this.cueGroup.addChild(this.cueBmp);

            this.addChild(this.cueGroup);

            var innerCircle = new p2.Circle({
                radius: 55
            });

            innerCircle.collisionMask = 0;

            var e = new p2.Circle({
                radius: 125
            });
            e.collisionGroup = 0;
            e.collisionMask = 0;

            var t = new p2.Body({
                mass: 0,
                position: [x, y]
            });

            t.addShape(e);

            t.addShape(innerCircle);

            t.fixedRotation = true;
            this.world.addBody(t);

            t.displays = [this.cueGroup];

            this.cueBody = t;
        }
    }
}