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

    shareAppMessage();

    showPreImage(data: Array<string>);

    createBannerAd(name: string, adUnitId: string, style: any);

    showBannerAd(name: string);

    hideAllBannerAds();
}

class DebugPlatform implements Platform {

    public get env(): string {
        return "dev";
    }

    public get name(): string {
        return "DebugPlatform";
    }

    public get appVersion(): string {
        return "0.2.24";
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

    public setStorage(key, data) {
        sessionStorage.setItem(key, JSON.stringify(data));
    }

    public getStorage(key) {
        return JSON.parse(sessionStorage.getItem(key));
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

    public createBannerAd(name: string, adUnitId: string, style: any) {

    }

    public showBannerAd(name: string = "bottom") {

    }

    public hideAllBannerAds() {
        
    }
}

if (!window.platform) {
    window.platform = new DebugPlatform();
}

declare let platform: Platform;

declare interface Window {

    platform: Platform
}





