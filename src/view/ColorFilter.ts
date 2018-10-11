
module game {

    export class ColorFilter {
        public static get grey() {
            const colorMatrix = [
                0.15, 0.3, 0, 0, 0,
                0.15, 0.3, 0, 0, 0,
                0.15, 0.3, 0, 0, 0,
                0, 0, 0, 1, 0
            ];

            var colorFilter = new egret.ColorMatrixFilter(colorMatrix);
            return colorFilter;
        }
    }
    
}