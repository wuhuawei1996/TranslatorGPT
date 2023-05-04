<script>
// Public
import { platform } from "@tauri-apps/api/os";
import { appWindow, PhysicalPosition } from "@tauri-apps/api/window";
import { readText, writeText } from "@tauri-apps/api/clipboard";
import { invoke } from "@tauri-apps/api/tauri";
import sleep from "/src/utils/sleep.js";
import { listen, emit } from "@tauri-apps/api/event";

// Private
import stream from "/src/utils/stream.js";
import { translationFormatter } from "/src/utils/result_formatter.js";
import getSelectedText from "/src/utils/get_selected_text.js";
import ocr from "/src/utils/ocr.js";
import translateFunc from "/src/utils/translate_func.js";

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
      listeners: [],
      isGettingMousePosition: false,
      rawContent: "",
      isTranslating: false,
      translatedContentArray: [],
      tips: "",
    };
  },
  computed: {
    // 是否有可用引擎
    noEngines() {
      return this.config.engine === "";
    },
    // 翻译后的内容
    translatedContent() {
      return translationFormatter(this, this.rawContent);
    },
    // 系统语言
    systemLanguage() {
      return this.$root.systemLanguage;
    },
  },
  watch: {
    // 监听翻译内容变化，自动滚动到底部
    "translatedContentArray.length"() {
      this.$nextTick(() => this.scrollToBottom());
    },
    isTranslating(newVal) {
      this.$emit("isTranslatingChange", newVal);
    },
  },
  methods: {
    // 同步翻译数据
    async syncTranslationConfig() {
      const { rawContent, translatedContentArray, tips } = this;
      await emit("sync_translation_data", {
        rawContent,
        translatedContentArray,
        tips,
      });
      this.rawContent = "";
    },
    // 显示翻译结果窗口
    async showWindow() {
      await appWindow.hide();
      this.changeHeaderVisibility(false);
      const [x, y] = await this.getMousePosition();
      if (x >= 0 && y >= 0) {
        await this.setWindowPosition(x, y);
      }
    },
    // 刷新翻译内容
    async refreshTranslation() {
      await this.translate();
    },
    // 截屏翻译
    async screenshot(base64) {
      const that = this;
      const {
        basics: { openMainOnScreenshot },
      } = this.settings;
      if (!openMainOnScreenshot) {
        this.rawContent = "";
        const { sourceLanguage } = this.config;
        await this.showWindow();
        if (sourceLanguage === "auto") {
          this.translatedContentArray = [
            this.systemLanguage["noSourceLanguage"],
          ];
        } else {
          this.translatedContentArray = [
            `${this.systemLanguage.recognizing}......`,
          ];
          const rawContent = await ocr(base64, sourceLanguage);
          if (!rawContent) {
            this.translatedContentArray = [this.systemLanguage["noContent"]];
          } else {
            this.rawContent = rawContent;
            this.isTranslating = false; // 先停止原来的翻译
            await this.translate();
          }
        }
      }
    },
    // 划词翻译
    async selection() {
      const that = this;
      const {
        basics: { openMainOnSelection },
      } = this.settings;
      if (!openMainOnSelection) {
        this.rawContent = "";
        const rawContent = await getSelectedText();
        await this.showWindow();
        if (!rawContent) {
          this.translatedContentArray = [this.systemLanguage.noContent];
        } else {
          this.rawContent = rawContent;
          this.isTranslating = false; // 先停止原来的翻译
          await this.translate();
        }
      }
    },
    // 翻译
    async translate() {
      await translateFunc(this);
    },
    // 获取鼠标指针当前位置
    async getMousePosition() {
      try {
        const position = await invoke("get_mouse_position", {});
        return position.split(",").map((item) => parseInt(item));
      } catch (err) {
        console.error(err);
        return [-1, -1];
      }
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
        await appWindow.setFocus(true);
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

    async addListeners() {
      try {
        this.listeners.push(
          ...[
            // 划词翻译
            await listen("selection", () => {
              this.selection();
            }),
            // 获取截图结果
            await listen("screenshot_result", async ({ payload: base64 }) => {
              this.screenshot(base64);
            }),
          ]
        );
      } catch (err) {
        console.error(err);
      }
    },
  },
  mounted() {
    this.addListeners();
  },
  unmounted() {
    this.listeners.map((item) => item());
  },
};
</script>
<template>
  <div class="main">
    <el-scrollbar class="main-container selectable" ref="myScrollbar">
      <span class="label">{{ systemLanguage["translation"] }}</span
      ><span v-html="translatedContent"></span>
    </el-scrollbar>
    <el-form-item :label="systemLanguage['hint']" class="tips">
      <el-input
        class="no-border-input"
        v-model="tips"
        :title="systemLanguage['inputHints']"
        :placeholder="systemLanguage['inputHints']"
        @change="refreshTranslation"
        :disabled="isTranslating"
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
      background-color: transparent !important;
    }
  }
}
</style>
