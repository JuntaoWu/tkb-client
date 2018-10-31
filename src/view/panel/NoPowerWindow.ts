
module game {

    export class NoPowerWindow extends game.BasePanel {

        public btnVideo: eui.Button;
        public contentNoPower: eui.Image;

        //bindings:
        public callback: Function;
        public isVideoAvailable: boolean = false;
        public isVideoDisabled: boolean = false;

        public constructor() {
            super();

            this.skinName = "skins.NoPowerWindow";
            this.addEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
        }

        public createCompleteEvent(event: eui.UIEvent): void {
            this.removeEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
            ApplicationFacade.instance.registerMediator(new NoPowerWindowMediator(this));
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }

        public updateCallback(callback?: Function) {
            this.callback = callback;
        }
    }

}