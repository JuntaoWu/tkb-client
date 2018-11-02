
interface Number {
    fixed(n?: number): number;
}

Number.prototype.fixed = (n?: number) => { n = n || 3; return parseFloat(this.toFixed(n)); };

module game {

    export class AppConfig {
        public constructor() {
        }
    }
}