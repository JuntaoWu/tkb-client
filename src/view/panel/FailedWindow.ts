
module game {

    export class FailedWindow extends game.BasePanel {

        public failedBackground: eui.Image;
        public groupBanner: eui.Group;
        public dragonBone: dragonBones.EgretArmatureDisplay;
        public imgBanner: eui.Image;
        public groupPower: eui.Group;

        public btnRetry: eui.Button;
        public btnShareFailed: eui.Button;

        //bindings:
        public currentLevelBinding: string = "第 1 关";
        public powerUpBinding: boolean = false;
        public powerLabelBinding: string = "0/20";
        public isVideoAvailable: boolean = false;

        public constructor() {
            super();

            this.skinName = "skins.FailedWindow";
            this.addEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
        }

        public createCompleteEvent(event: eui.UIEvent): void {
            this.removeEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
            ApplicationFacade.instance.registerMediator(new FailedWindowMediator(this));

            this.dragonBone = DragonBones.createDragonBone("jiesuan", "failed");
            this.dragonBone.x = this.groupBanner.width / 2;
            this.dragonBone.y = this.groupBanner.height / 2 + 106;
            this.groupBanner.addChild(this.dragonBone);
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }
    }

}