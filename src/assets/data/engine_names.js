export const engineNames = {
  gpt3: {
    label: "GPT-3.5",
    name: "gpt-3.5-turbo",
    url: "https://api.openai.com/v1/chat/completions",
    proofreading: true,
  },
  /*gpt4: { label: "GPT-4", name: "", proofreading: true },
  google: { label: "Google", name: "", proofreading: false },
  deepl: { label: "DeepL", name: "", proofreading: false },*/
};

export default Object.keys(engineNames).map((key) => {
  return {
    key,
    label: engineNames[key]["label"],
    name: engineNames[key]["name"],
    proofreading: engineNames[key]["proofreading"],
  };
});
