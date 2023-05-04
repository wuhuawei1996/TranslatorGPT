import { createWorker } from "tesseract.js";
export default (base64, sourceLanguage) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;
    img.onload = async function () {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width * 2; // 放大一倍可以增加中文识别效果
        canvas.height = img.height * 2;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const enlargedBase64 = canvas.toDataURL();

        const worker = await createWorker();
        await worker.loadLanguage(sourceLanguage);
        await worker.initialize(sourceLanguage);
        const {
          data: { text },
        } = await worker.recognize(enlargedBase64);
        resolve(text);
      } catch (err) {
        console.error(err);
        resolve("");
      }
    };
    img.onerror = function (err) {
      console.error(err);
      resolve("");
    };
  });
};
