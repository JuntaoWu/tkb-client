//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

class LoadingUI extends eui.Component implements RES.PromiseTaskReporter {

    private loadingText: egret.TextField;
    private labelText: egret.TextField;

    private progressBg: egret.Bitmap;
    private progressBar: egret.Bitmap;
    private loadingLabel: egret.DisplayObject;

    public constructor() {
        super();
        this.skinName = "skins.LoadingUI";
        this.addEventListener(eui.UIEvent.CREATION_COMPLETE, this.createCompleteEvent, this);
    }

    public createCompleteEvent(event: eui.UIEvent): void {
        this.removeEventListener(eui.UIEvent.CREATION_COMPLETE, this.createCompleteEvent, this);

        this.progressBg.y = this.stage.stageHeight - 30;
        this.progressBar.y = this.stage.stageHeight - 30;
        this.loadingLabel.y = this.stage.stageHeight - 60;
    }

    public onProgress(current: number, total: number): void {
        this.labelText.text = `${current}/${total}`;
        this.progressBar.width = this.stage.width * current / total;
    }

    public showInformation(message) {
        this.loadingText.text = message;
        this.labelText.text = "";
    }
}