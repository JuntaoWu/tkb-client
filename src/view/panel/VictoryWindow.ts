
module game {

    export class VictoryWindow extends game.BasePanel {

        public victoryBackground: eui.Image;
        public groupBanner: eui.Group;
        public dragonBone: dragonBones.EgretArmatureDisplay;

        public constructor() {
            super();

            this.skinName = "skins.VictoryWindow";
            this.addEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
        }

        public createCompleteEvent(event: eui.UIEvent): void {
            this.removeEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
            ApplicationFacade.instance.registerMediator(new VictoryWindowMediator(this));

            this.dragonBone = DragonBones.createDragonBone("jiesuan", "victory");
            // this.dragonBone.anchorOffsetX = this.width / 2;
            // this.dragonBone.anchorOffsetY = this.height / 2;
            this.groupBanner.addChild(this.dragonBone);
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }
    }

}