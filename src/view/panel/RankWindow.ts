
module game {

    export class RankWindow extends game.BasePanel {

        public listRank: eui.List;

        //bindings:
        public data: any = {
            nickName: "",
            avatarUrl: "",
            score: 0,
            rank: 999
        };

        public constructor() {
            super();

            this.skinName = "skins.RankWindow";
            this.addEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
        }

        public createCompleteEvent(event: eui.UIEvent): void {
            this.removeEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
            ApplicationFacade.instance.registerMediator(new RankWindowMediator(this));
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }

        public update(data) {
            this.data.nickName = data.nickName;
            this.data.avatarUrl = data.avatarUrl;
            this.data.score = data.score;
            this.data.rank = data.rank;
        }
    }

}