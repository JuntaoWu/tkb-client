
module game {

    export class LevelScreen extends eui.Component {

        public name: string = "LevelScreen";

        // controls:
        public listLevel: eui.List;
        public btnBack: eui.Button;

        //bindings:
        public currentLevel: string = "第 1 关";

        public constructor() {
            super();
            this.skinName = "skins.LevelScreen";
            this.addEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
        }

        public createCompleteEvent(event: eui.UIEvent): void {
            // this.poweredLabel.y = this.stage.stageHeight - this.poweredLabel.height - 30;

            this.removeEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
            ApplicationFacade.instance.registerMediator(new LevelScreenMediator(this));

        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }
    }

}