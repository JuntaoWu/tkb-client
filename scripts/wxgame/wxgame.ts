import * as fs from 'fs';
import * as path from 'path';
export class WxgamePlugin implements plugins.Command {

    constructor() {
    }
    async onFile(file: plugins.File) {
        if (file.extname == '.js') {
            const filename = file.origin;
            if (filename == "libs/modules/promise/promise.js" || filename == 'libs/modules/promise/promise.min.js') {
                return null;
            }
            if (filename == 'libs/modules/egret/egret.js' || filename == 'libs/modules/egret/egret.min.js') {
                let content = file.contents.toString();
                content += `;window.egret = egret;`;
                content = content.replace(/definition = __global/, "definition = window");
                file.contents = new Buffer(content);
            }
            else {
                let content = file.contents.toString();
                if (
                    filename == "libs/modules/res/res.js" ||
                    filename == 'libs/modules/res/res.min.js' ||
                    filename == 'libs/modules/assetsmanager/assetsmanager.min.js' ||
                    filename == 'libs/modules/assetsmanager/assetsmanager.js'
                ) {
                    content += ";window.RES = RES;"
                }
                if (filename == "libs/modules/eui/eui.js" || filename == 'libs/modules/eui/eui.min.js') {
                    content += ";window.eui = eui;"
                }
                if (filename == 'libs/modules/dragonBones/dragonBones.js' || filename == 'libs/modules/dragonBones/dragonBones.min.js') {
                    content += ';window.dragonBones = dragonBones';
                }
                content = "var egret = window.egret;" + content;
                if (filename == 'main.js') {
                    content += ";window.Main = Main;window.game = game;"
                    fs.readdirSync("./src/view/panel").forEach(name => {
                        var dotIndex = name.indexOf(".");
                        name = name.slice(0, dotIndex);
                        content += `;window["game"]["${name}"] = game.${name};`;
                    });
                }

                if (filename == 'libs/modules/photon/photon.js' || filename == 'libs/modules/photon/photon.min.js') {
                    content += ";window.Photon = Photon";
                    content += ";window.Exitgames = Exitgames";
                }

                if (filename == 'libs/modules/puremvc/puremvc.js') {
                    content = content.replace(/var rootExport = function \(root, __umodule__\) {/g, `var rootExport = function (root, __umodule__) {
                        root['puremvc'] = __umodule__;`);
                    content = content.replace(/\).call\(this\)/g, `).call(window)`);
                    content = content.replace(/rootExport\(global, factory\(require/g, `rootExport(window, factory.call(this, require`);
                }

                if (filename == 'libs/modules/puremvc/puremvc.min.js') {
                    content = content.replace(/var n=function\(i,n\){/g, `var n=function(i,n){i.puremvc=n;`);
                    content = content.replace(/\).call\(this\)/g, `).call(window)`);
                    content = content.replace(/n\(global,i\(/g, `n(window,i.call(this,`);
                    
                    content += ";window.puremvc = puremvc";
                }

                if (filename == 'libs/modules/lodash/lodash.js') {
                    content = content.replace(`var root = freeGlobal || freeSelf || Function('return this')();`,
                        `var root = freeSelf || window;`);
                    content = content.replace(`var _ = runInContext();`, `var _ = runInContext();
                        root._ = _;`)
                }
                if (filename == 'libs/modules/lodash/lodash.min.js') {
                    content = content.replace(`Xe=Ye||Qe||Function("return this")()`,
                        `Xe=Qe||window`);
                    content = content.replace(`gu=_u();`, `gu=_u();Xe._=gu;`);
                }

                file.contents = new Buffer(content);
            }
        }
        return file;
    }
    async onFinish(pluginContext: plugins.CommandContext) {
        //同步 index.html 配置到 game.js
        const gameJSPath = path.join(pluginContext.outputDir, "game.js");
        let gameJSContent = fs.readFileSync(gameJSPath, { encoding: "utf8" });
        const projectConfig = pluginContext.buildConfig.projectConfig;
        const optionStr =
            `entryClassName: ${projectConfig.entryClassName},\n\t\t` +
            `orientation: ${projectConfig.orientation},\n\t\t` +
            `frameRate: ${projectConfig.frameRate},\n\t\t` +
            `scaleMode: ${projectConfig.scaleMode},\n\t\t` +
            `contentWidth: ${projectConfig.contentWidth},\n\t\t` +
            `contentHeight: ${projectConfig.contentHeight},\n\t\t` +
            `showFPS: ${projectConfig.showFPS},\n\t\t` +
            `fpsStyles: ${projectConfig.fpsStyles},\n\t\t` +
            `showLog: ${projectConfig.showLog},\n\t\t` +
            `maxTouches: ${projectConfig.maxTouches},`;
        const reg = /\/\/----auto option start----[\s\S]*\/\/----auto option end----/;
        const replaceStr = '\/\/----auto option start----\n\t\t' + optionStr + '\n\t\t\/\/----auto option end----';
        gameJSContent = gameJSContent.replace(reg, replaceStr);
        fs.writeFileSync(gameJSPath, gameJSContent);

        //修改横竖屏
        let orientation;
        if (projectConfig.orientation == '"landscape"') {
            orientation = "landscape";
        }
        else {
            orientation = "portrait";
        }
        const gameJSONPath = path.join(pluginContext.outputDir, "game.json");
        let gameJSONContent = JSON.parse(fs.readFileSync(gameJSONPath, { encoding: "utf8" }));
        gameJSONContent.deviceOrientation = orientation;
        fs.writeFileSync(gameJSONPath, JSON.stringify(gameJSONContent, null, "\t"));
    }
}