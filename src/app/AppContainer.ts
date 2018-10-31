
module game {

    export class AppContainer extends eui.Component {

        public startScreen: StartScreen = new StartScreen();
        public gameScreen: GameScreen = new GameScreen();
        public levelScreen: LevelScreen = new LevelScreen();

        public constructor() {
            super();
            this.alpha = 0;
        }

        /**
         * 进入开始页面
         */
        public enterStartScreen(): void {

            platform.hideAllBannerAds();

            SoundPool.playBGM("background-music");
            // const gameScreen = this.getChildByName("gameScreen");
            // gameScreen && this.removeChild(this.gameScreen);
            this.removeChildren();

            this.addChild(this.startScreen);
            egret.Tween.get(this).to({ alpha: 1 }, 1500);
        }

        public enterLevelScreen(): void {
            this.removeChildren();

            this.addChild(this.levelScreen);
            egret.Tween.get(this).to({ alpha: 1 }, 1500);
        }

        public enterGameScreen(): void {
            platform.hideAllBannerAds();

            this.addChild(this.gameScreen);
            egret.Tween.get(this).to({ alpha: 1 }, 1500);
        }


        private _victoryWindow: VictoryWindow;
        public get victoryWindow(): VictoryWindow {
            if (!this._victoryWindow) {
                this._victoryWindow = new VictoryWindow();
            }
            return this._victoryWindow;
        }

        public showVictoryWindow() {
            this.addChild(this.victoryWindow);
            this.victoryWindow.show(true);
        }

        private _failedWindow: FailedWindow;
        public get failedWindow(): FailedWindow {
            if (!this._failedWindow) {
                this._failedWindow = new FailedWindow();
            }
            return this._failedWindow;
        }

        public showFailedWindow() {
            this.addChild(this.failedWindow);
            this.failedWindow.show(true);
        }

        private _settingsWindow: SettingsWindow;
        public get settingsWindow(): SettingsWindow {
            if (!this._settingsWindow) {
                this._settingsWindow = new SettingsWindow();
            }
            return this._settingsWindow;
        }

        public showSettingsWindow() {
            this.addChild(this.settingsWindow);
            this.settingsWindow.show(true);
        }

        private _rankWindow: RankWindow;
        public get rankWindow(): RankWindow {
            if (!this._rankWindow) {
                this._rankWindow = new RankWindow();
            }
            return this._rankWindow;
        }

        public showRankWindow() {
            this.addChild(this.rankWindow);
            this.rankWindow.show(true);
        }

        private _tipsConfirmWindow: TipsConfirmWindow;
        public get tipsConfirmWindow(): TipsConfirmWindow {
            if (!this._tipsConfirmWindow) {
                this._tipsConfirmWindow = new TipsConfirmWindow();
            }
            return this._tipsConfirmWindow;
        }

        public showTipsConfirmWindow(callback?: Function) {
            this.addChild(this.tipsConfirmWindow);
            this.tipsConfirmWindow.updateCallback(callback);
            this.tipsConfirmWindow.show();
        }

        private _noPowerWindow: NoPowerWindow;
        public get noPowerWindow(): NoPowerWindow {
            if (!this._noPowerWindow) {
                this._noPowerWindow = new NoPowerWindow();
            }
            return this._noPowerWindow;
        }

        public showNoPowerWindow(callback?: Function) {
            this.addChild(this.noPowerWindow);
            this.noPowerWindow.updateCallback(callback);
            this.noPowerWindow.show();
        }

    }
}