
module game {

    export class BasePanel extends eui.Panel {

        public overlay: game.Shade;
        public container: eui.UIComponent;

        constructor() {
            super();
        }

        childrenCreated() {
            super.childrenCreated();
            this.container.visible = false;
        }

        show() {
            this.container.verticalCenter = -700;
            this.container.visible = true;
            egret.Tween.get(this.container).to({ verticalCenter: 0 }, 500, egret.Ease.backOut);
        }

        onCloseButtonClick(event: egret.TouchEvent) {
            super.onCloseButtonClick(event);
            this.close();
        }

        close() {
            this.parent && this.parent.removeChild(this);
        }
    }

}