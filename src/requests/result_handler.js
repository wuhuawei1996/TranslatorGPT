export const gpt3ResultHandler = (data, resultArray) => {
  data
    .split("\n")
    .filter((item) => {
      return item.substring(0, 5) === "data:" && item !== "data: [DONE]";
    })
    .map((item) => {
      return JSON.parse(item.substring(5).trim());
    })
    .filter((item) => {
      return (
        item.choices &&
        item.choices[0] &&
        item.choices[0].delta &&
        item.choices[0].delta.content
      );
    })
    .map((item, index) => {
      const content = item.choices[0].delta.content;
      if (index == 0 && content.trim().length === 0) {
        return;
      } else {
        resultArray.push(content);
      }
    });
};
