const obj = {
  gpt3: "GPT-3.5",
  gpt4: "GPT-4",
  google: "Google",
  deepl: "DeepL",
};
export default Object.keys(obj).map((key) => {
  return {
    key,
    label: obj[key],
  };
});
