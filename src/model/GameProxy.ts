

module game {

	export class GameProxy extends puremvc.Proxy implements puremvc.IProxy {
		public static NAME: string = "GameProxy";

		public accountProxy: AccountProxy;

		public userInfo: UserInfo;

		public levelsArray: Level[];

		public currentChapter: number = 0;
		public currentLevel: number = 0;
		public collectedCount: number = 0;

		public playerInfo: PlayerInfo = {
			restoredAt: new Date(),
			currentPower: 20,
			passInfo: [],
			__v: 0
		};

		public shouldPowerUp: boolean = false;

		public launchInfo: any;

		public get passInfo(): any[] {
			return this.playerInfo && this.playerInfo.passInfo;
		}
		public set passInfo(v: any[]) {
			this.playerInfo = this.playerInfo || {};
			this.playerInfo.passInfo = v;
		}

		public get currentPower(): number {
			return this.playerInfo && this.playerInfo.currentPower || 0;
		}
		public set currentPower(v: number) {
			this.playerInfo = this.playerInfo || {};
			this.playerInfo.currentPower = v || 0;
		}

		/**
		 * 
		 */

		public core: GameCore;

		public players: _.Dictionary<GamePlayer>;

		private ghosts: _.Dictionary<GamePlayer>;

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
				if (!token) {
					token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InBpcGl4aWEiLCJpYXQiOjE1Mzk5MjMyODd9.B5gkXqSrRBZhfLjiDYPghqZ4VXFK-N6TXN8voUAoDy0";
				}
				this.levelsArray = await RES.getResByUrl(`${Constants.ServiceEndpoint}level.json/?token=${token}&timestamp=${new Date().getTime()}`, null, this, RES.ResourceItem.TYPE_JSON);
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

		public createOnlineGame() {

			this.core = this.facade().retrieveProxy(GameCore.NAME) as GameCore;

			this.core.connect();
		}

		public nextLevel() {
			this.launchInfo = null;
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

			if (this.launchInfo) {
				console.log("No setResult, launchInfo:", this.launchInfo);
				return;
			}

			this.collectedCount = collectedCount;
			this.shouldPowerUp = false;
			if (!this.passInfo[this.currentLevel] || collectedCount > (this.passInfo[this.currentLevel].stars || 0)) {
				this.passInfo[this.currentLevel] = {
					stars: collectedCount,
				};
				this.shouldPowerUp = collectedCount >= 3;
				this.currentPower += 3;
				this.sendNotification(GameProxy.POWER_CHANGED);
				this.sendNotification(GameProxy.STAR_CHANGED);

				//todo: save current power & passInfo
				this.accountProxy = this.facade().retrieveProxy(AccountProxy.NAME) as AccountProxy;
				this.accountProxy.savePlayerInfo(this.playerInfo);
			}
		}

		public updatePlayerInfo(playerInfo: PlayerInfo) {
			this.playerInfo = playerInfo || this.playerInfo;
			if (this.playerInfo.currentPower <= 20 && (!this.playerInfo.restoredAt || this.playerInfo.restoredAt < new Date(new Date().setHours(0, 0, 0, 0)))) {
				this.playerInfo.currentPower = 20;
				this.playerInfo.restoredAt = new Date();
			}
		}

		public mergeRemoteVersionNumber(data, version: number) {
			if (data) {
				data.__v = version;
			}
		}

		public decreasePower(power: number) {

			if (power != 5 && this.passInfo[this.currentLevel] && this.passInfo[this.currentLevel].stars >= 3) {
				console.log("No need to decreasePower for currentLevel");
				return;
			}

			if (this.launchInfo) {
				console.log("No decreasePower, launchInfo:", this.launchInfo);
				return;
			}

			this.currentPower -= power;
			if (this.currentPower < 0) {
				this.currentPower = 0;
			}
			this.sendNotification(GameProxy.POWER_CHANGED);

			//todo: save current power & passInfo
			this.accountProxy = this.facade().retrieveProxy(AccountProxy.NAME) as AccountProxy;
			this.accountProxy.savePlayerInfo(this.playerInfo);
		}

		public increasePower(power: number) {
			this.currentPower += power;
			this.sendNotification(GameProxy.POWER_CHANGED);

			if (this.launchInfo) {
				console.log("No increasePower, launchInfo:", this.launchInfo);
				return;
			}

			//todo: save current power & passInfo
			this.accountProxy = this.facade().retrieveProxy(AccountProxy.NAME) as AccountProxy;
			this.accountProxy.savePlayerInfo(this.playerInfo);
		}

		public disposeGame() {
			this.launchInfo = null;
			this.sendNotification(GameProxy.GAME_DISPOSE);
		}

		public setLaunchInfo(data) {
			this.launchInfo = data;
			this.startGame(+data.query.level);
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