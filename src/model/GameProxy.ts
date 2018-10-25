

module game {

	export class GameProxy extends puremvc.Proxy implements puremvc.IProxy {
		public static NAME: string = "GameProxy";

		public accountProxy: AccountProxy;

		public userInfo: UserInfo;

		public levelsArray: Level[];

		public currentChapter: number = 0;
		public currentLevel: number = 0;
		public collectedCount: number = 0;
		public passInfo: any[] = [];
		public shouldPowerUp: boolean = false;
		public currentPower: number = 20;

		public constructor() {
			super(GameProxy.NAME);

			platform.onNetworkStatusChange((res) => {
				console.log(res);
				if (!res) {
					return;
				}
				if (res.isConnected) {

				}
			});
		}

		public async initialize() {
			// const accountProxy = this.facade().retrieveProxy(AccountProxy.NAME) as AccountProxy;
			// this.userInfo = await accountProxy.loadUserInfo();
			if (!this.levelsArray) {
				let token = localStorage.getItem("token");
				if (platform.name == "wxgame" || platform.env == "prod") {
					token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InBpcGl4aWEiLCJpYXQiOjE1Mzk5MjMyODd9.B5gkXqSrRBZhfLjiDYPghqZ4VXFK-N6TXN8voUAoDy0";
				}
				this.levelsArray = await RES.getResByUrl(`http://gdjzj.hzsdgames.com:8092/level.json/?token=${token}&timestamp=${new Date().getTime()}`, null, this, RES.ResourceItem.TYPE_JSON);
			}
		}

		public static LEVEL_UPDATED: string = "level_updated";
		public static POWER_CHANGED: string = "power_changed";
		public static STAR_CHANGED: string = "star_changed";
		public static GAME_DISPOSE: string = "game_dispose";

		public startGame(level: number) {

			this.currentLevel = level;
			this.currentLevel %= 80;
			this.currentChapter = Math.floor(this.currentLevel / 20);

			//sync gameState
			console.log("MasterClient startGame: setCustomProperty");
		}

		public retryLevel() {
			this.sendNotification(GameProxy.LEVEL_UPDATED);
		}

		public nextLevel() {
			console.log("Next level");
			++this.currentLevel;
			this.currentLevel %= 80;
			this.currentChapter = Math.floor(this.currentLevel / 20);
			this.sendNotification(GameProxy.LEVEL_UPDATED);
		}

		public updateLevel(level: number) {
			this.currentLevel = level;
			this.currentLevel %= 80;
			this.currentChapter = Math.floor(this.currentLevel / 20);
			this.sendNotification(GameProxy.LEVEL_UPDATED);
		}

		public setResult(collectedCount?: number) {

			if (!collectedCount) {
				//todo: failed.

				return;
			}

			this.collectedCount = collectedCount;
			this.shouldPowerUp = false;
			if (!this.passInfo[this.currentLevel] || collectedCount > this.passInfo[this.currentLevel].stars) {
				this.passInfo[this.currentLevel] = {
					stars: collectedCount,
				};
				this.shouldPowerUp = collectedCount >= 3;
				this.currentPower += 3;
				this.sendNotification(GameProxy.POWER_CHANGED);
				this.sendNotification(GameProxy.STAR_CHANGED);

				//todo: save current power & passInfo
				this.accountProxy = this.facade().retrieveProxy(AccountProxy.NAME) as AccountProxy;
				this.accountProxy.savePassInfo(this.passInfo);
			}
		}

		public updatePassInfo(passInfo: any[]) {
			this.passInfo = passInfo;
		}

		public decreasePower(power: number) {
			this.currentPower -= power;
			this.sendNotification(GameProxy.POWER_CHANGED);
		}

		public disposeGame() {
			this.sendNotification(GameProxy.GAME_DISPOSE);
		}

		private generateRoomNumber() {
			let random = _.padStart(Math.floor(1000 * Math.random()).toString(), 3, '0');
			let name = parseInt(`${random}${new Date().getMilliseconds()}`).toString(10);
			return _.padStart(name, 6, '0').toUpperCase();
		}

		private randomShuffle(array: any[]) {
			array.sort(() => {
				return 0.5 - Math.random();
			});
		}

	}
}