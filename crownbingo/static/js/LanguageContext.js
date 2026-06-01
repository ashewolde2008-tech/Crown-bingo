import React, {
    createContext,
    useState,
    useEffect
} from 'react';

// Initialize the Language Context
export const LanguageContext = createContext();

// Language Provider component
export const LanguageProvider = ({
    children
}) => {
    const [language, setLanguage] = useState('en');
    const [translations, setTranslations] = useState({});

    useEffect(() => {
        // Load language JSON file dynamically
        const loadTranslations = async () => {
            const langData = await
            import (`./locales/${language}.json`);
            setTranslations(langData);
        };
        loadTranslations();
    }, [language]);

    return ( <
        LanguageContext.Provider value = {
            {
                language,
                setLanguage,
                translations
            }
        } > {
            children
        } <
        /LanguageContext.Provider>
    );
};