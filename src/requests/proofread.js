import stream from "/src/utils/stream.js";
import { engineNames } from "/src/assets/data/engine_names.js";
import { tipsHandler } from "/src/utils/result_formatter.js";
import { gpt3ResultHandler } from "./result_handler";
import prompts from "/src/assets/data/prompts.js";
import LanguageNames, {
  languageNameFormatter,
} from "/src/assets/data/language_names.js";

export default async function proofread(
  content,
  tips,
  apiKeys,
  engine,
  targetLanguage,
  resultArray,
  proofreadingObj
) {
  const apiKey = apiKeys[engine];
  const { url, name: model } = engineNames[engine];
  const prompt = prompts["proofreading"][engine];

  await proofreadFunctions[engine](
    url,
    model,
    content,
    tips,
    apiKey,
    targetLanguage,
    resultArray,
    proofreadingObj,
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
  targetLanguage,
  resultArray,
  proofreadingObj,
  prompt
) => {
  // 若内容为空，则不翻译
  if (!content) {
    return;
  }
  content = content.replace(/\n/g, "<br/>");
  const headers = gpt3HeaderGenerator(apiKey);
  tips = tipsHandler(tips);
  targetLanguage = languageNameFormatter(
    LanguageNames["English"][targetLanguage]
  );
  console.log(prompt(targetLanguage, content, tips));
  const body = JSON.stringify({
    model,
    messages: [
      {
        role: "user",
        content: prompt(targetLanguage, content, tips),
      },
    ],
    stream: true,
  });

  const stopCondition = () => {
    return !proofreadingObj.isProofreading;
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

const proofreadFunctions = {
  gpt3,
  gpt4: () => {},
};
