
module game {
    export class Level {
        public balls: Array<GameObjectInfo>;
        public walls: Array<GameObjectInfo>;
        public holes: Array<GameObjectInfo>;
    }

    export class GameObjectInfo {
        public width: any;
        public height: any;
        public x: any;
        public y: any;
        public bodyType: BodyType;
        public angle?: any;
        public endX?: any;
        public endY?: any;
    }

    export enum BodyType {
        TYPE_HOLE = 1,
        TYPE_STATIC_WALL = 2,
        TYPE_ATTACK_WALL = 3,
        TYPE_MOVING_WALL = 4,
        TYPE_ENEMY = 5,
        TYPE_HERO = 6,
        TYPE_MASS = 7,
    }
}