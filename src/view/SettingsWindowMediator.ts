
module game {

    export class SettingsWindowMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "SettingsWindowMediator";

        private proxy: GameProxy;

        public constructor(viewComponent: any) {
            super(SettingsWindowMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");

            this.proxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;

            this.settingsWindow.addEventListener(egret.Event.ADDED_TO_STAGE, this.initData, this);
            this.settingsWindow.closeButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.closeWindow, this);
            this.settingsWindow.btnSoundEffect.addEventListener(egret.TouchEvent.CHANGE, this.toggleSound, this);
            this.settingsWindow.btnSoundMusic.addEventListener(egret.TouchEvent.CHANGE, this.toggleMusic, this);
        }

        public toggleSound(event: egret.TouchEvent) {
            SoundPool.disableSound = this.settingsWindow.btnSoundEffect.selected;
        }

        public toggleMusic(event: egret.TouchEvent) {
            SoundPool.disableMusic = this.settingsWindow.btnSoundMusic.selected;
        }

        public async initData() {

        }

        public closeWindow(event: egret.TouchEvent) {
            SoundPool.playSoundEffect("tap-sound");
        }

        public listNotificationInterests(): Array<any> {
            return [

            ];
        }

        public handleNotification(notification: puremvc.INotification): void {
            var data: any = notification.getBody();
            switch (notification.getName()) {

            }
        }

        public get settingsWindow(): SettingsWindow {
            return this.viewComponent as SettingsWindow;
        }

    }

}