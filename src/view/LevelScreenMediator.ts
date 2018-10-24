
module game {

    export class LevelScreenMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "LevelScreenMediator";

        private proxy: GameProxy;

        public currentPage: number = 0;

        public constructor(viewComponent: any) {
            super(LevelScreenMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");

            this.levelScreen.addEventListener(egret.Event.ADDED_TO_STAGE, this.initData, this);
            this.levelScreen.btnBack.addEventListener(egret.TouchEvent.TOUCH_TAP, this.navigateToStart, this);
            this.levelScreen.btnLeft.addEventListener(egret.TouchEvent.TOUCH_TAP, this.previousPage, this);
            this.levelScreen.btnRight.addEventListener(egret.TouchEvent.TOUCH_TAP, this.nextPage, this);

        }

        public async initData() {
            console.log("LevelScreen initData");
            this.proxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;
            await this.proxy.initialize();

            this.refresh();
            this.levelScreen.listLevel.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.navigateToGame, this);
        }

        public refresh() {
            this.levelScreen.powerLabelBinding = `${this.proxy.currentPower}/20`;
            const lowerBound = this.proxy.currentChapter * 20;
            const higherBound = lowerBound + 20;
            this.levelScreen.currentChapterLabelBinding = `第 ${lowerBound + 1}-${higherBound} 关`;
            const currentCollectedStars = _(this.proxy.passInfo.filter((value) => value)).sumBy("stars");
            const currentChapterCollectedStars = _(this.proxy.passInfo.filter((value, index) => index >= lowerBound && index < higherBound)).sumBy("stars");
            this.levelScreen.currentStarLabelBinding = `${currentChapterCollectedStars}/60`;

            this.currentPage = Math.floor((this.proxy.currentLevel % 20) / 6);
            const currentPageLowerBound = this.currentPage * 6;
            const currentPageHigherBound = currentPageLowerBound + 6;

            let currentPageArray = [];
            for (let i = currentPageLowerBound; i < currentPageHigherBound && i < 20; ++i) {
                let level = this.proxy.currentChapter * 20 + i;
                currentPageArray.push({
                    level: level + 1,
                    stars: this.proxy.passInfo[level] && this.proxy.passInfo[level].stars || 0,
                    isLocked: ((i != 0 && !this.proxy.passInfo[this.proxy.currentChapter * 20]) || currentCollectedStars < 3 * (level + 1) - 10),
                    isPlayed: !!this.proxy.passInfo[level]
                });
            }

            this.levelScreen.listLevel.dataProvider = new eui.ArrayCollection(currentPageArray);
            this.levelScreen.listLevel.itemRenderer = LevelItemRenderer;
        }

        private refreshItems() {
            const currentPageLowerBound = this.currentPage * 6;
            const currentPageHigherBound = currentPageLowerBound + 6;

            const currentCollectedStars = _(this.proxy.passInfo.filter((value) => value)).sumBy("stars");

            let currentPageArray = [];
            for (let i = currentPageLowerBound; i < currentPageHigherBound && i < 20; ++i) {
                let level = this.proxy.currentChapter * 20 + i;
                currentPageArray.push({
                    level: level + 1,
                    stars: this.proxy.passInfo[level] && this.proxy.passInfo[level].stars || 0,
                    isLocked: ((i != 0 && !this.proxy.passInfo[this.proxy.currentChapter * 20]) || currentCollectedStars < 3 * (level + 1) - 10),
                    isPlayed: !!this.proxy.passInfo[level]
                });
            }

            this.levelScreen.listLevel.dataProvider = new eui.ArrayCollection(currentPageArray);
            this.levelScreen.listLevel.itemRenderer = LevelItemRenderer;
            this.levelScreen.listLevel.dataProviderRefreshed();
        }

        public previousPage() {
            if (this.currentPage <= 0) {
                return;
            }
            --this.currentPage;
            this.refreshItems();
        }

        public nextPage() {
            if (this.currentPage >= 3) {
                return;
            }
            ++this.currentPage;
            this.refreshItems();
        }

        public navigateToStart() {
            this.sendNotification(SceneCommand.CHANGE, Scene.Start);
        }

        public navigateToGame(event: eui.ItemTapEvent) {
            if (event.item.isLocked) {
                event.stopImmediatePropagation();
                return;
            }
            this.sendNotification(GameCommand.START_GAME, event.item);
        }

        public listNotificationInterests(): Array<any> {
            return [
                GameProxy.POWER_CHANGED,
                GameProxy.STAR_CHANGED,
            ];
        }

        public handleNotification(notification: puremvc.INotification): void {
            var data: any = notification.getBody();
            switch (notification.getName()) {
                case GameProxy.POWER_CHANGED: {
                    this.levelScreen.powerLabelBinding = `${this.proxy.currentPower}/20`;
                    break;
                }
                case GameProxy.STAR_CHANGED: {
                    this.refresh();
                    break;
                }
            }
        }

        public get levelScreen(): LevelScreen {
            return this.viewComponent as LevelScreen;
        }

    }

}