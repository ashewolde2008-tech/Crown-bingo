import React from 'react';

const TextToSpeech = ({ text, lang = 'en', rate = 1, pitch = 1, volume = 1, autoSpeak = false, children }) => {
    const speak = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = rate;
            utterance.pitch = pitch;
            utterance.volume = volume;
            window.speechSynthesis.speak(utterance);
        }
    };

    React.useEffect(() => {
        if (autoSpeak && text) speak();
    }, [text, autoSpeak, speak]);

    return children ? React.cloneElement(children, { onClick: speak }) : null;
};

export default TextToSpeech;
