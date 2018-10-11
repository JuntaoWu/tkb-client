
module game {
    export class DragonBones {

        public static createDragonBone(dragonBoneName: string, armatureName: string): dragonBones.EgretArmatureDisplay {
            let egretFactory: dragonBones.EgretFactory = dragonBones.EgretFactory.factory;

            if (!egretFactory.getDragonBonesData(dragonBoneName)) {
                var dragonbonesData = RES.getRes(`${dragonBoneName}_ske_json`);
                egretFactory.parseDragonBonesData(dragonbonesData);
            }

            if (!egretFactory.getTextureAtlasData(dragonBoneName)) {
                var textureData = RES.getRes(`${dragonBoneName}_tex_json`);
                var texture = RES.getRes(`${dragonBoneName}_tex_png`);
                egretFactory.parseTextureAtlasData(textureData, texture);
            }

            let armatureDisplay: dragonBones.EgretArmatureDisplay = egretFactory.buildArmatureDisplay(armatureName);

            // armatureDisplay.x = 200;
            // armatureDisplay.y = 300;
            // armatureDisplay.scaleX = 0.5;
            // armatureDisplay.scaleY = 0.5;

            return armatureDisplay;
        }

    }
}