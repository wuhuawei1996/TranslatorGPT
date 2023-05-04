export const translationFormatter = (obj, raw) => {
  let s = obj.noEngines
    ? obj.systemLanguage["noEngine"] + obj.systemLanguage["period"]
    : obj.translatedContentArray.length > 1
    ? obj.translatedContentArray
        .filter((item) => item != `${obj.systemLanguage.translating}......`)
        .join("")
    : obj.translatedContentArray.join("");

  if (
    s.length > 0 &&
    raw.length > 0 &&
    s[s.length - 1] === '"' &&
    s[0] === '"'
  ) {
    if (raw[raw.length - 1] !== '"' && raw[0] !== '"') {
      s = s.slice(0, s.length - 1);
      s = s.slice(1);
    }
  }
  return encodeHTML(s).replace(/\n/g, "<br/>");
};

const encodeHTML = (str) => {
  const ele = document.createElement("span");
  ele.appendChild(document.createTextNode(str));
  return ele.innerHTML;
};

export const tipsHandler = (tips) => {
  tips = tips
    .split("+")
    .filter((item) => item.trim().length > 0)
    .map((item, index) => index + 1 + "." + item.trim())
    .join(";");
  while (tips.length > 0 && tips[tips.length - 1] === ".") {
    tips = tips.slice(0, tips.length - 1);
  }
  return tips ? tips + ". " : "";
};
