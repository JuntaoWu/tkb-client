/** 
 * 平台数据接口。
 * 由于每款游戏通常需要发布到多个平台上，所以提取出一个统一的接口用于开发者获取平台数据信息
 * 推荐开发者通过这种方式封装平台逻辑，以保证整体结构的稳定
 * 由于不同平台的接口形式各有不同，白鹭推荐开发者将所有接口封装为基于 Promise 的异步形式
 */
declare interface Platform {

    env: string;
    name: string;
    appVersion: string;
    mode: string;

    getUserInfo(): Promise<any>;

    login(): Promise<any>;

    getVersion(): Promise<any>;

    applyUpdate(version: string);

    onNetworkStatusChange(callback: Function);

    showToast(message: string);

    setStorage(key, data);

    getStorage(key);

    playVideo(src: string);

    showModal(message: string, confirmText?: string, cancelText?: string): Promise<any>;

    showLoading(message?: string);

    hideLoading();

    shareAppMessage(message?: string, query?: string, callback?: Function);

    showPreImage(data: Array<string>);

    createBannerAd(name: string, adUnitId: string, style: any);

    showBannerAd(name: string);

    hideAllBannerAds();

    setStorageAsync(key, value);

    getStorageAsync(key): Promise<any>;

    getLaunchInfo();

    authorizeUserInfo(callback);

    createBannerAd(name: string, adUnitId: string, style: any);

    showBannerAd(name: string);

    hideAllBannerAds();

    createRewardedVideoAd(name: string, adUnitId: string, callback: Function, onError: Function);

    showVideoAd(name: string);

    isVideoAdDisabled(name: string);

    disableVideoAd(name: string);

    connectSocket(args);

    onSocketOpen(callback);

    sendSocketMessage(message: string);

    captureAndUpload(level: string): Promise<any>;
}

class DebugPlatform implements Platform {

    public get env(): string {
        return "prod";
    }

    public get name(): string {
        return "DebugPlatform";
    }

    public get appVersion(): string {
        return "0.1.1";
    }

    public get mode(): string {
        return "online";
    }

    public async getUserInfo() {
        return { nickName: game.CommonData.logon && game.CommonData.logon.openId || "username" };
    }
    public async login() {
        return { code: "debug" };
    }

    public async getVersion() {

    }

    public applyUpdate() {
        return true;
    }

    public onNetworkStatusChange(callback: Function) {
        return true;
    }

    public showToast(message: string) {
        console.log(message);
    }

    public playVideo() {
        return {};
    }

    public showPreImage(data) {
    }

    public async showModal(message: string, confirmText?: string, cancelText?: string): Promise<any> {
        return { confirm: false, cancel: true };
    }

    public showLoading() {
        return true;
    }

    public hideLoading() {
        return true;
    }

    public shareAppMessage() {

    }

    public setStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    public getStorage(key) {
        return JSON.parse(localStorage.getItem(key));
    }

    public setStorageAsync(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    public async getStorageAsync(key): Promise<any> {
        return { data: JSON.parse(localStorage.getItem(key)) };
    }

    public getLaunchInfo() {

    }

    public authorizeUserInfo(callback) {

    }

    public createBannerAd(name: string, adUnitId: string, style: any) {

    }

    public showBannerAd(name: string) {

    }

    public hideAllBannerAds() {

    }

    public async createRewardedVideoAd(name: string, adUnitId: string, callback: Function, onError: Function) {

    }

    public async showVideoAd(name: string) {

    }

    public async isVideoAdDisabled(name: string) {

    }

    public async disableVideoAd(name: string) {

    }

    public connectSocket(args) {

    }

    public onSocketOpen(callback) {

    }

    public sendSocketMessage(message: string) {

    }

    public captureAndUpload(level: string): Promise<any> {
        let data = document.querySelector("canvas").toDataURL();
        console.log(data);
        return new Promise((resolve, reject) => {
            var request = new egret.HttpRequest();
            request.responseType = egret.HttpResponseType.TEXT;
            request.open(`${game.Constants.Endpoints.service}capture`, egret.HttpMethod.POST);
            request.setRequestHeader("Content-Type", "application/json");
            request.send(JSON.stringify({
                level: level,
                dataUri: data
            }));
            request.addEventListener(egret.Event.COMPLETE, (event: egret.Event) => {
                let req = <egret.HttpRequest>(event.currentTarget);
                let res = JSON.parse(req.response);
                if (res.error) {
                    console.error(res);
                    reject(res);
                }
                else {
                    resolve();
                }
            }, this);
            request.addEventListener(egret.IOErrorEvent.IO_ERROR, (error) => {
                reject(error);
            }, this);
        });
    }
}

if (!window.platform) {
    window.platform = new DebugPlatform();
}

declare let platform: Platform;

declare interface Window {

    platform: Platform
}
