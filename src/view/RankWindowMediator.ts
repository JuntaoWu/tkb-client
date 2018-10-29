
module game {

    export class RankWindowMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "RankWindowMediator";

        private proxy: GameProxy;
        private accountProxy: AccountProxy;

        public constructor(viewComponent: any) {
            super(RankWindowMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");

            this.proxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;
            this.accountProxy = this.facade().retrieveProxy(AccountProxy.NAME) as AccountProxy;

            this.rankWindow.addEventListener(egret.Event.ADDED_TO_STAGE, this.initData, this);
            this.rankWindow.closeButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.closeWindow, this);
        }

        public async initData() {

            try {
                let result = await this.accountProxy.loadRankList();
                let myRank = await this.accountProxy.loadMyRank();

                if (!result || result.error) {
                    return;
                }

                let rankList = result.map((rank, index) => {
                    return {
                        avatarUrl: rank.avatarUrl,
                        nickName: rank.nickName,
                        score: rank.score,
                        rankRes: index < 3 ? `rank-${index + 1}` : null,
                        rankLabel: index >= 3 ? index + 1 : null
                    };
                });
                this.rankWindow.listRank.dataProvider = new eui.ArrayCollection(rankList);
                this.rankWindow.listRank.itemRenderer = RankItemRenderer;
                this.rankWindow.listRank.dataProviderRefreshed();

                if (!myRank) {
                    const userInfo = await this.accountProxy.loadUserInfo();
                    myRank = {
                        avatarUrl: userInfo.avatarUrl,
                        nickName: userInfo.nickName,
                        score: this.proxy.collectedCount,
                        rankLabel: ""
                    }
                }
                this.rankWindow.update(myRank);


            } catch (error) {

            }
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

        public get rankWindow(): RankWindow {
            return this.viewComponent as RankWindow;
        }

    }

}