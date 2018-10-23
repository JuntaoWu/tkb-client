
module game {

    export class GameScreen extends eui.Component {

        public name: string = "GameScreen";

        // controls:
        public gameBackground: eui.Image;
        private poweredLabel: eui.Label;
        public groupPhysics: eui.Group;
        public btnRestart: eui.Button;
        public btnTip: eui.Button;
        public btnGo: eui.Button;
        public btnBack: eui.Button;
        public txtLevel: eui.TextInput;
        public btnCurrentTip: eui.Button;
        public btnConfirmTip: eui.Button;

        public star0: eui.Image;
        public star1: eui.Image;
        public star2: eui.Image;

        public scoreStarUI0: ScoreStarUI;
        public scoreStarUI1: ScoreStarUI;
        public scoreStarUI2: ScoreStarUI;

        //bindings:
        public currentLevel: string = "第 1 关";

        private _starCount: number = 0;
        public get starCount(): number {
            return this._starCount;
        }
        public set starCount(v: number) {
            this._starCount = v;
            for (let i = 0; i < 3; ++i) {
                let star = this[`star${i}`] as eui.Image;
                star.source = i < v ? "icon-star" : "icon-star-black";
            }
        }

        public constructor() {
            super();
            this.skinName = "skins.GameScreen";
            this.addEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
        }

        public createCompleteEvent(event: eui.UIEvent): void {
            // this.poweredLabel.y = this.stage.stageHeight - this.poweredLabel.height - 30;

            this.removeEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
            ApplicationFacade.instance.registerMediator(new GameScreenMediator(this));

            this.scoreStarUI0 = new ScoreStarUI();
            this.scoreStarUI1 = new ScoreStarUI();
            this.scoreStarUI2 = new ScoreStarUI();
            this.stage.addChild(this.scoreStarUI0);
            this.stage.addChild(this.scoreStarUI1);
            this.stage.addChild(this.scoreStarUI2);
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }
    }

}