
module game {

    export class AppContainer extends eui.UILayer {

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

    }
}