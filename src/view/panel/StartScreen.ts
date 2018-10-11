
module game {

    export class StartScreen extends eui.Component {

        public startBackground: eui.Image;

        private poweredLabel: eui.Label;
        private navigationBar: eui.Group;

        public txtOpenId: eui.TextInput;
        public btnChangeOpenId: eui.Button;

        public btnCreateRoom: eui.Button;
        public btnJoinRoom: eui.Button;
        public btnViewMore: eui.Button;

        public headGroup: eui.Group;
        public contentScroller: eui.Scroller;

        public btnNotice: eui.Button;
        public btnRank: eui.Button;
        public btnGuide: eui.Button;
        public btnSetting: eui.Button;

        public nickName: string = "nickName";
        public avatarUrl: string = "btn-share";
        public isDebugPlatform: boolean = false;
        public isWxPlatform: boolean = true;
        public roomNum: string = "";

        public constructor() {
            super();

            this.skinName = "skins.StartScreen";
            this.addEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
        }

        public createCompleteEvent(event: eui.UIEvent): void {
            this.navigationBar.y = this.stage.stageHeight - this.navigationBar.height - 10;
            // this.poweredLabel.y = this.stage.stageHeight - this.poweredLabel.height - 30;
            this.contentScroller.height = this.stage.stageHeight - this.navigationBar.height - this.headGroup.height - 40;

            this.removeEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
            ApplicationFacade.instance.registerMediator(new StartScreenMediator(this));
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }
    }
    
}