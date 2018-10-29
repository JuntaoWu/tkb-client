module game {

    export class RankItemRenderer extends eui.ItemRenderer {

        constructor() {
            super();
            this.skinName = "skins.RankItemRenderer";
        }

        protected createChildren(): void {
            super.createChildren();
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }

        protected dataChanged(): void {
            super.dataChanged();
        }
    }

}