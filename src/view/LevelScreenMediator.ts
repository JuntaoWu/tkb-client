
module game {

    export class LevelScreenMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "LevelScreenMediator";

        private proxy: GameProxy;

        private _currentLevel: number = 0;
        public get currentLevel(): number {
            return this._currentLevel;
        }
        public set currentLevel(v: number) {
            this._currentLevel = v;
            this.levelScreen.currentLevel = `第 ${v + 1} 关`;
        }

        public constructor(viewComponent: any) {
            super(LevelScreenMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");

            this.levelScreen.addEventListener(egret.Event.ADDED_TO_STAGE, this.initData, this);
            this.levelScreen.btnBack.addEventListener(egret.TouchEvent.TOUCH_TAP, this.navigateToStart, this);
        }

        public async initData() {
            console.log("LevelScreen initData");
            this.proxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;
            await this.proxy.initialize();

            this.levelScreen.listLevel.dataProvider = new eui.ArrayCollection([1, 2, 3, 4, 5, 6]);
            this.levelScreen.listLevel.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.navigateToGame, this);
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

        public get levelScreen(): LevelScreen {
            return this.viewComponent as LevelScreen;
        }

    }

}