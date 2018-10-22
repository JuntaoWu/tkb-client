
class AccountAdapter {

    public static async login(): Promise<any> {
        return new Promise((resolve, reject) => {
            platform.login().then(wxRes => {
                //log the login information into backend.
                //https://api.weixin.qq.com/sns/jscode2session?appid=APPID&secret=SECRET&js_code=JSCODE&grant_type=authorization_code
                console.log(`Login app server begin, code: ${wxRes.code}`);
                if(1 == 1) {
                    return resolve();
                }
                var request = new egret.HttpRequest();
                request.responseType = egret.HttpResponseType.TEXT;
                request.open(`${game.Constants.Endpoints.service}users/login?code=${wxRes.code}`, egret.HttpMethod.POST);
                request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                request.send();
                request.addEventListener(egret.Event.COMPLETE, (event: egret.Event) => {
                    let req = <egret.HttpRequest>(event.currentTarget);
                    let res = JSON.parse(req.response);
                    if (res.error) {
                        console.error(res.message);
                        reject(res.message);
                    }
                    else {
                        game.CommonData.logon = { ...game.CommonData.logon, ...res.data };  //this is the unique Id.
                        console.log(`Login app server end, logon is: ${res.data && res.data.openId}`);
                        resolve();
                    }
                }, this);
                // request.addEventListener(egret.IOErrorEvent.IO_ERROR, this.onGetIOError, this);
                // request.addEventListener(egret.ProgressEvent.PROGRESS, this.onGetProgress, this);
            });
        });
    }

    public static async checkForUpdate() {
        return new Promise(async (resolve, reject) => {
            if (platform.name == "DebugPlatform") {
                return resolve({
                    hasUpdate: false
                });
            }
            let version = await platform.getVersion() || 0;
            console.log(`Check version begin, current version is: ${version}`);
            var request = new egret.HttpRequest();
            request.responseType = egret.HttpResponseType.TEXT;
            request.open(`${game.Constants.Endpoints.service}version/check?version=${version}`, egret.HttpMethod.GET);
            request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            request.send();
            request.addEventListener(egret.Event.COMPLETE, (event: egret.Event) => {
                let req = <egret.HttpRequest>(event.currentTarget);
                let res = JSON.parse(req.response);
                if (res.error) {
                    console.error(res.message);
                    reject(res.message);
                }
                else {
                    console.log(`Check version end, lastest version is: ${res.data && res.data.version || version}`);
                    resolve(res.data);
                }
            }, this);
            // request.addEventListener(egret.IOErrorEvent.IO_ERROR, this.onGetIOError, this);
            // request.addEventListener(egret.ProgressEvent.PROGRESS, this.onGetProgress, this);
        });
    }

}