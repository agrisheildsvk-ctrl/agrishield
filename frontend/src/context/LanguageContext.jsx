import React, { createContext, useState, useContext, useEffect } from 'react';

const translations = {
  en: {
    home: "Home",
    shop: "Shop",
    about: "About",
    contact: "Contact",
    search_placeholder: "Search for seeds, fertilizers...",
    login: "Login",
    cart: "Cart"
  },
  hi: {
    home: "होम",
    shop: "दुकान",
    about: "हमारे बारे में",
    contact: "संपर्क करें",
    search_placeholder: "बीज, उर्वरक खोजें...",
    login: "लॉग इन करें",
    cart: "कार्ट"
  },
  kn: {
    home: "ಮುಖಪುಟ",
    shop: "ಅಂಗಡಿ",
    about: "ನಮ್ಮ ಬಗ್ಗೆ",
    contact: "ಸಂಪರ್ಕಿಸಿ",
    search_placeholder: "ಬೀಜಗಳು, ರಸಗೊಬ್ಬರಗಳನ್ನು ಹುಡುಕಿ...",
    login: "ಲಾಗಿನ್",
    cart: "ಕಾರ್ಟ್"
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('appLanguage') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('appLanguage', language);

    const applyGoogleTranslate = (lang) => {
      const gtCombo = document.querySelector('.goog-te-combo');
      if (gtCombo) {
        // Only trigger if it's different to prevent infinite loops
        if (gtCombo.value !== lang) {
          gtCombo.value = lang;
          gtCombo.dispatchEvent(new Event('change'));
        }
      }
    };

    // Try applying immediately
    applyGoogleTranslate(language);
    
    // Try again after a short delay in case the Google script is still loading
    const timeoutId = setTimeout(() => applyGoogleTranslate(language), 1000);
    const timeoutId2 = setTimeout(() => applyGoogleTranslate(language), 3000);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(timeoutId2);
    };
  }, [language]);

  const t = (key) => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
