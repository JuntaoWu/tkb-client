
module game {

    export class GameCommand extends puremvc.SimpleCommand implements puremvc.ICommand {

        public constructor() {
            super();
        }
        public static NAME: string = "GameCommand";

        /**
         * 开始游戏
         */
        public static START_GAME: string = "start_game";

        public static RETRY_LEVEL: string = "retry_level";
        public static NEXT_LEVEL: string = "next_level";

        /**
         * 注册消息
         */
        public register(): void {
            this.initializeNotifier("ApplicationFacade");
            this.facade().registerCommand(GameCommand.START_GAME, GameCommand);
            this.facade().registerCommand(GameCommand.RETRY_LEVEL, GameCommand);
            this.facade().registerCommand(GameCommand.NEXT_LEVEL, GameCommand);
        }

        public async execute(notification: puremvc.INotification): Promise<any> {
            var gameProxy: GameProxy = <GameProxy><any>(this.facade().retrieveProxy(GameProxy.NAME));
            const data = notification.getBody();
            switch (notification.getName()) {
                case GameCommand.START_GAME: {
                    this.sendNotification(SceneCommand.CHANGE, Scene.Game);
                    gameProxy.startGame(+data.level - 1);
                    break;
                }
                case GameCommand.NEXT_LEVEL: {
                    gameProxy.nextLevel();
                    break;
                }
                case GameCommand.RETRY_LEVEL: {
                    gameProxy.retryLevel();
                    break;
                }
            }
        }
    }
}