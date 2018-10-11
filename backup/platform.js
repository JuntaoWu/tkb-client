/**
 * 请在白鹭引擎的Main.ts中调用 platform.login() 方法调用至此处。
 */

import * as fileutil from 'library/file-util';

class WxgamePlatform {

    env = 'dev';
    name = 'wxgame';
    appVersion = '0.2.25';

    login() {
        return new Promise((resolve, reject) => {
            wx.login({
                success: (res) => {
                    resolve(res)
                }
            });
        });
    }

    getUserInfo() {
        return new Promise((resolve, reject) => {
            wx.getUserInfo({
                withCredentials: true,
                success: function (res) {
                    var userInfo = res.userInfo
                    var nickName = userInfo.nickName
                    var avatarUrl = userInfo.avatarUrl
                    var gender = userInfo.gender //性别 0：未知、1：男、2：女
                    var province = userInfo.province
                    var city = userInfo.city
                    var country = userInfo.country
                    resolve(userInfo);
                },
                fail: function (res) {
                    reject(res);
                }
            });
        });
    }

    checkForUpdate() {
        console.log("wx checkForUpdate.");
        var updateManager = wx.getUpdateManager();
        updateManager.onCheckForUpdate(function (res) {
            console.log("hasUpdate: " + res.hasUpdate);
            res.hasUpdate && fileutil.fs.remove("temp_text");
            res.hasUpdate && fileutil.fs.remove("temp_image");
        });
    }

    getVersion() {
        return this.getStorage("apiVersion");
    }

    applyUpdate(version) {
        console.log("applyUpdate for cached resource.");
        try {
            fileutil.fs.existsSync("http") && (console.log("remove http folder"), fileutil.fs.remove("http"));
            fileutil.fs.existsSync("https") && (console.log("remove https folder"), fileutil.fs.remove("https"));
            fileutil.fs.existsSync("temp_text") && (console.log("remove temp_text folder"), fileutil.fs.remove("temp_text"));
            fileutil.fs.existsSync("temp_image") && (console.log("remove temp_image folder"), fileutil.fs.remove("temp_image"));

            wx.removeStorageSync("devapiVersion");
            wx.removeStorageSync("prodapiVersion");
            this.setStorage("apiVersion", version);
        } 
        catch (ex) {
            console.error(ex.message);
        }
    }

    openDataContext = new WxgameOpenDataContext();

    getOpenDataContext() {
        return this.openDataContext;
    }

    shareAppMessage(message, query, callback) {
        wx.shareAppMessage({
            title: '古董局中局',
            imageUrl: 'http://gdjzj.hzsdgames.com:8083/miniGame/resource/assets/shared/share.png',
            query: query,
            success: (res) => {
                console.log("shareAppMessage successfully.", res);
                callback && callback(res);
            }
        });
    }

    showShareMenu() {
        wx.showShareMenu({
            withShareTicket: true,
            success: function (res) {
                wx.onShareAppMessage(function () {
                    return {
                        imageUrl: 'http://gdjzj.hzsdgames.com:8083/miniGame/resource/assets/shared/share.png',
                    };
                });
            },
            fail: function (res) { },
            complete: function (res) { },
        })
    }

    onNetworkStatusChange(callback) {
        wx.onNetworkStatusChange((res) => {
            this.showToast(`当前网络${res.isConnected ? '已连接' : '未连接'}`);
            callback(res);
        });
    }

    showToast(message) {
        wx.showToast({
            title: message,
            duration: 1500,
            mask: true,
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
        })
    }

    setStorage(key, value) {
        wx.setStorageSync(`${this.env}${key}`, value);
    }

    getStorage(key) {
        return wx.getStorageSync(`${this.env}${key}`);
    }

    setStorageAsync(key, value) {
        wx.setStorage({
            key: `${this.env}${key}`,
            data: value,
        });
    }

    getStorageAsync(key) {
        return new Promise((resolve, reject) => {
            wx.getStorage({
                key: `${this.env}${key}`,
                success: function (res) {
                    resolve(res);
                },
                fail: function (res) {
                    reject(res);
                }
            });
        });
    }

    showModal(message, confirmText, cancelText) {
        return new Promise((resolve, reject) => {
            wx.showModal({
                title: '提示',
                content: message,
                showCancel: true,
                cancelText: cancelText || '取消',
                confirmText: confirmText || '确定',
                success: function (res) {
                    resolve(res);
                },
                fail: function (res) { },
                complete: function (res) { },
            })
        });
    }

    showLoading(message) {
        wx.showLoading({
            title: message || '加载中',
            mask: true,
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
        })
    }

    hideLoading() {
        wx.hideLoading();
    }

    playVideo(src) {
        return wx.createVideo({
            src: src
        });
    }

    showPreImage(imgList) {
        wx.previewImage({
            urls: imgList.map(m => {
                return `${m}?v=${this.getVersion()}`;
            }),
        });
    }

    getLaunchInfo() {
        return wx.getLaunchOptionsSync();
    }

    authorizeUserInfo(callback) {
        let button = wx.createUserInfoButton({
            type: 'text',
            text: '授权登录',
            style: {
                left: 100,
                top: 420,
                width: 200,
                height: 40,
                lineHeight: 40,
                backgroundColor: '#0084ff',
                color: '#ffffff',
                textAlign: 'center',
                fontSize: 16,
                borderRadius: 4
            }
        });

        button.onTap((res) => {
            if (res.userInfo) {
                button.destroy();
                callback(res.userInfo);
            } 
            else {
                console.error(res);
            }
        });
    }

    createBannerAd(name, adUnitId, style) {
        this[`banner-${name}-config`] = {
            name: name,
            adUnitId: adUnitId,
            style: style
        };
        this.createBannerAdWithConfig(this[`banner-${name}-config`]);
    }

    createBannerAdWithConfig(config, show) {
        let {
            name,
            adUnitId,
            style
        } = config;
        let systemInfo = wx.getSystemInfoSync();
        if (systemInfo.SDKVersion >= "2.0.4") {
            let top = 0;
            let realWidth = wx.getSystemInfoSync().windowWidth * 0.8;

            this[`banner-${name}`] = wx.createBannerAd({
                adUnitId: adUnitId,
                style: {
                    top: 0,
                    left: 0,
                    width: realWidth
                }
            });
            this[`banner-${name}`] && this[`banner-${name}`].onResize(e => {

                let windowWidth = wx.getSystemInfoSync().windowWidth;
                let width = e.width;
                this[`banner-${name}`].style.left = (windowWidth - width) / 2;

                if (style == "bottom") {
                    let windowHeight = wx.getSystemInfoSync().windowHeight;
                    let height = e.height;
                    this[`banner-${name}`].style.top = windowHeight - height;
                }
            });

            show && this[`banner-${name}`].onLoad(() => {
                this[`banner-${name}`] && !this[`banner-${name}`]._destroyed && this[`banner-${name}`].show();
            });
        }
    }

    showBannerAd(name) {
        if (this[`banner-${name}`] && !this[`banner-${name}`]._destroyed) {
            this[`banner-${name}`].show();
        }
        else {
            this.createBannerAdWithConfig(this[`banner-${name}-config`], true);
        }
    }

    hideBannerAd(name) {
        if (this[`banner-${name}`]) {
            this[`banner-${name}`].hide();
            this[`banner-${name}`].destroy();
            this[`banner-${name}`].offResize();
            this[`banner-${name}`].offLoad();
        }
    }

    hideAllBannerAds() {
        this.hideBannerAd("top");
        this.hideBannerAd("bottom");
    }

    createRewardedVideoAd(name, adUnitId, callback) {
        this[`video-${name}`] = wx.createRewardedVideoAd({
            adUnitId: adUnitId
        });

        this[`video-${name}`].load().then(() => {
            console.log("createRewardedVideoAd load.");
        }).catch((error) => {
            console.error("createRewardedVideoAd error", error);
            this[`video-${name}`].offLoad();
        });

        this[`video-${name}`].onClose(res => {
            // 用户点击了【关闭广告】按钮
            // 小于 2.1.0 的基础库版本，res 是一个 undefined
            if (res && res.isEnded || res === undefined) {
                // 正常播放结束，可以下发游戏奖励
                callback && callback(name);
            } 
            else {
                // 播放中途退出，不下发游戏奖励
            }
        });
    }

    showVideoAd(name) {
        if (this[`video-${name}`]) {
            this[`video-${name}`].show().catch(err => {
                console.error(err && err.message);
                this[`video-${name}`].load()
                    .then(() => this[`video-${name}`].show());
            });
        }
        else {
            console.error("rewardedVideoAd never created.");
        }
    }
}

class WxgameOpenDataContext {

    createDisplayObject(type, width, height) {
        const bitmapdata = new egret.BitmapData(sharedCanvas);
        bitmapdata.$deleteSource = false;
        const texture = new egret.Texture();
        texture._setBitmapData(bitmapdata);
        const bitmap = new egret.Bitmap(texture);
        bitmap.width = width;
        bitmap.height = height;

        if (egret.Capabilities.renderMode == "webgl") {
            const renderContext = egret.wxgame.WebGLRenderContext.getInstance();
            const context = renderContext.context;
            ////需要用到最新的微信版本
            ////调用其接口WebGLRenderingContext.wxBindCanvasTexture(number texture, Canvas canvas)
            ////如果没有该接口，会进行如下处理，保证画面渲染正确，但会占用内存。
            if (!context.wxBindCanvasTexture) {
                egret.startTick((timeStarmp) => {
                    egret.WebGLUtils.deleteWebGLTexture(bitmapdata.webGLTexture);
                    bitmapdata.webGLTexture = null;
                    return false;
                }, this);
            }
        }
        return bitmap;
    }


    postMessage(data) {
        const openDataContext = wx.getOpenDataContext();
        openDataContext.postMessage(data);
    }
}


window.platform = new WxgamePlatform();