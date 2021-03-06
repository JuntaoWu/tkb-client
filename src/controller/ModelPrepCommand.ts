

module game {

    export class ModelPrepCommand extends puremvc.SimpleCommand implements puremvc.ICommand {

        public constructor() {
            super();
        }
        public execute(notification: puremvc.INotification): void {
            this.facade().registerProxy(new AccountProxy());
            this.facade().registerProxy(new GameProxy());
            this.facade().registerProxy(new GameCore());
        }
    }
}