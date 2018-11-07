package com.toolbar.childar;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.widget.Toast;

import org.egret.egretnativeandroid.EgretNativeAndroid;

import com.toolbar.childar.wxapi.WXEntryActivity;
import com.tencent.mm.opensdk.modelmsg.SendAuth;
import com.tencent.mm.opensdk.openapi.IWXAPI;
import com.tencent.mm.opensdk.openapi.IWXAPIEventHandler;
import com.tencent.mm.opensdk.openapi.WXAPIFactory;

public class MainActivity extends Activity {
    private final String TAG = "MainActivity";
    public static EgretNativeAndroid nativeAndroid;
    public static IWXAPI api;
    private static final String APP_ID = "wxcf2407196cc520b7";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        registerToWeChat();

        nativeAndroid = new EgretNativeAndroid(this);
        if (!nativeAndroid.checkGlEsVersion()) {
            Toast.makeText(this, "This device does not support OpenGL ES 2.0.",
                    Toast.LENGTH_LONG).show();
            return;
        }

        nativeAndroid.config.showFPS = true;
        nativeAndroid.config.fpsLogTime = 30;
        nativeAndroid.config.disableNativeRender = false;
        nativeAndroid.config.clearCache = false;
        nativeAndroid.config.loadingTimeout = 0;

        setExternalInterfaces();
        
        if (!nativeAndroid.initialize("http://tool.egret-labs.org/Weiduan/game/index.html")) {
            Toast.makeText(this, "Initialize native failed.",
                    Toast.LENGTH_LONG).show();
            return;
        }

        setContentView(nativeAndroid.getRootFrameLayout());
    }

    private void registerToWeChat() {
        api = WXAPIFactory.createWXAPI(this, APP_ID, true);
        api.registerApp(APP_ID);
    }

    @Override
    protected void onPause() {
        super.onPause();
        nativeAndroid.pause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        nativeAndroid.resume();
    }

    @Override
    public boolean onKeyDown(final int keyCode, final KeyEvent keyEvent) {
        if (keyCode == KeyEvent.KEYCODE_BACK) {
            nativeAndroid.exitGame();
        }

        return super.onKeyDown(keyCode, keyEvent);
    }

    private void setExternalInterfaces() {
        nativeAndroid.setExternalInterface("sendToNative", (String message) -> {
            String str = "Native get message: ";
            str += message;
            Log.d(TAG, str);
            nativeAndroid.callExternalInterface("sendToJS", str);
        });

        nativeAndroid.setExternalInterface("sendWxLoginToNative", (String message) -> {
            Log.d(TAG, "snsapi_userinfo");

            SendAuth.Req req = new SendAuth.Req();
            req.scope = "snsapi_userinfo";
            req.state = "wechat_sdk_demo_test";
            api.sendReq(req);
        });
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
    }
}
