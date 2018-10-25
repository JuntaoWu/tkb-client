
module game {

    export class SoundPool {

        public static musicClips = {};

        public static playSoundEffect(soundName: string): egret.SoundChannel {
            let sound: egret.Sound = RES.getRes(soundName);
            if (!sound) {
                console.error(`playSoundEffect: Unable to load sound: ${soundName}`);
                return;
            }
            return sound.play(0, 1);
        }

        public static stopBGM() {
            for (var name in SoundPool.musicClips) {
                if (SoundPool.musicClips.hasOwnProperty(name)) {
                    let chanel: egret.SoundChannel = SoundPool.musicClips[name];
                    chanel.stop();
                }
            }
        }

        public static playBGM(soundName: string): egret.SoundChannel {

            SoundPool.stopBGM();

            let music: egret.Sound = RES.getRes(soundName);

            if (!music) {
                console.error(`playBGM: Unable to load music: ${soundName}`);
                return;
            }

            SoundPool.musicClips[soundName] = music.play();

            return SoundPool.musicClips[soundName];
        }
    }
}