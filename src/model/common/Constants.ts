
module game {

    export class Constants {

        public static get WSEndpoint(): string {
            return platform.name == "DebugPlatform" ? this.Endpoints.ws : this.Endpoints.wss;
        }

        public static get ServiceEndpoint(): string {
            return this.Endpoints.service;
        };

        public static get ResourceEndpoint(): string {
            return platform.name == "DebugPlatform" ? this.Endpoints.localResource : this.Endpoints.remoteResource;
        };

        public static get Endpoints() {
            if (platform.env == "dev") {
                return {
                    // service: "http://gdjzj.hzsdgames.com:8092/",
                    // localResource: "",
                    // remoteResource: "http://gdjzj.hzsdgames.com:8092/miniGame/"
                    service: "http://localhost:4040/",
                    localResource: "",
                    remoteResource: "http://localhost:4040/miniGame/",
                    ws: "ws://localhost:4040/socket.io",
                    wss: "ws://localhost:4040/socket.io"
                };
            }
            if (platform.env == "prod") {
                return {
                    service: "http://gdjzj.hzsdgames.com:8092/",
                    localResource: "",
                    remoteResource: "http://gdjzj.hzsdgames.com:8092/miniGame/",
                    ws: "ws://localhost:4040/socket.io",
                    wss: "wss://localhost:4040/socket.io"
                };
            }
        }
    }

    export const gameType = {
        six: "六人局",
        seven: "七人局",
        eight: "八人局",
    }

    export const gameCamp = {
        xuyuan: "许愿阵营",
        laochaofen: "老朝奉阵营",
    }

    export enum RoleId {
        XuYuan = 1,
        FangZheng,
        JiYunFu,
        HuangYanYan,
        MuHuJiaNai,
        LaoChaoFen,
        YaoBuRan,
        ZhengGuoQu,
    }

    export const GameInfo = {
        attacked: "被药不然偷袭",
        attack: "你偷袭了",
        hide: "你隐藏了",
        reverse: "你调换了真假信息",
        skipSkill: "你跳过了技能",
        cannotJudge: "无法鉴定",
    }
}