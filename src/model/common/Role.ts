module game {

    export class Role {
        public id: number;
        public name: string;
        public res: string;
        public roleCheckCount: number;
        public authRes: string;
        public isAuth: boolean;
        public isSkip: boolean;
        public roleDescription: string;
        public roleSubDescription: string;
        public camp: string;
        public skillDescription: string;
        public skillRes: string;

        public hasActiveSkill: boolean;
    }

}