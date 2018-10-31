
module game {

    export class StartScreenMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "StartScreenMediator";

        private accountProxy: AccountProxy;
        private gameProxy: GameProxy;

        public constructor(viewComponent: any) {
            super(StartScreenMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");

            this.startScreen.addEventListener(egret.Event.ADDED_TO_STAGE, this.initData, this);
            this.startScreen.btnRight.addEventListener(egret.TouchEvent.TOUCH_TAP, this.nextChapter, this);
            this.startScreen.btnLeft.addEventListener(egret.TouchEvent.TOUCH_TAP, this.previousChapter, this);
            this.startScreen.btnChooseLevel.addEventListener(egret.TouchEvent.TOUCH_TAP, this.chooseLevel, this);
            this.startScreen.btnSetting.addEventListener(egret.TouchEvent.TOUCH_TAP, this.showSettingsWindow, this);
            this.startScreen.btnRank.addEventListener(egret.TouchEvent.TOUCH_TAP, this.showRankWindow, this);
            this.startScreen.btnShare.addEventListener(egret.TouchEvent.TOUCH_TAP, this.share, this);
        }

        public async initData() {
            console.log("StartScreen initData:");
            this.accountProxy = this.facade().retrieveProxy(AccountProxy.NAME) as AccountProxy;
            this.gameProxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;

            const userInfo = await this.accountProxy.loadUserInfo();

            await this.gameProxy.initialize();

            this.startScreen.powerLabelBinding = `${+this.gameProxy.currentPower || 0}/20`;
            const collectedStars = _(this.gameProxy.passInfo).sumBy("stars");
            this.startScreen.starLabelBinding = `${+collectedStars || 0}/240`;

            const lowerBound = this.gameProxy.currentChapter * 20;
            const higherBound = lowerBound + 20;
            this.startScreen.currentChapterLabelBinding = `第 ${lowerBound + 1}-${higherBound} 关`;
            const currentChapterCollectedStars = _(this.gameProxy.passInfo.filter((value, index) => index >= lowerBound && index < higherBound)).sumBy("stars");
            this.startScreen.currentStarLabelBinding = `${+currentChapterCollectedStars || 0}/60`;

            const launchInfo = platform.getLaunchInfo();
            if(launchInfo && launchInfo.query && launchInfo.query.targetOpenId) {
                this.accountProxy.sendLaunchAction(launchInfo.query);
                //todo: navigate to friend's level.
                if(launchInfo.query.action == "failed" && launchInfo.query.level) {
                    this.sendNotification(SceneCommand.NAVIGATE_TO_FRIENDS_GAME, launchInfo);
                }
            }
        }

        public share(event: egret.TouchEvent) {
            platform.shareAppMessage(null, `targetOpenId=${CommonData.logon && CommonData.logon.openId}&action=start&transactionId=${Guid.uuidv4()}`, () => {
                //todo: share completed.
                console.log("share completed");
                this.gameProxy.increasePower(5);
            });
        }

        public nextChapter() {
            if (this.gameProxy.currentChapter >= 3) {
                return;
            }

            SoundPool.playSoundEffect("tap-sound");
            ++this.gameProxy.currentChapter;

            const lowerBound = this.gameProxy.currentChapter * 20;
            const higherBound = lowerBound + 20;
            this.startScreen.currentChapterLabelBinding = `第 ${lowerBound + 1}-${higherBound} 关`;
            const currentChapterCollectedStars = _(this.gameProxy.passInfo.filter((value, index) => index >= lowerBound && index < higherBound)).sumBy("stars");
            this.startScreen.currentStarLabelBinding = `${+currentChapterCollectedStars || 0}/60`;
        }

        public previousChapter() {

            if (this.gameProxy.currentChapter <= 0) {
                return;
            }

            SoundPool.playSoundEffect("tap-sound");
            --this.gameProxy.currentChapter;

            const lowerBound = this.gameProxy.currentChapter * 20;
            const higherBound = lowerBound + 20;
            this.startScreen.currentChapterLabelBinding = `第 ${lowerBound + 1}-${higherBound} 关`;
            const currentChapterCollectedStars = _(this.gameProxy.passInfo.filter((value, index) => index >= lowerBound && index < higherBound)).sumBy("stars");
            this.startScreen.currentStarLabelBinding = `${+currentChapterCollectedStars || 0}/60`;
        }

        public chooseLevel() {
            SoundPool.playSoundEffect("tap-sound");
            this.sendNotification(SceneCommand.CHANGE, Scene.Level);
        }

        public async changeOpenIdClick(event: egret.TouchEvent) {
            event.stopImmediatePropagation();
            await this.gameProxy.initialize();
        }

        public viewMoreClick(event: egret.TouchEvent) {
            let imgList = [
                "https://gdjzj.hzsdgames.com:8084/miniGame/resource/assets/start/qrcode-tk2048.jpg"
            ]
            platform.showPreImage(imgList);
        }

        public showSettingsWindow(event: egret.TouchEvent) {
            this.sendNotification(SceneCommand.SHOW_SETTINGS_WINDOW);
        }
        public showRankWindow() {
            SoundPool.playSoundEffect("tap-sound");
            this.sendNotification(SceneCommand.SHOW_RANK_WINDOW);
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
                    this.startScreen.powerLabelBinding = `${+this.gameProxy.currentPower || 0}/20`;
                    break;
                }
                case GameProxy.STAR_CHANGED: {
                    const collectedStars = _(this.gameProxy.passInfo).sumBy("stars");
                    this.startScreen.starLabelBinding = `${+collectedStars || 0}/240`;
                    const lowerBound = this.gameProxy.currentChapter * 20;
                    const higherBound = lowerBound + 20;
                    this.startScreen.currentChapterLabelBinding = `第 ${lowerBound + 1}-${higherBound} 关`;
                    const currentChapterCollectedStars = _(this.gameProxy.passInfo.filter((value, index) => index >= lowerBound && index < higherBound)).sumBy("stars");
                    this.startScreen.currentStarLabelBinding = `${+currentChapterCollectedStars || 0}/60`;
                }
            }
        }

        public get startScreen(): StartScreen {
            return <StartScreen><any>(this.viewComponent);
        }
    }

}