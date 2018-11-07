
module game {

    export class FailedWindowMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "FailedWindowMediator";

        private proxy: GameProxy;

        public constructor(viewComponent: any) {
            super(FailedWindowMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");

            this.proxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;

            this.failedWindow.addEventListener(egret.Event.ADDED_TO_STAGE, this.initData, this);
            this.failedWindow.closeButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.navigateToLevelScreen, this);
            this.failedWindow.btnRetry.addEventListener(egret.TouchEvent.TOUCH_TAP, this.retryLevel, this);
            this.failedWindow.btnShareFailed.addEventListener(egret.TouchEvent.TOUCH_TAP, this.shareFailed, this);

            // egret.ExternalInterface.addCallback("sendToJS", (message) => {
            //     egret.log("message form native : " + message);//message form native : message from native
            //     AccountAdapter.login();
            // });
        }

        public async initData() {

            this.failedWindow.powerUpBinding = this.proxy.currentPower <= 0;
            if (this.failedWindow.powerUpBinding) {
                this.failedWindow.groupPower.x = 160;
            }
            else {
                this.failedWindow.groupPower.x = 250;
            }
            this.failedWindow.powerLabelBinding = `${+this.proxy.currentPower || 0}/20`;

            this.failedWindow.imgBanner.visible = false;
            console.log("FailedWindow initData");

            egret.setTimeout(() => {
                this.failedWindow.dragonBone.animation.play("fail", 1);

                SoundPool.playSoundEffect("failed-music");

                let vectorCompleted = () => {
                    this.failedWindow.dragonBone.removeEvent(dragonBones.EventObject.COMPLETE, vectorCompleted, this);
                    this.failedWindow.dragonBone.animation.play("fstop");
                };
                this.failedWindow.dragonBone.addEventListener(dragonBones.EventObject.COMPLETE, vectorCompleted, this);

            }, this, 300);
        }

        public shareFailed(event: egret.TouchEvent) {
            this.failedWindow.close();

            //egret.ExternalInterface.call("sendWxLoginToNative", "message from js");

            // if (1 == 1) {
            //     return;
            // }

            this.sendNotification(GameCommand.CREATE_ONLINE_GAME, CommonData.logon && CommonData.logon.openId);

            egret.setTimeout(() => {
                platform.shareAppMessage(null, `targetOpenId=${CommonData.logon && CommonData.logon.openId}&action=failed&level=${this.proxy.currentLevel}&transactionId=${Guid.uuidv4()}`, () => {
                    //todo: shareFailed completed.
                    console.log("shareFailed completed");
                    this.proxy.increasePower(5);

                    this.sendNotification(GameCommand.CREATE_ONLINE_GAME, CommonData.logon && CommonData.logon.openId);
                });
            }, this, 300);
        }

        public navigateToStart() {
            this.sendNotification(SceneCommand.CHANGE, Scene.Start);
        }

        public navigateToLevelScreen(event: egret.TouchEvent) {
            SoundPool.playSoundEffect("tap-sound");
            //Use this command due to some clearance needed.
            this.sendNotification(SceneCommand.NAVIGATE_TO_LEVEL_SCREEN);
        }

        public retryLevel(event: egret.TouchEvent) {
            SoundPool.playSoundEffect("tap-sound");
            this.failedWindow.close();
            this.sendNotification(GameCommand.RETRY_LEVEL);
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

        public get failedWindow(): FailedWindow {
            return this.viewComponent as FailedWindow;
        }

    }

}