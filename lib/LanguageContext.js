import React, { createContext, useContext, useState, useEffect } from 'react';
import translations from './translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState('en');
    const [isRTL, setIsRTL] = useState(false);

    useEffect(() => {
        // Load saved language from localStorage
        const savedLang = localStorage.getItem('app_language');
        if (savedLang) {
            setLanguage(savedLang);
            setIsRTL(savedLang === 'ar');
        }
    }, []);

    useEffect(() => {
        // Update document direction and save to localStorage
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
        localStorage.setItem('app_language', language);
    }, [language, isRTL]);

    const toggleLanguage = () => {
        const newLang = language === 'en' ? 'ar' : 'en';
        setLanguage(newLang);
        setIsRTL(newLang === 'ar');
    };

    const t = (key) => {
        return translations[language]?.[key] || translations['en']?.[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, isRTL, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

export default LanguageContext;
