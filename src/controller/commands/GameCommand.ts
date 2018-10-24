
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

        public static NEXT_LEVEL: string = "next_level";

        public static CREATE_ROOM: string = "create_room";

        public static JOIN_ROOM: string = "join_room";

        /**
         * 注册消息
         */
        public register(): void {
            this.initializeNotifier("ApplicationFacade");
            this.facade().registerCommand(GameCommand.START_GAME, GameCommand);
            this.facade().registerCommand(GameCommand.CREATE_ROOM, GameCommand);
            this.facade().registerCommand(GameCommand.JOIN_ROOM, GameCommand);
            this.facade().registerCommand(GameCommand.JOIN_SEAT,GameCommand);
            this.facade().registerCommand(GameCommand.CHOOSE_ROLE,GameCommand);
            this.facade().registerCommand(GameCommand.NEXT_LEVEL, GameCommand);
        }

        public static JOIN_SEAT:string = "join_seat";
        public static CHOOSE_ROLE:string = "choose_role";

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
            }
        }
    }
}