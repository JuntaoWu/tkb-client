
module game {

    export class StartScreen extends eui.Component {

        public startBackground: eui.Image;

        private poweredLabel: eui.Label;
        private navigationBar: eui.Group;

        public btnRank: eui.Button;
        public btnGuide: eui.Button;
        public btnSetting: eui.Button;
        public btnLeft: eui.Button;
        public btnRight: eui.Button;
        public btnChooseLevel: eui.Button;
        public btnShare: eui.Button;

        public txtOpenId: eui.TextInput;
        public btnOpenId: eui.Button;

        //bindings:
        public powerLabelBinding: string = "0/20";
        public starLabelBinding: string = "0/240";
        public currentStarLabelBinding: string = "0/60"
        public currentChapterLabelBinding: string = "第 1-20 关";

        public constructor() {
            super();

            this.skinName = "skins.StartScreen";
            this.addEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
        }

        public createCompleteEvent(event: eui.UIEvent): void {

            this.txtOpenId.visible = platform.name == "DebugPlatform";
            this.btnOpenId.visible = platform.name == "DebugPlatform";

            this.navigationBar.y = this.stage.stageHeight - this.navigationBar.height;
            // this.poweredLabel.y = this.stage.stageHeight - this.poweredLabel.height - 30;

            this.removeEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
            ApplicationFacade.instance.registerMediator(new StartScreenMediator(this));
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }
    }

}