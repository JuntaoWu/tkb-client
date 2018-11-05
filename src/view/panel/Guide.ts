
module game {

    export class Guide extends eui.Component {

        public level0: eui.Group;
        public level0Completed: eui.Group;
        public level1: eui.Group;
        public level2: eui.Group;
        public level3: eui.Group;

        //bindings:
        public callback: Function;

        public constructor() {
            super();

            this.skinName = "skins.Guide";
            this.addEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
        }

        public createCompleteEvent(event: eui.UIEvent): void {
            this.removeEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
            this.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
                egret.setTimeout(() => {
                    this.visible = false;
                    this.callback && this.callback();
                }, this, 300);
            }, this);
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }

        public updateLevel(level: number, callback?: Function) {
            if (platform.name == "DebugPlatform") {
                return;
            }
            this.callback = callback;
            this.parent.addChild(this);
            for (let i = 0; i < 4; ++i) {
                if (this[`level${i}`]) {
                    (this[`level${i}`] as eui.Group).visible = false;
                }
                if (this[`level${i}Completed`]) {
                    (this[`level${i}Completed`] as eui.Group).visible = false;
                }
            }
            switch (level / 20) {
                case 0: {
                    this.level0.visible = !callback;
                    this.level0Completed.visible = !!callback;
                    break;
                }
                case 1: {
                    this.level1.visible = true;
                    break;
                }
                case 2: {
                    this.level2.visible = true;
                    break;
                }
                case 3: {
                    this.level3.visible = true;
                    break;
                }
            }
        }

    }

}