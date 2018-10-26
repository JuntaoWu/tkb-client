
module game {

    export class SettingsWindow extends game.BasePanel {

        //bindings:
        public currentLevelBinding: string = "第 1 关";
        public powerUpBinding: boolean = false;
        public powerLabelBinding: string = "0/20";

        public constructor() {
            super();

            this.skinName = "skins.SettingsWindow";
            this.addEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
        }

        public createCompleteEvent(event: eui.UIEvent): void {
            this.removeEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
            //ApplicationFacade.instance.registerMediator(new SettingsWindowMediator(this));
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }
    }

}