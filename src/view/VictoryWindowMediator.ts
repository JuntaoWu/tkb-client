
module game {

    export class VictoryWindowMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "VictoryWindowMediator";

        private proxy: GameProxy;

        public constructor(viewComponent: any) {
            super(VictoryWindowMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");

            this.victoryWindow.addEventListener(egret.Event.ADDED_TO_STAGE, this.initData, this);
            this.victoryWindow.closeButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.navigateToStart, this);
        }

        public async initData() {
            console.log("VictoryWindow initData");
            this.proxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;
            await this.proxy.initialize();

            this.victoryWindow.dragonBone.animation.play("vector", 1);
            this.victoryWindow.dragonBone.addEventListener(dragonBones.EventObject.COMPLETE, () => {
                this.victoryWindow.dragonBone.visible = false;
            }, this);
        }

        public navigateToStart() {
            this.sendNotification(SceneCommand.CHANGE, Scene.Start);
        }

        public navigateToGame() {
            this.sendNotification(GameCommand.START_GAME);
        }

        public listNotificationInterests(): Array<any> {
            return [
                GameProxy.PLAYER_UPDATE,
                GameProxy.SEAT_UPDATE,
                GameProxy.FIRST_ONE,
                GameProxy.NEXT_NR,
                GameProxy.TONGZHI,
                GameProxy.BAOWU_TONGZHI,
                GameProxy.TOUPIAO_UI,
                GameProxy.PIAO_SHU,
                GameProxy.ZONG_PIAOSHU,
                GameProxy.START_TWO,
                GameProxy.ONE_YBRSKILL,
                GameProxy.ONE_ZGQSKILL,
                GameProxy.TOUREN,
                GameProxy.TOUREN_JIEGUO,
                GameCommand.JOIN_ROOM,
                GameProxy.START_TOUPIAO_BUTTON,
                GameProxy.ROLEING,
                GameProxy.AUTH_EDN
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