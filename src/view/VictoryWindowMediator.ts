
module game {

    export class VictoryWindowMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "VictoryWindowMediator";

        private proxy: GameProxy;

        public constructor(viewComponent: any) {
            super(VictoryWindowMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");

            this.proxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;

            this.victoryWindow.addEventListener(egret.Event.ADDED_TO_STAGE, this.initData, this);
            this.victoryWindow.closeButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.navigateToLevelScreen, this);
            this.victoryWindow.btnNext.addEventListener(egret.TouchEvent.TOUCH_TAP, this.nextLevel, this);
            this.victoryWindow.btnShareVictory.addEventListener(egret.TouchEvent.TOUCH_TAP, this.share, this);
            this.victoryWindow.btnRestart.addEventListener(egret.TouchEvent.TOUCH_TAP, this.retryLevel, this);
        }

        public async initData() {

            this.victoryWindow.currentLevelBinding = `第 ${this.proxy.currentLevel + 1} 关`;
            this.victoryWindow.starCount = this.proxy.collectedCount || 0;
            this.victoryWindow.retryBinding = this.victoryWindow.starCount < 3;
            this.victoryWindow.powerUpBinding = this.proxy.shouldPowerUp ? 3 : 0;
            if (this.proxy.shouldPowerUp || this.victoryWindow.retryBinding) {
                this.victoryWindow.groupPower.x = 160;
            }
            else {
                this.victoryWindow.groupPower.x = 250;
            }
            this.victoryWindow.powerLabelBinding = `${+this.proxy.currentPower || 0}/20`;

            this.victoryWindow.imgBanner.visible = false;
            console.log("VictoryWindow initData");

            egret.setTimeout(() => {
                this.victoryWindow.dragonBone.animation.play("vector", 1);

                SoundPool.playSoundEffect("victory-music");

                let vectorCompleted = () => {
                    this.victoryWindow.dragonBone.removeEvent(dragonBones.EventObject.COMPLETE, vectorCompleted, this);
                    this.victoryWindow.dragonBone.animation.play("stop");
                };
                this.victoryWindow.dragonBone.addEventListener(dragonBones.EventObject.COMPLETE, vectorCompleted, this);

            }, this, 300);
        }

        public share(event: egret.TouchEvent) {
            platform.shareAppMessage(null, `targetOpenId=${CommonData.logon && CommonData.logon.openId}&action=victory&level=${this.proxy.currentLevel}&transactionId=${Guid.uuidv4()}`, () => {
                //todo: shareVictory completed.
                console.log("shareVictory completed");
                this.proxy.increasePower(5);
            });
        }

        public retryLevel() {
            SoundPool.playSoundEffect("tap-sound");
            this.victoryWindow.close();
            this.sendNotification(GameCommand.RETRY_LEVEL);
        }

        public navigateToStart() {
            this.sendNotification(SceneCommand.CHANGE, Scene.Start);
        }

        public navigateToLevelScreen(event: egret.TouchEvent) {
            SoundPool.playSoundEffect("tap-sound");
            //Use this command due to some clearance needed.
            this.sendNotification(SceneCommand.NAVIGATE_TO_LEVEL_SCREEN);
        }

        public nextLevel(event: egret.TouchEvent) {
            SoundPool.playSoundEffect("tap-sound");
            this.victoryWindow.close();
            this.sendNotification(GameCommand.NEXT_LEVEL);
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

        public get victoryWindow(): VictoryWindow {
            return this.viewComponent as VictoryWindow;
        }

    }

}