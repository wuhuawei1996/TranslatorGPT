import languageNames from "/src/assets/data/language_names";
import systemLanguage from "/src/assets/data/system_language";

export default (language) => {
  const languages = languageNames[language];
  return Object.keys(languages).map((item) => {
    return {
      label: languages[item],
      value: item,
    };
  });
};
