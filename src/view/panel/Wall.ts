
module game {

    export class Wall extends egret.Sprite {

        public wallBodys = [];

        public upWall: p2.Box;
        public downWall: p2.Box;
        public leftWall: p2.Box;
        public rightWall: p2.Box;

        public airWallBodys = [];
        public airWallTypes: BodyType[] = [];

        public constructor(private world: p2.World, private config: Array<GameObjectInfo> = []) {
            super();
            this.createWall();
        }

        public createWall() {
            //upWall
            var upOneWallConfig = {
                width: 720,
                height: 60
            };
            var e = new p2.Box({
                width: upOneWallConfig.width,
                height: upOneWallConfig.height
            });
            const t = new p2.Body({
                mass: 0,
                position: [upOneWallConfig.width / 2, 180 + upOneWallConfig.height / 2]
            });
            t.addShape(e),
                t.displays = [],
                this.world.addBody(t),
                this.upWall = e,
                this.wallBodys.push(t);

            //downWall
            var a = new p2.Box({
                width: upOneWallConfig.width,
                height: upOneWallConfig.height
            });
            const s = new p2.Body({
                mass: 0,
                position: [upOneWallConfig.width / 2, 1280 - upOneWallConfig.height / 2]
            });
            s.addShape(a),
                s.displays = [],
                this.world.addBody(s),
                this.downWall = a,
                this.wallBodys.push(s);

            //leftWall
            var leftWallConfig = {
                width: 40,
                height: 1100
            };
            var n = new p2.Box({
                width: leftWallConfig.width,
                height: leftWallConfig.height
            });
            const h = new p2.Body({
                mass: 0,
                position: [leftWallConfig.width / 2, 180 + leftWallConfig.height / 2]
            });
            h.displays = [],
                h.addShape(n),
                this.world.addBody(h),
                this.leftWall = n,
                this.wallBodys.push(h);

            //rightWall
            var d = new p2.Box({
                width: 40,
                height: 1100,
            });
            const p = new p2.Body({
                mass: 0,
                position: [720 - leftWallConfig.width / 2, 180 + leftWallConfig.height / 2]
            });
            p.displays = [],
                p.addShape(d),
                this.world.addBody(p),
                this.rightWall = d,
                this.wallBodys.push(p);

            this.updateConfig(this.config);
        }

        public updateConfig(config: Array<GameObjectInfo> = []) {
            this.config = config;

            this.airWallTypes.length = 0;
            this.airWallBodys.forEach(body => {
                body && this.world.removeBody(body);
            });
            this.airWallBodys.length = 0;

            this.config.forEach(airWall => {

                let clone = {
                    width: parseFloat(airWall.width as string) * 100,
                    height: parseFloat(airWall.height as string) * 100,
                    x: parseFloat(airWall.x as string) * 100,
                    y: 1280 - parseFloat(airWall.y as string) * 100,
                };

                //airWall
                var airBox = new p2.Box({
                    width: clone.width,
                    height: clone.height,
                });
                const airBody = new p2.Body({
                    mass: 0,
                    position: [clone.x, clone.y],
                });
                airBody.angle = -airWall.angle;
                airBody.addShape(airBox);
                airBody.displays = [];
                this.world.addBody(airBody);
                this.airWallBodys.push(airBody);
                this.airWallTypes.push(airWall.bodyType);

                if (airWall.bodyType == BodyType.TYPE_MOVING_WALL) {
                    let doSth = () => {
                        if (!airBody) {
                            return;
                        }
                        // var a = new Array();
                        // p2.vec2.subtract(a, airBody.position, [airWall.endX, airWall.endY]);
                        // airBody.applyImpulse(a, airBody.position);

                        let originalPositionX = airBody.position[0];
                        let originalPositionY = airBody.position[1];

                        this.world.on("postStep", () => {
                            // Kinematic bodies are controlled via velocity.
                            airBody.position[0] = originalPositionX + (-100) * Math.sin(2 / 10 * this.world.time);
                            // airBody.position[1] = originalPositionY + (airWall.endY - airWall.y) * Math.sin(2 / 10 * this.world.time);
                        });

                        // egret.Tween.get(airBody).to({ position: [airWall.endX, airWall.endY] }, 1000, egret.Ease.backInOut).to({
                        //     position: [airWall.x, airWall.y]
                        // }, 1000).call(() => {
                        //     doSth();
                        // });
                    }
                    doSth();
                }
            });
        }

    }

}