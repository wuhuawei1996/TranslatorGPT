<script>
// Public
import { Command } from "@tauri-apps/api/shell";
import { platform } from "@tauri-apps/api/os";
import { appWindow, PhysicalPosition } from "@tauri-apps/api/window";
import { readText, writeText } from "@tauri-apps/api/clipboard";
import { invoke } from "@tauri-apps/api/tauri";
import sleep from "/src/utils/sleep.js";
import { emit } from "@tauri-apps/api/event";
import {
  register,
  isRegistered,
  unregister,
} from "@tauri-apps/api/globalShortcut";

// Private
import stream from "/src/utils/stream.js";

const positionCommandArg =
  "& {Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Cursor]::Position.X; [System.Windows.Forms.Cursor]::Position.Y}";

export default {
  name: "Main",
  props: {
    config: {},
    settings: {},
    headerHeight: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      isGettingMousePosition: false,
      rawContent: "",
      translatedContentArray: [],
      tips: "",
    };
  },
  computed: {
    engineOptions() {
      const keys = this.settings.keys;
      return [
        {
          label: "ChatGPT",
          value: "gpt3",
          key: keys.gpt3,
        },
        {
          label: "Google",
          value: "google",
          key: keys.google,
        },
        {
          label: "DeepL",
          value: "deepl",
          key: keys.deepl,
        },
      ].filter((item) => item.key);
    },
    noEngines() {
      return this.engineOptions.length === 0;
    },
    translatedContent() {
      return this.noEngines
        ? this.systemLanguage["noEngine"] + this.systemLanguage["period"]
        : this.translatedContentArray.length > 1
        ? this.translatedContentArray
            .filter(
              (item) => item != `${this.systemLanguage.translating}......`
            )
            .join("")
        : this.translatedContentArray.join("");
    },
    systemLanguage() {
      return this.$root.systemLanguage;
    },
  },
  watch: {
    "translatedContentArray.length"() {
      this.$nextTick(() => this.scrollToBottom());
    },
  },
  methods: {
    // 同步翻译数据
    async syncTranslationConfig() {
      const { rawContent, translatedContentArray, tips } = this;
      await emit("sync_translation_data", {
        data: {
          rawContent,
          translatedContentArray,
          tips,
        },
      });
      this.rawContent = "";
    },
    // 显示翻译结果窗口
    async showWindow() {
      try {
        await appWindow.hide();
        this.changeHeaderVisibility(false);
        this.translatedContentArray = [
          `${this.systemLanguage.translating}......`,
        ];
        const [x, y] = await this.getMousePosition();
        this.rawContent = await this.getRawContent();
        if (x >= 0 && y >= 0) {
          await this.setWindowPosition(x, y);
          await this.translate();
        } else {
          throw new Error();
        }
      } catch (err) {
        console.error(err);
        this.translatedContentArray = [this.systemLanguage.translatingError];
      }
    },
    // 刷新翻译内容
    async refreshTranslation() {
      try {
        this.translatedContentArray = [
          `${this.systemLanguage.translating}......`,
        ];
        await this.translate();
      } catch (err) {
        console.error(err);
        this.translatedContentArray = [this.systemLanguage.translatingError];
      }
    },
    // 发起翻译请求
    async translate() {
      if (!this.rawContent) {
        this.translatedContentArray = [this.systemLanguage.noContent];
        return;
      }
      return await stream(
        this.rawContent,
        this.config,
        this.config.sourceLanguages === this.systemLanguage.autoLanguage,
        this.translatedContentArray
      );
    },
    // 获取剪贴板内容
    async getRawContent() {
      let oldContent = (await readText()) || "";
      if (oldContent !== "") {
        await writeText("");
        // 死循环已保证剪贴板内容被清空
        while (await readText()) {}
      }
      await invoke("copy_content", {}); // 模拟 Ctrl + C
      let count = 10;
      // 死循环以保证复制已生效
      while (!(await readText())) {
        count--;
        await sleep(100);
        if (count < 0) break;
      }
      const rawContent = (await readText()) || "";
      if (oldContent) await writeText(oldContent); // 还原剪贴板内容
      return rawContent.trim() ? rawContent : "";
    },
    // 获取鼠标指针当前位置
    async getMousePosition() {
      const platformName = await platform();
      switch (platformName) {
        case "win32": {
          return await this.getMousePositionWin();
          break;
        }
        case "darwin": {
          break;
        }
      }
    },
    // Windows 获取鼠标指针当前位置
    getMousePositionWin() {
      return new Promise((resolve) => {
        if (this.isGettingMousePosition) {
          resolve([-1, -1]);
        }
        this.isGettingMousePosition = true;
        const result = [];
        const command = new Command("getMousePosition", [
          "-command",
          positionCommandArg,
        ]);
        command.on("close", async () => {
          this.isGettingMousePosition = false;
          resolve(result);
        });
        command.stdout.on("data", (line) => {
          line = line.trim();
          if (/^[0-9]*$/.test(line) && result.length < 2)
            result.push(parseInt(line));
        });
        // command.stderr.on("data", (line) => console.log(line));
        command.spawn();
      });
    },
    // 设置窗口位置
    async setWindowPosition(x, y) {
      try {
        const offset = 10;

        const { windowWidth, windowHeight, screenWidth, screenHeight } =
          this.$root;
        const marginBottom =
          screenHeight - (y - this.headerHeight + windowHeight); // 要扣掉 Header 的高度
        const marginRight = screenWidth - (x + windowWidth);
        x = marginRight < 30 ? x - windowWidth - offset : x + offset;
        y =
          marginBottom < 100
            ? y - windowHeight - offset
            : y - this.headerHeight + offset;
        await appWindow.setPosition(new PhysicalPosition(x, y));
        await appWindow.show();
        await appWindow.setFocus();
      } catch (err) {
        console.log(err);
      }
    },
    // 滚动到最底部
    scrollToBottom() {
      this.$refs["myScrollbar"].setScrollTop(
        this.$refs["myScrollbar"].wrapRef.scrollHeight
      );
    },
    // 修改 Header 的 Visibility
    changeHeaderVisibility(arg) {
      this.$root.isHeaderVisible = arg;
    },

    // 注册快捷键
    async registerShortcuts() {
      const getMousePositionShortcut = "CommandOrControl+Shift+G";
      await unregister(getMousePositionShortcut);
      if (!(await isRegistered(getMousePositionShortcut))) {
        await register(getMousePositionShortcut, () => {
          this.showWindow();
        });
      }
    },
  },
  mounted() {
    this.registerShortcuts();
  },
};
</script>
<template>
  <div class="main">
    <el-scrollbar class="main-container" ref="myScrollbar">
      <span class="label">{{ systemLanguage["translation"] }}</span
      ><span>{{ translatedContent }}</span>
    </el-scrollbar>
    <el-form-item :label="systemLanguage['hint']" class="tips">
      <el-input
        class="no-border-input"
        v-model="tips"
        :title="systemLanguage['inputHints']"
        :placeholder="systemLanguage['inputHints']"
      />
    </el-form-item>
  </div>
</template>

<style lang="scss">
$main-container-padding-horizontal: 25px;
$main-container-padding-vertical: 0px;
$main-container-margin-horizontal: 15px;
$tips-height: 30px;
$tips-margin: 10px;
$grey: #93959f;

.main {
  display: flex;
  flex-direction: column;
  font-size: 16px;
  overflow-y: auto;

  .main-container {
    width: calc(100% - 50px);
    height: calc(
      100% - #{$main-container-padding-vertical} * 2 - #{$main-container-margin-horizontal} *
        2 - #{$tips-height} - #{$tips-margin}
    );
    margin: $main-container-margin-horizontal 0px;
    padding: $main-container-padding-vertical $main-container-padding-horizontal;

    span {
      font-size: 15px;
      line-height: 30px;
      vertical-align: middle;
    }
  }

  .label {
    color: $grey;
  }

  .tips {
    height: $tips-height !important;
    font-size: 13px;
    padding: 0px $main-container-padding-horizontal;
    margin: 0px 0px $tips-margin 0px;

    label {
      padding-right: 0px !important;
      line-height: 30px;
      color: $grey !important;
    }

    .el-input__wrapper {
      padding: 0px !important;
    }
  }
}
</style>
