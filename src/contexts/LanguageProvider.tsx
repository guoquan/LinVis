import { useState, type ReactNode } from 'react';
import { translations, type Language, type TranslationKey } from '../locales/translations';
import { LanguageContext } from './LanguageContext';

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Default to Chinese if browser language starts with 'zh', otherwise English
  const defaultLang = navigator.language.startsWith('zh') ? 'zh' : 'en';
  const [language, setLanguage] = useState<Language>(defaultLang);

  const t = (key: TranslationKey) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

