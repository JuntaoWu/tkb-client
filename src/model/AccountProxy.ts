

module game {

    export class AccountProxy extends puremvc.Proxy implements puremvc.IProxy {
        public static NAME: string = "AccountProxy";

        public userInfo: UserInfo;

        public gameProxy: GameProxy;

        /**
         * 获取用户信息完毕
         */
        public static LOAD_USER_INFO_COMPLETED: string = "userinfo_loaded";

        public constructor() {
            super(AccountProxy.NAME);
        }

        /**
         * 获取用户信息
         */
        public loadUserInfo(): Promise<UserInfo> {

            return new Promise((resolve, reject) => {
                if (this.userInfo && this.userInfo.openId) {
                    resolve(this.userInfo);
                }
                else {
                    console.log(`platform.getUserInfo begin.`);
                    //todo: Check if loadUserInfo async via url is available.
                    platform.getUserInfo().then((user: UserInfo) => {
                        this.userInfo = user;
                        console.log(`platform.getUserInfo end.`);

                        return this.loadUserInfoViaAppServer(user)
                            .then(data => {
                                resolve(data);
                            }).catch(error => {
                                reject(error);
                            });

                    }).catch(error => {
                        console.error(error);

                        platform.authorizeUserInfo((user: UserInfo) => {
                            this.userInfo = user;
                            console.log(`platform.getUserInfo end.`);

                            return this.loadUserInfoViaAppServer(user)
                                .then(data => {
                                    resolve(data);
                                }).catch(error => {
                                    reject(error);
                                });
                        });
                    });
                }
            });
        }

		/**
		 * 获取用户信息
		 */
        public loadUserInfoViaAppServer(user: UserInfo): Promise<UserInfo> {

            return new Promise((resolve, reject) => {

                this.gameProxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;
                
                if (CommonData.logon && CommonData.logon.openId) {
                    console.log(`load users/info via app server begin, openId: ${CommonData.logon.openId}.`);
                    this.userInfo.openId = CommonData.logon.openId;

                    var request = new egret.HttpRequest();
                    request.responseType = egret.HttpResponseType.TEXT;
                    request.open(`${game.Constants.Endpoints.service}passInfo/?openId=${CommonData.logon.openId}`, egret.HttpMethod.POST);
                    request.setRequestHeader("Content-Type", "application/json");
                    request.send({
                        userInfo: user
                    });
                    request.addEventListener(egret.Event.COMPLETE, (event: egret.Event) => {
                        console.log(`load users/info via app server end.`);

                        let req = <egret.HttpRequest>(event.currentTarget);
                        let res = JSON.parse(req.response);
                        if (res.error) {
                            console.error(res.message);
                            reject(res.message);
                        }
                        //todo: Invalid code

                        this.mergeRemoteInfoToStorage(res.data).then(({ playerInfo }) => {
                            this.gameProxy.updatePlayerInfo(playerInfo);
                        });

                        resolve(this.userInfo);
                    }, this);
                }
                else {
                    console.log(`We don't have openId now, skip.`);
                    this.mergeRemoteInfoToStorage({}).then(({ playerInfo }) => {
                        this.gameProxy.updatePlayerInfo(playerInfo);
                    });
                    resolve(this.userInfo);
                }
            });
        }

        /**
         * 
         */
        public savePlayerInfo(playerInfo: PlayerInfo) {

            platform.getStorageAsync("playerInfo").then(res => {
                let localPlayerInfo;
                try {
                    localPlayerInfo = JSON.parse(res.data);
                }
                catch (error) {
                    console.error("savePlayerInfo: localPlayerInfo is not JSON, skip.");
                }

                if (!localPlayerInfo || playerInfo.__v >= localPlayerInfo.__v) {
                    platform.setStorageAsync("playerInfo", JSON.stringify(playerInfo));
                }
                else {
                    console.error(`Your local playerInfo is newer than your saving version: playerInfo: ${playerInfo.__v}, localPlayerInfo: ${localPlayerInfo.__v}`);
                }
            });

            if (CommonData.logon && CommonData.logon.openId) {
                console.log(`saveUserGamePassInfos via app server begin, openId: ${CommonData.logon.openId}.`);

                var request = new egret.HttpRequest();
                request.responseType = egret.HttpResponseType.TEXT;
                request.open(`${game.Constants.Endpoints.service}passInfo/update/?openId=${CommonData.logon.openId}`, egret.HttpMethod.POST);
                request.setRequestHeader("Content-Type", "application/json");

                request.send(JSON.stringify({
                    ...playerInfo,
                    openId: CommonData.logon.openId
                }));

                request.addEventListener(egret.Event.COMPLETE, (event: egret.Event) => {
                    console.log(`saveUserGamePassInfos via app server end.`);

                    let req = <egret.HttpRequest>(event.currentTarget);
                    let res = JSON.parse(req.response);
                    if (res.error) {
                        console.error(res.message);
                    }
                    else {
                        let savedPlayerInfo = res.data;
                        console.log("savedPlayerInfo:", savedPlayerInfo);
                        this.mergeRemoteInfoToStorage({ playerInfo: savedPlayerInfo });
                    }
                }, this);
            }
            else {
                console.log(`We don't have openId now, skip.`);
            }
        }

        public async mergeRemoteInfoToStorage(data) {

            let { playerInfo } = data;
            let gameProxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;

            let localPlayerInfo: PlayerInfo;

            if (playerInfo) {
                try {
                    let res = await platform.getStorageAsync("playerInfo");
                    console.log("mergeRemoteInfoToStorage: parse playerInfo");
                    localPlayerInfo = JSON.parse(res.data);
                }
                catch (error) {
                    console.error("localPlayerInfo is not JSON, skip.");
                }
                if (!localPlayerInfo || (playerInfo.__v > (localPlayerInfo.__v || 0) || playerInfo.__v === 0)) {
                    platform.setStorageAsync("playerInfo", JSON.stringify(playerInfo));
                    gameProxy.mergeRemoteVersionNumber(gameProxy.playerInfo, playerInfo.__v);

                    console.log("mergeRemoteInfoToStorage: parse playerInfo to save");
                }
                else {
                    console.error(`mergeRemoteInfoToStorage: Your local playerInfo is newer than your saving version: ${playerInfo && playerInfo.__v}, localPlayerInfo: ${localPlayerInfo && localPlayerInfo.__v}`);
                    console.log("unmodified localPlayerInfo:", localPlayerInfo);
                }
            }

            try {
                let resPlayerInfo = await platform.getStorageAsync("playerInfo");
                localPlayerInfo = JSON.parse(resPlayerInfo.data);
            } catch (error) {
                console.error("local info's still not JSON, skip.");
            }

            return {
                playerInfo: localPlayerInfo,
            };
        }

    }
}