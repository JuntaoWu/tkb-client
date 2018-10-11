
module game {
    export class UserInfo {
        openId?: string;
        public avatarUrl?: string;
        public city?: string;
        public country?: string;
        public gender?: number;
        public language?: string;
        public nickName?: string;
        public province?: string;

        public gameRecords?: MyStats;
    }
}