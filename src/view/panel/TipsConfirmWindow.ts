
module game {

    export class TipsConfirmWindow extends game.BasePanel {

        public btnConfirm: eui.Button;

        //bindings:
        public callback: Function;
        public powerLabelBinding: string = "";

        public constructor() {
            super();

            this.skinName = "skins.TipsConfirmWindow";
            this.addEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
        }

        public createCompleteEvent(event: eui.UIEvent): void {
            this.removeEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
            ApplicationFacade.instance.registerMediator(new TipsConfirmWindowMediator(this));
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }

        public updateCallback(callback?: Function) {
            this.callback = callback;
        }
    }

}