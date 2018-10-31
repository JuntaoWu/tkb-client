
module game {

    export class TipsConfirmWindowMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "TipsConfirmWindowMediator";

        private proxy: GameProxy;

        public constructor(viewComponent: any) {
            super(TipsConfirmWindowMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");

            this.proxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;

            this.tipsConfirmWindow.addEventListener(egret.Event.ADDED_TO_STAGE, this.initData, this);
            this.tipsConfirmWindow.btnConfirm.addEventListener(egret.TouchEvent.TOUCH_TAP, this.playTips, this);
            this.tipsConfirmWindow.closeButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.closeWindow, this);
        }

        public async initData() {
            this.tipsConfirmWindow.powerLabelBinding = `${+this.proxy.currentPower || 0}/20`;
        }

        public playTips(event: egret.TouchEvent) {
            SoundPool.playSoundEffect("tap-sound");
            this.tipsConfirmWindow.close();
            this.tipsConfirmWindow.callback && this.tipsConfirmWindow.callback();
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

        public get tipsConfirmWindow(): TipsConfirmWindow {
            return this.viewComponent as TipsConfirmWindow;
        }

    }

}