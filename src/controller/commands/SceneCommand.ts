
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
        public static NAVIGATE_TO_LEVEL_SCREEN: string = "navigate_to_level_screen";

        public register(): void {
            this.initializeNotifier("ApplicationFacade");
        }

        initializeNotifier(key: string) {
            super.initializeNotifier(key);
            this.facade().registerCommand(SceneCommand.CHANGE, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_VICTORY_WINDOW, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_FAILED_WINDOW, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_SETTINGS_WINDOW, SceneCommand);
            this.facade().registerCommand(SceneCommand.NAVIGATE_TO_LEVEL_SCREEN, SceneCommand);
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
            }
        }
    }
}