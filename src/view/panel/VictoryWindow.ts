
module game {

    export class VictoryWindow extends game.BasePanel {

        public victoryBackground: eui.Image;
        public groupBanner: eui.Group;
        public dragonBone: dragonBones.EgretArmatureDisplay;
        public imgBanner: eui.Image;
        public groupPower: eui.Group;

        public btnNext: eui.Button;

        public star0: eui.Image;
        public star1: eui.Image;
        public star2: eui.Image;

        private _starCount: number = 0;
        public get starCount(): number {
            return this._starCount;
        }
        public set starCount(v: number) {
            this._starCount = v;
            for (let i = 0; i < 3; ++i) {
                let star = this[`star${i}`] as eui.Image;
                star.source = i < v ? "icon-star-victory" : "icon-star-victory-black";
            }
        }

        //bindings:
        public currentLevelBinding: string = "第 1 关";
        public powerUpBinding: number = 0;
        public powerLabelBinding: string = "0/20";

        public constructor() {
            super();

            this.skinName = "skins.VictoryWindow";
            this.addEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
        }

        public createCompleteEvent(event: eui.UIEvent): void {
            this.removeEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
            ApplicationFacade.instance.registerMediator(new VictoryWindowMediator(this));

            this.dragonBone = DragonBones.createDragonBone("jiesuan", "victory");
            this.dragonBone.x = this.groupBanner.width / 2;
            this.dragonBone.y = this.groupBanner.height / 2 + 106;
            this.groupBanner.addChild(this.dragonBone);
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }
    }

}