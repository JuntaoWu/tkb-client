
module game {

    export class Shade extends eui.Component {
        public constructor() {
            super();
            this.skinName = "skins.Shade";
            this.addEventListener(eui.UIEvent.ADDED_TO_STAGE, this.createCompleteEvent, this);
        }

        childrenCreated() {
            this.rect.x = this.rect.y = 0;
            this.rect.width = egret.lifecycle.stage.stageWidth;
            this.rect.height = egret.lifecycle.stage.stageHeight;
            this.removeEventListener(eui.UIEvent.ADDED_TO_STAGE, this.createCompleteEvent, this);
        }

        public createCompleteEvent(event: eui.UIEvent): void {

        }

        private rect: eui.Rect;
        /**
         * 添加遮罩层    
         * @doc 要显示遮罩层的容器
         */
        public static addMask(doc: egret.DisplayObjectContainer) {
            let maskGroup = new eui.Group();
            maskGroup.touchEnabled = true;
            maskGroup.verticalCenter = 0;
            let stage: egret.Stage = egret.lifecycle.stage;
            let rectMask: eui.Rect = new eui.Rect(stage.stageWidth, stage.stageHeight, 0x000000);
            rectMask.x = 0;
            rectMask.y = 0;
            rectMask.alpha = 0.8;
            maskGroup.addChild(rectMask);
            doc.addChildAt(maskGroup, 0);
        }
    }
    
}