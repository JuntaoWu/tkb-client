

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
                        this.gameProxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;
                        this.gameProxy.updatePassInfo(res.data.passInfo);

                        resolve(this.userInfo);
                    }, this);
                }
                else {
                    console.log(`We don't have openId now, skip.`);
                    resolve(this.userInfo);
                }
            });
        }

        /**
         * 
         */
        public savePassInfo(passInfo) {

            if (CommonData.logon && CommonData.logon.openId) {
                console.log(`saveUserGamePassInfos via app server begin, openId: ${CommonData.logon.openId}.`);

                var request = new egret.HttpRequest();
                request.responseType = egret.HttpResponseType.TEXT;
                request.open(`${game.Constants.Endpoints.service}passInfo/update/?openId=${CommonData.logon.openId}`, egret.HttpMethod.POST);
                request.setRequestHeader("Content-Type", "application/json");

                request.send(JSON.stringify({
                    passInfo,
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
                        console.log("update current userInfo object");
                        this.gameProxy.updatePassInfo(res.data.passInfo);
                    }
                }, this);
            }
            else {
                console.log(`We don't have openId now, skip.`);
            }
        }

    }
}