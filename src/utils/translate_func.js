import translate from "/src/requests/translate.js";

export default async (obj) => {
  if (obj.noEngines) {
    return;
  }
  if (obj.isTranslating) {
    return;
  }
  if (!obj.rawContent) {
    return;
  }
  obj.translatedContentArray = [`${obj.systemLanguage.translating}......`];
  obj.isTranslating = true;

  try {
    await translate(
      obj.rawContent,
      obj.tips,
      obj.settings.keys,
      obj.config,
      obj.translatedContentArray,
      obj
    );
  } catch (err) {
    console.error(err);
    obj.translatedContentArray = [obj.systemLanguage.translatingError];
  }
  obj.isTranslating = false;
};
