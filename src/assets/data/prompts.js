export default {
  translation: {
    gpt3: function (sourceLanguage, targetLanguage, auto, content, tips) {
      return (
        (tips
          ? "Requirements and tips for the upcoming translation task: " + tips
          : "") +
        `Please generate the translation of the following text ${
          auto ? "" : "from " + sourceLanguage + " "
        }into ${targetLanguage} without any other explanations: "${content}"`
      );
    },
    gpt4: function (sourceLanguage, targetLanguage, auto, content, tips) {},
    google: function (sourceLanguage, targetLanguage, auto, content, tips) {},
    deepl: function (sourceLanguage, targetLanguage, auto, content, tips) {},
  },
  proofreading: {
    gpt3: function (targetLanguage, content, tips) {
      return (
        `I need you to help me to polish a paragraph from an academic paper in ${targetLanguage}. You need to polish the writing to meet the academic style, to improve the spelling, grammar, clarity, concision and to overall readability. When necessary, rewrite the whole sentence. You must maintain the symbol <br/>. ` +
        (tips
          ? "There are also some extra requirements and tips for the upcoming polishing task: " +
            tips
          : "") +
        `The paragraph you need to polish is: "${content}"`
      );
    },
    gpt4: function (targetLanguage, content, tips) {},
    google: function (targetLanguage, content, tips) {},
    deepl: function (targetLanguage, content, tips) {},
  },
};
