import {
    useContext
} from 'react';
import {
    LanguageContext
} from '../LanguageContext';

const useTranslation = () => {
    const {
        translations
    } = useContext(LanguageContext);

    const t = (key) => {
        return translations[key] || key;
    };

    return {
        t
    };
};

export default useTranslation;