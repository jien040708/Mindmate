import { createContext, useContext, useState, ReactNode } from "react";
import { translations, Language, T } from "../i18n/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (l: Language) => void;
  t: T;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "Korean",
  setLanguage: () => {},
  t: translations.Korean,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(
    () => (localStorage.getItem("mindmate_language") as Language) || "Korean"
  );

  const setLanguage = (l: Language) => {
    setLanguageState(l);
    localStorage.setItem("mindmate_language", l);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
