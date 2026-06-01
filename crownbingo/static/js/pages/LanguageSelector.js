import React, {
    useContext
} from 'react';
import {
    LanguageContext
} from '../LanguageContext';

const LanguageSelector = () => {
    const {
        setLanguage
    } = useContext(LanguageContext);

    const handleLanguageChange = (event) => {
        setLanguage(event.target.value);
    };

    return ( <
        select style = {
            {
                background: 'green',
                color: 'white'
            }
        }
        onChange = {
            handleLanguageChange
        }
        defaultValue = "en" >
        <
        option value = "en" > English < /option> <
        option value = "am" > Amharic < /option> { /* Add more languages as needed */ } <
        /select>
    );
};

export default LanguageSelector;