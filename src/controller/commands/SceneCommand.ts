
module game {

    export class SceneCommand extends puremvc.SimpleCommand implements puremvc.ICommand {

        public constructor() {
            super();
        }
        public static NAME: string = "SceneCommand";

        /**
         * 切换场景
         */
        public static CHANGE: string = "scene_change";

        public static SHOW_VICTORY_WINDOW: string = "show_victory_window";
        public static SHOW_FAILED_WINDOW: string = "show_failed_window";
        public static SHOW_SETTINGS_WINDOW: string = "show_settings_window";
        public static SHOW_RANK_WINDOW: string = "show_rank_window";
        public static SHOW_TIPS_CONFIRM_WINDOW: string = "show_tips_confirm_window";
        public static SHOW_NO_POWER_WINDOW: string = "show_no_power_window";
        public static NAVIGATE_TO_LEVEL_SCREEN: string = "navigate_to_level_screen";
        public static NAVIGATE_TO_FRIENDS_GAME: string = "navigate_to_friends_game";

        public register(): void {
            this.initializeNotifier("ApplicationFacade");
        }

        initializeNotifier(key: string) {
            super.initializeNotifier(key);
            this.facade().registerCommand(SceneCommand.CHANGE, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_VICTORY_WINDOW, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_FAILED_WINDOW, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_SETTINGS_WINDOW, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_RANK_WINDOW, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_TIPS_CONFIRM_WINDOW, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_NO_POWER_WINDOW, SceneCommand);
            this.facade().registerCommand(SceneCommand.NAVIGATE_TO_LEVEL_SCREEN, SceneCommand);
            this.facade().registerCommand(SceneCommand.NAVIGATE_TO_FRIENDS_GAME, SceneCommand);
        }

        public async execute(notification: puremvc.INotification): Promise<any> {
            const data = notification.getBody();
            const appMediator: ApplicationMediator = this.facade().retrieveMediator(ApplicationMediator.NAME) as ApplicationMediator;
            const gameProxy: GameProxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;

            switch (notification.getName()) {
                case SceneCommand.CHANGE: {
                    if (data == Scene.Start) {
                        appMediator.main.enterStartScreen();
                    }
                    else if (data == Scene.Level) {
                        appMediator.main.enterLevelScreen();
                    }
                    else if (data == Scene.Game) {
                        appMediator.main.enterGameScreen();
                    }
                    break;
                }
                case SceneCommand.SHOW_VICTORY_WINDOW: {
                    gameProxy.setResult(data);
                    appMediator.main.showVictoryWindow();
                    break;
                }
                case SceneCommand.SHOW_FAILED_WINDOW: {
                    gameProxy.setResult(0);
                    appMediator.main.showFailedWindow();
                    break;
                }
                case SceneCommand.NAVIGATE_TO_LEVEL_SCREEN: {
                    gameProxy.disposeGame();
                    break;
                }
                case SceneCommand.SHOW_SETTINGS_WINDOW: {
                    appMediator.main.showSettingsWindow();
                    break;
                }
                case SceneCommand.SHOW_RANK_WINDOW: {
                    appMediator.main.showRankWindow();
                    break;
                }
                case SceneCommand.SHOW_TIPS_CONFIRM_WINDOW: {
                    appMediator.main.showTipsConfirmWindow(data);
                    break;
                }
                case SceneCommand.SHOW_NO_POWER_WINDOW: {
                    appMediator.main.showNoPowerWindow(data);
                    break;
                }
                case SceneCommand.NAVIGATE_TO_FRIENDS_GAME: {
                    gameProxy.setLaunchInfo(data);
                    appMediator.main.enterGameScreen();
                    break;
                }
            }
        }
    }
}