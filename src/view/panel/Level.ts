
module game {
    export class Level {
        public _id: string;
        public balls: Array<GameObjectInfo>;
        public walls: Array<GameObjectInfo>;
        public holes: Array<GameObjectInfo>;
        public stars: Array<GameObjectInfo>;
        public answer: Answer;
    }

    export class Answer {
        public time: number;
        public x: number;
        public y: number;
    }

    export class GameObjectInfo {
        public width: any;
        public height: any;
        public x: any;
        public y: any;
        public bodyType: BodyType;
        public angle?: any;
        public offset?: number;
        public hp?: number;
        public speed?: any;
        public reverseDirection?: any
    }

    export enum BodyType {
        TYPE_HOLE = 1,
        TYPE_STATIC_WALL = 2,
        TYPE_ATTACK_WALL = 3,
        TYPE_MOVING_WALL = 4,
        TYPE_ENEMY = 5,
        TYPE_HERO = 6,
        TYPE_MASS = 7,
        TYPE_MOVING_WALL_V = 8,
        TYPE_ATTACK_MOVING_WALL = 9,
        TYPE_ATTACK_MOVING_WALL_V = 10,
        TYPE_STAR = 11,
    }
}