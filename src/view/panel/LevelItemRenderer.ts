module game {

    export class LevelItemRenderer extends eui.ItemRenderer {

        public btnLevelItem: any;

        private _starCount: number = 0;
        public get starCount(): number {
            return this._starCount;
        }
        public set starCount(v: number) {
            this._starCount = v;
            for (let i = 0; i < 3; ++i) {
                let star = this.btnLevelItem[`star${i}`] as eui.Image;
                star.source = i < v ? "icon-star" : "icon-star-black";
            }
        }

        constructor() {
            super();
            this.skinName = "skins.LevelItemRenderer";
        }

        protected createChildren(): void {
            super.createChildren();
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }

        protected dataChanged(): void {
            super.dataChanged();
            this.starCount = this.data.stars || 0;
            this.btnLevelItem.labelLevel.text = this.data.level;
            this.btnLevelItem.imgCheck.visible = this.data.isPlayed;
            this.btnLevelItem.imgLock.visible = this.data.isLocked;
            this.btnLevelItem.enabled = !this.data.isLocked;
            (this.btnLevelItem.imgContent as eui.Image).source = ((+this.data.level) - 1).toString();
        }
    }

}