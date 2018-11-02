module game {

    export class Game {
        public id: string;                //generate a new id for the game
        public playerHost: Client;         //so we know who initiated the game
        public playerClient: Client;         //nobody else joined yet, since its new
        public playerCount: number;              //for simple checking of state
        public core: GameCore;

        public active?: boolean;
    }

    export interface Client extends SocketIOClient.Socket {
        game: Game;
        userId: string;
        openId: string;

        hosting: boolean;
    }

}