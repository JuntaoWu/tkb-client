
module game {

    export class NoPowerWindowMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "NoPowerWindowMediator";

        private proxy: GameProxy;

        public constructor(viewComponent: any) {
            super(NoPowerWindowMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");

            this.proxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;

            this.noPowerWindow.addEventListener(egret.Event.ADDED_TO_STAGE, this.initData, this);
            this.noPowerWindow.btnVideo.addEventListener(egret.TouchEvent.TOUCH_TAP, this.playVideo, this);
            this.noPowerWindow.closeButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.closeWindow, this);
        }

        public async initData() {
            this.noPowerWindow.contentNoPower.verticalCenter = 0;
        }

        public playVideo(event: egret.TouchEvent) {
            SoundPool.playSoundEffect("tap-sound");
            this.noPowerWindow.close();
            this.noPowerWindow.callback && this.noPowerWindow.callback();
        }

        public closeWindow(event: egret.TouchEvent) {
            SoundPool.playSoundEffect("tap-sound");
        }

        public listNotificationInterests(): Array<any> {
            return [

            ];
        }

        public handleNotification(notification: puremvc.INotification): void {
            var data: any = notification.getBody();
            switch (notification.getName()) {

            }
        }

        public get noPowerWindow(): NoPowerWindow {
            return this.viewComponent as NoPowerWindow;
        }

    }

}