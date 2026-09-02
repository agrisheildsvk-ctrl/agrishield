import React, { createContext, useState, useContext, useEffect } from 'react';

const translations = {
  en: {
    home: "Home",
    shop: "Shop",
    categories: "Categories",
    my_orders: "My Orders",
    vedika: "Vedika",
    about: "About",
    contact: "Contact",
    blog: "Blogs",
    search_placeholder: "Search for seeds, fertilizers...",
    login: "Login",
    cart: "Cart",
    add_to_cart: "Add to Cart",
    buy_now: "Buy Now"
  },
  hi: {
    home: "होम",
    shop: "दुकान",
    categories: "श्रेणियां",
    my_orders: "मेरे ऑर्डर",
    vedika: "वेदिका",
    about: "हमारे बारे में",
    contact: "संपर्क करें",
    blog: "ब्लॉग",
    search_placeholder: "बीज, उर्वरक खोजें...",
    login: "लॉग इन करें",
    cart: "कार्ट",
    add_to_cart: "कार्ट में जोड़ें",
    buy_now: "अभी खरीदें"
  },
  kn: {
    home: "ಮುಖಪುಟ",
    shop: "ಅಂಗಡಿ",
    categories: "ವರ್ಗಗಳು",
    my_orders: "ನನ್ನ ಆರ್ಡರ್‌ಗಳು",
    vedika: "ವೇದಿಕಾ",
    about: "ನಮ್ಮ ಬಗ್ಗೆ",
    contact: "ಸಂಪರ್ಕಿಸಿ",
    blog: "ಬ್ಲಾಗ್‌ಗಳು",
    search_placeholder: "ಬೀಜಗಳು, ರಸಗೊಬ್ಬರಗಳನ್ನು ಹುಡುಕಿ...",
    login: "ಲಾಗಿನ್",
    cart: "ಕಾರ್ಟ್",
    add_to_cart: "ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ",
    buy_now: "ಈಗಲೇ ಖರೀದಿಸಿ"
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
