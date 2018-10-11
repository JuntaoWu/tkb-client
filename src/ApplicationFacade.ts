

module game {

    export class ApplicationFacade extends puremvc.Facade implements puremvc.IFacade {

        private static _instance: ApplicationFacade;
        public static get instance(): ApplicationFacade {
            if (!this._instance) {
                this._instance = new ApplicationFacade();
            }
            return this._instance;
        }

        public constructor() {
            super("ApplicationFacade");
        }
        
        public static STARTUP: string = "startup";

        public initializeController(): void {
            super.initializeController();
            this.registerCommand(ApplicationFacade.STARTUP, StartupCommand);
        }

        /**
         * 启动PureMVC，在应用程序中调用此方法，并传递应用程序本身的引用
         * @param	rootView	-	PureMVC应用程序的根视图root，包含其它所有的View Componet
         */
        public startUp(rootView: egret.DisplayObjectContainer): void {
            this.sendNotification(ApplicationFacade.STARTUP, rootView);
            this.removeCommand(ApplicationFacade.STARTUP); //PureMVC初始化完成，注销STARUP命令
            this.sendNotification(game.SceneCommand.CHANGE, Scene.Game);
        }

        public registerMediator(mediator: puremvc.IMediator) {
            super.registerMediator(mediator);
            // super.initializeNotifier(mediator.getMediatorName());
        }
    }
}