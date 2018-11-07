package com.toolbar.childar.wxapi;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import com.tencent.mm.opensdk.modelbase.BaseReq;
import com.tencent.mm.opensdk.modelbase.BaseResp;
import com.tencent.mm.opensdk.modelmsg.SendAuth;
import com.tencent.mm.opensdk.openapi.IWXAPI;
import com.tencent.mm.opensdk.openapi.IWXAPIEventHandler;
import com.tencent.mm.opensdk.openapi.WXAPIFactory;
import com.toolbar.childar.MainActivity;

/**
 * Created by Juntao on 11/7/2018.
 */
public class WXEntryActivity extends Activity implements IWXAPIEventHandler {
    private final String TAG = "WXEntryActivity";
    private final String APP_ID = "wxcf2407196cc520b7";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // TODO Auto-generated method stub
         super.onCreate(savedInstanceState);

         MainActivity.api.handleIntent(getIntent(), this);
         //handleIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        Log.d(TAG, "onNewIntent");
        super.onNewIntent(intent);
        setIntent(intent);
        MainActivity.api.handleIntent(intent, this);
    }

    @Override
    public void onReq(BaseReq baseReq) {

    }

    @Override
    public void onResp(BaseResp baseResp) {
        SendAuth.Resp resp = (SendAuth.Resp)baseResp;
        Log.d(TAG, "onResp");
        Toast.makeText(this, "baseresp.getType = " + resp.getType(), Toast.LENGTH_SHORT).show();
        switch (resp.errCode) {
            case BaseResp.ErrCode.ERR_OK:
                MainActivity.nativeAndroid.callExternalInterface("sendWxLoginCodeToJS", resp.code);
                break;
        }
        finish();
    }

//    private void handleIntent(Intent intent) {
//        SendAuth.Resp resp = new SendAuth.Resp(intent.getExtras());
//        if (resp.errCode == BaseResp.ErrCode.ERR_OK) {
//            Log.d(TAG,"message OK");
//        }
//    }
}




