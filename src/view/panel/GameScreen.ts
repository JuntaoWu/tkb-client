
module game {

    export class GameScreen extends eui.Component {

        public name: string = "GameScreen";

        // controls:
        public gameBackground: eui.Image;
        private poweredLabel: eui.Label;
        public groupPhysics: eui.Group;
        public btnRestart: eui.Button;
        public btnGo: eui.Button;
        public txtLevel: eui.TextInput;

        //bindings:
        public currentLevel: string = "第 1 关";

        public constructor() {
            super();
            this.skinName = "skins.GameScreenSkin";
            this.addEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
        }

        public createCompleteEvent(event: eui.UIEvent): void {
            // this.poweredLabel.y = this.stage.stageHeight - this.poweredLabel.height - 30;

            this.removeEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
            ApplicationFacade.instance.registerMediator(new GameScreenMediator(this));

        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }
    }

}