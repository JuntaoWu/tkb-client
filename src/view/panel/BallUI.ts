
module game {

    export class BallUI extends eui.Component {

        public name: string = "BallUI";

        // controls:
        public labelBall: eui.Image;
        public imageBall: eui.Image;
        public hpBar: eui.Group;
        public imageHpBar: eui.Image;

        public dragonBone: dragonBones.EgretArmatureDisplay;
        public groupDragonBone: eui.Group;

        //bindings:
        public labelBallBinding: string = "caocao-label";
        public imageBallBinding: string = "caocao";
        public widthBinding: number = 120;
        public hpLabelBinding: string = "3/3";

        public maxHP: number = 3;

        public constructor() {
            super();
            this.skinName = "skins.BallUI";
            this.addEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
        }

        public createCompleteEvent(event: eui.UIEvent): void {
            // this.poweredLabel.y = this.stage.stageHeight - this.poweredLabel.height - 30;

            this.removeEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
            //ApplicationFacade.instance.registerMediator(new BallUIMediator(this));

            this.width = this.widthBinding;
            this.height = this.widthBinding + 50;
            this.imageBall.width = this.widthBinding;
            this.imageBall.height = this.widthBinding;
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }

        public updateUI(source: string, width?: number, maxHP?: number) {
            this.labelBallBinding = `${source}-label`;
            this.imageBallBinding = `${source}`;

            this.widthBinding = width || 120;
            this.maxHP = +maxHP || 3;
            this.hpLabelBinding = `${this.maxHP}/${this.maxHP}`;

            if (source == "caocao") {
                this.dragonBone = DragonBones.createDragonBone("caodead", "caodead");
                // this.dragonBone.anchorOffsetX = this.width / 2;
                // this.dragonBone.anchorOffsetY = this.height / 2;
                this.dragonBone.visible = false;
                this.groupDragonBone.addChild(this.dragonBone);
            }
        }

        public updateHP(hp: number) {
            this.hpLabelBinding = `${hp}/${this.maxHP}`;
        }

        public dead() {
            this.dragonBone.visible = true;
            this.dragonBone.animation.play("caocao", 1);
        }
    }

}