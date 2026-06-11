import { Howl } from 'howler';
import b1Sound from '../assets/bingosound/b1.mp3';

import b2Sound from '../assets/bingosound/b2.mp3';
import b3Sound from '../assets/bingosound/b3.mp3';
import b4Sound from '../assets/bingosound/b4.mp3';
import b5Sound from '../assets/bingosound/b5.mp3';
import b6Sound from '../assets/bingosound/b6.mp3';
import b7Sound from '../assets/bingosound/b7.mp3';
import b8Sound from '../assets/bingosound/b8.mp3';
import b9Sound from '../assets/bingosound/b9.mp3';
import b10Sound from '../assets/bingosound/b10.mp3';
import b11Sound from '../assets/bingosound/b11.mp3';
import b12Sound from '../assets/bingosound/b12.mp3';
import b13Sound from '../assets/bingosound/b13.mp3';
import b14Sound from '../assets/bingosound/b14.mp3';
import b15Sound from '../assets/bingosound/b15.mp3';
import b16Sound from '../assets/bingosound/b16.mp3';
import b17Sound from '../assets/bingosound/b17.mp3';
import b18Sound from '../assets/bingosound/b18.mp3';
import b19Sound from '../assets/bingosound/b19.mp3';
import b20Sound from '../assets/bingosound/b20.mp3';
import b21Sound from '../assets/bingosound/b21.mp3';
import b22Sound from '../assets/bingosound/b22.mp3';
import b23Sound from '../assets/bingosound/b23.mp3';
import b24Sound from '../assets/bingosound/b24.mp3';
import b25Sound from '../assets/bingosound/b25.mp3';
import b26Sound from '../assets/bingosound/b26.mp3';
import b27Sound from '../assets/bingosound/b27.mp3';
import b28Sound from '../assets/bingosound/b28.mp3';
import b29Sound from '../assets/bingosound/b29.mp3';
import b30Sound from '../assets/bingosound/b30.mp3';
import b31Sound from '../assets/bingosound/b31.mp3';
import b32Sound from '../assets/bingosound/b32.mp3';
import b33Sound from '../assets/bingosound/b33.mp3';
import b34Sound from '../assets/bingosound/b34.mp3';
import b35Sound from '../assets/bingosound/b35.mp3';
import b36Sound from '../assets/bingosound/b36.mp3';
import b37Sound from '../assets/bingosound/b37.mp3';
import b38Sound from '../assets/bingosound/b38.mp3';
import b39Sound from '../assets/bingosound/b39.mp3';
import b40Sound from '../assets/bingosound/b40.mp3';
import b41Sound from '../assets/bingosound/b41.mp3';
import b42Sound from '../assets/bingosound/b42.mp3';
import b43Sound from '../assets/bingosound/b43.mp3';
import b44Sound from '../assets/bingosound/b44.mp3';
import b45Sound from '../assets/bingosound/b45.mp3';
import b46Sound from '../assets/bingosound/b46.mp3';
import b47Sound from '../assets/bingosound/b47.mp3';
import b48Sound from '../assets/bingosound/b48.mp3';
import b49Sound from '../assets/bingosound/b49.mp3';
import b50Sound from '../assets/bingosound/b50.mp3';
import b51Sound from '../assets/bingosound/b51.mp3';
import b52Sound from '../assets/bingosound/b52.mp3';
import b54Sound from '../assets/bingosound/b54.mp3';
import b55Sound from '../assets/bingosound/b55.mp3';
import b56Sound from '../assets/bingosound/b56.mp3';
import b57Sound from '../assets/bingosound/b57.mp3';
import b58Sound from '../assets/bingosound/b58.mp3';
import b59Sound from '../assets/bingosound/b59.mp3';
import b60Sound from '../assets/bingosound/b60.mp3';
import b61Sound from '../assets/bingosound/b61.mp3';
import b62Sound from '../assets/bingosound/b62.mp3';
import b63Sound from '../assets/bingosound/b63.mp3';
import b64Sound from '../assets/bingosound/b64.mp3';
import b65Sound from '../assets/bingosound/b65.mp3';
import b66Sound from '../assets/bingosound/b66.mp3';
import b67Sound from '../assets/bingosound/b67.mp3';
import b68Sound from '../assets/bingosound/b68.mp3';
import b69Sound from '../assets/bingosound/b69.mp3';
import b70Sound from '../assets/bingosound/b70.mp3';
import b71Sound from '../assets/bingosound/b71.mp3';
import b72Sound from '../assets/bingosound/b72.mp3';
import b73Sound from '../assets/bingosound/b73.mp3';
import b74Sound from '../assets/bingosound/b74.mp3';
import b75Sound from '../assets/bingosound/b75.mp3';
import b53Sound from '../assets/bingosound/b53.mp3';
import bingo from './bingo.mp3'
import stopBingo from './stop.mp3'
import shuf from './shuffle.mp3'
import goodBingo from './goodBingo.mp3'
// ...import other sounds

const audioFiles = [
    b1Sound, b2Sound, b3Sound, b4Sound, b5Sound, b6Sound, b7Sound, b8Sound, b9Sound, b10Sound,
    b11Sound, b12Sound, b13Sound, b14Sound, b15Sound, b16Sound, b17Sound, b18Sound, b19Sound, b20Sound,
    b21Sound, b22Sound, b23Sound, b24Sound, b25Sound, b26Sound, b27Sound, b28Sound, b29Sound, b30Sound,
    b31Sound, b32Sound, b33Sound, b34Sound, b35Sound, b36Sound, b37Sound, b38Sound, b39Sound, b40Sound,
    b41Sound, b42Sound, b43Sound, b44Sound, b45Sound, b46Sound, b47Sound, b48Sound, b49Sound, b50Sound,
    b51Sound, b52Sound, b53Sound, b54Sound, b55Sound, b56Sound, b57Sound, b58Sound, b59Sound, b60Sound,
    b61Sound, b62Sound, b63Sound, b64Sound, b65Sound, b66Sound, b67Sound, b68Sound, b69Sound, b70Sound, b71Sound, b72Sound,
    b73Sound, b74Sound, b75Sound, stopBingo, shuf, bingo, goodBingo
];
const sounds = audioFiles.map(src => new Howl({
    src
}));

let currentPlayingIndex = null;

const playAudio = (index) => {
    if (currentPlayingIndex !== null) {
        sounds[currentPlayingIndex].stop(); // Stop the current sound if any
    }

    // If a file reference (string/URL from import) is passed, resolve to numeric index
    if (typeof index === 'string') {
        index = audioFiles.indexOf(index);
    }

    if (index >= 0 && index < sounds.length) {
        sounds[index].play();
        currentPlayingIndex = index;
    } else {
        console.error('Invalid audio index:', index);
    }
};

const stopAudio = () => {
    if (currentPlayingIndex !== null) {
        sounds[currentPlayingIndex].stop();
    }
};

export {
    playAudio,
    stopAudio
};