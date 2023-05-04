import stream from "/src/utils/stream.js";
import LanguageNames, {
  languageNameFormatter,
} from "/src/assets/data/language_names.js";
import { engineNames } from "/src/assets/data/engine_names.js";
import { tipsHandler } from "/src/utils/result_formatter.js";
import { gpt3ResultHandler } from "./result_handler";
import prompts from "/src/assets/data/prompts.js";

export default async function translate(
  content,
  tips,
  apiKeys,
  translationConfig,
  resultArray,
  translatingObj
) {
  const { engine } = translationConfig;
  const apiKey = apiKeys[engine];
  const { url, name: model } = engineNames[engine];
  const prompt = prompts["translation"][engine];

  await translateFunctions[engine](
    url,
    model,
    content,
    tips,
    apiKey,
    translationConfig,
    resultArray,
    translatingObj,
    prompt
  );
}

// GPT-3
const gpt3HeaderGenerator = (apiKey) => {
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + apiKey,
  };
};
const gpt3 = async (
  url,
  model,
  content,
  tips,
  apiKey,
  translationConfig,
  resultArray,
  translatingObj,
  prompt
) => {
  let { sourceLanguage, targetLanguage } = translationConfig;

  const auto = sourceLanguage === "auto";
  if (!auto) {
    sourceLanguage = languageNameFormatter(
      LanguageNames["English"][sourceLanguage]
    );
  }
  targetLanguage = languageNameFormatter(
    LanguageNames["English"][targetLanguage]
  );

  content = gpt3ContentHandler(content);
  // 若内容为空，则不翻译
  if (!content) {
    resultArray.length = 0;
    translatingObj.isTranslating = false;
  }

  tips = tipsHandler(tips);

  const headers = gpt3HeaderGenerator(apiKey);

  console.log(prompt(sourceLanguage, targetLanguage, auto, content, tips));
  const body = JSON.stringify({
    model,
    messages: [
      {
        role: "user",
        content: prompt(sourceLanguage, targetLanguage, auto, content, tips),
      },
    ],
    stream: true,
  });

  const stopCondition = () => {
    return !translatingObj.isTranslating;
  };

  await stream(
    headers,
    body,
    url,
    resultArray,
    gpt3ResultHandler,
    stopCondition
  );
};

const gpt3ContentHandler = (content) => {
  /* 数据预处理 */
  // 发现英文的结尾如果是逗号，会生成奇怪的内容，所以去掉
  while (content.length > 0 && content[content.length - 1] === ",") {
    content = content.slice(0, content.length - 1);
  }

  if (!content) {
    return "";
  }

  if (/\w/.test(content[content.length - 1])) {
    content += ".";
  }

  return content;
};

const translateFunctions = {
  gpt3,
  gpt4: () => {},
  google: () => {},
  deepl: () => {},
};
