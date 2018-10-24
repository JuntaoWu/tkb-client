
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
        }

        public async initData() {

            this.victoryWindow.currentLevelBinding = `第 ${this.proxy.currentLevel + 1} 关`;
            this.victoryWindow.starCount = this.proxy.collectedCount || 0;
            this.victoryWindow.powerUpBinding = this.proxy.shouldPowerUp ? 3 : 0;
            if (this.proxy.shouldPowerUp) {
                this.victoryWindow.groupPower.x = 160;
            }
            else {
                this.victoryWindow.groupPower.x = 250;
            }
            this.victoryWindow.powerLabelBinding = `${this.proxy.currentPower}/20`;

            this.victoryWindow.imgBanner.visible = false;
            console.log("VictoryWindow initData");

            egret.setTimeout(() => {
                this.victoryWindow.dragonBone.animation.play("vector", 1);
                this.victoryWindow.dragonBone.addEventListener(dragonBones.EventObject.COMPLETE, () => {
                    // this.victoryWindow.imgBanner.visible = true;
                    this.victoryWindow.dragonBone.animation.play("stop");
                }, this);
            }, this, 300);
        }

        public navigateToStart() {
            this.sendNotification(SceneCommand.CHANGE, Scene.Start);
        }

        public navigateToLevelScreen() {
            //Use this command due to some clearance needed.
            this.sendNotification(SceneCommand.NAVIGATE_TO_LEVEL_SCREEN);
        }

        public navigateToGame() {
            this.sendNotification(GameCommand.START_GAME);
        }

        public nextLevel() {
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