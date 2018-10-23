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

        show(animation?: boolean, style?: any) {
            this.container.visible = true;
            if (animation) {
                this.container.y = -1280;
                let targetTop = (this.stage.stageHeight - this.container.height) / 2;

                if (style && style.top) {
                    targetTop = style.top;
                }

                egret.Tween.get(this.container).to({ y: targetTop }, 500, egret.Ease.sineIn);
            }
            else {
                this.container.verticalCenter = 0;
                this.container.horizontalCenter = 0;
                this.container.scaleX = 0.5;
                this.container.scaleY = 0.5;
                egret.Tween.get(this.container).to({ scaleX: 1, scaleY: 1 }, 500, egret.Ease.quadOut);
            }
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