export default async function (
  headers,
  body,
  url,
  resultArray,
  dataHandler,
  stopCondition // 用于暂停请求，避免浪费资源
) {
  const response = await fetch(url, {
    method: "POST",
    headers,
    body,
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
    if (stopCondition() || done) {
      return Promise.resolve();
    }

    var decoder = new TextDecoder();
    const data = decoder.decode(value);
    if (data) {
      dataHandler(data, resultArray);
    }
    // 继续读取下一个数据块，并递归调用processChunk函数
    return reader.read().then(processChunk);
  }

  // 开始读取第一个数据块，并调用processChunk函数
  await reader.read().then(processChunk);
}
