
module game {

    export class ScoreStarUI extends eui.Component {

        public name: string = "ScoreStarUI";

        // controls:
        public groupStar: eui.Group;
        public dragonBone: dragonBones.EgretArmatureDisplay;

        //bindings:

        public constructor() {
            super();
            this.skinName = "skins.ScoreStarUI";
            this.addEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
        }

        public createCompleteEvent(event: eui.UIEvent): void {
            // this.poweredLabel.y = this.stage.stageHeight - this.poweredLabel.height - 30;

            this.removeEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
            //ApplicationFacade.instance.registerMediator(new BallUIMediator(this));
            this.dragonBone = DragonBones.createDragonBone("stars", "Armature");
            this.anchorOffsetX = this.width / 2;
            this.anchorOffsetY = this.height / 2;
            this.groupStar.addChild(this.dragonBone);
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }

    }

}