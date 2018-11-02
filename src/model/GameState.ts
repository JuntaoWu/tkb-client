module game {
    export interface GameState {
        hp: { x: number, y: number };  //'host position', the game creators position
        cp: { x: number, y: number };  //'client position', the person that joined, their position
        his: string;  //'host input sequence', the last input we processed for the host
        cis: string;  //'client input sequence', the last input we processed for the client
        t: number;  // our current local time on the server
    }
}