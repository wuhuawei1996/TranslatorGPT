export default async function (content, config, auto, resultArray) {
  const headers = {
    "Content-Type": "application/json",
    Authorization:
      "Bearer " + "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",
  };
  const { sourceLanguage, targetLanguage } = config;
  const body = JSON.stringify({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `Translate ${
          auto ? "" : sourceLanguage + ""
        }to ${targetLanguage}:${content}`,
      },
    ],
    stream: true,
  });

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: headers,
    body: body,
  });

  if (!response || !response.ok) {
    // 如果不成功，抛出一个错误，并包含响应的状态码和文本
    if (response) {
      console.error(response);
      throw new Error();
    }
  }
  // 获取响应的可读流
  const stream = response.body;
  // 创建一个reader来读取流中的数据
  const reader = stream.getReader();

  // 定义一个函数来处理数据块
  function processChunk({ done, value }) {
    // 如果流已经结束，返回一个promise
    if (done) {
      return Promise.resolve();
    }

    var decoder = new TextDecoder();
    const data = decoder.decode(value);
    if (data) {
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
    }
    // 继续读取下一个数据块，并递归调用processChunk函数
    return reader.read().then(processChunk);
  }

  // 开始读取第一个数据块，并调用processChunk函数

  await reader.read().then(processChunk);
}
