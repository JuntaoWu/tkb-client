
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

            // SoundPool.playBGM("generic-music_mp3");
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
            this.victoryWindow.show();
        }

    }
}