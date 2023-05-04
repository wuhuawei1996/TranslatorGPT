import { readText, writeText } from "@tauri-apps/api/clipboard";
import { invoke } from "@tauri-apps/api/tauri";
import { platform } from "@tauri-apps/api/os";

export default async () => {
  try {
    // 先保存剪贴板原有内容
    let oldContent = (await readText()) || "";
    if (oldContent !== "") {
      await writeText("");
      // 死循环已保证剪贴板内容被清空
      while (await readText()) {}
    }
    const platformName = await platform();
    await invoke("copy_content", { os: platformName }); // 模拟 Ctrl + C
    const beginTime = Date.now();
    // 死循环以保证复制已生效
    while (!(await readText())) {
      const endTime = Date.now();
      if (endTime - beginTime > 1 * 1000) break;
    }

    const rawContent = ((await readText()) || "").trim();
    if (oldContent) await writeText(oldContent); // 还原剪贴板内容
    return rawContent || "";
  } catch (err) {
    console.error(err);
    return "";
  }
};
