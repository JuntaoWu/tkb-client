

module game {

	export class GameProxy extends puremvc.Proxy implements puremvc.IProxy {
		public static NAME: string = "GameProxy";

		public userInfo: UserInfo;

		public levelsArray: Level[];

		public constructor() {
			super(GameProxy.NAME);

			const self = this;

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
				this.levelsArray = await RES.getResByUrl(`http://gdjzj.hzsdgames.com:8092/level.json/?token=${token}&timestamp=${new Date().getTime()}`, null, this, RES.ResourceItem.TYPE_JSON);
			}
		}

		public static PLAYER_UPDATE: string = "player_update";
		public static SEAT_UPDATE: string = "seat_update";
		public static CHOOSE_JS_END: string = "choose_js_end";
		public static FIRST_ONE: string = "first_one";
		public static NEXT_NR: string = "next_nr";
		public static TONGZHI: string = "tongzhi";
		public static BAOWU_TONGZHI: string = "baowu_tongzhi";
		public static TOUPIAO_UI: string = "toupiao_ui";
		public static ZONG_PIAOSHU: string = "zong_piaoshu";
		public static INPUT_NUMBER: string = "input_number";
		public static FINISH_INPUT: string = "finish_input";
		public static PIAO_SHU: string = "piao_shu";
		public static TOUPIAO_END: string = "toupiao_end";
		public static START_TWO: string = "start_two";
		public static ONE_YBRSKILL: string = "one_ybrskill";
		public static ONE_ZGQSKILL: string = "one_zgqskill";
		public static TOUREN: string = "touren";
		public static TOUREN_JIEGUO: string = "touren_jieguo";
		public static START_TOUPIAO_BUTTON: string = "start_toupiao_button";
		public static ROLEING: string = "roleing";
		public static AUTH_EDN: string = "auth_end";

		public roomName: string;

		public isCreating: boolean;

		private _actorNr: number;
		public get actorNr(): number {
			return this._actorNr;
		}
		public set actorNr(v: number) {
			this._actorNr = v;
			platform.setStorage("currentRoom", {
				roomName: this.roomName,
				actorNr: this.actorNr
			});
		}

		public get currentRoom(): any {
			return platform.getStorage("currentRoom");
		}
		public set currentRoom(value: any) {
			platform.setStorage("currentRoom", value);
		}

		private _antiquesMap: Map<string, any>;
		public get antiquesMap(): Map<string, any> {
			if (!this._antiquesMap) {
				this._antiquesMap = new Map<string, any>(Object.entries(RES.getRes("antiques_json")));
			}
			return this._antiquesMap;
		}

		private _seatsMap: Map<string, any>;
		public get seatsMap(): Map<string, any> {
			if (!this._seatsMap) {
				this._seatsMap = new Map<string, any>(Object.entries(RES.getRes("seats_json")));
			}
			return this._seatsMap;
		}


		private _rolesMap: Map<string, Role>;
		public get rolesMap(): Map<string, Role> {
			if (!this._rolesMap) {
				this._rolesMap = new Map<string, Role>(Object.entries(RES.getRes("role_json")));
			}
			return this._rolesMap;
		}

		public startGame() {

			//sync gameState
			console.log("MasterClient startGame: setCustomProperty");
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