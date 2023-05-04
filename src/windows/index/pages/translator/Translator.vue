<script>
// Public
import { Headset, VideoPause, CopyDocument } from "@element-plus/icons-vue";
import { appWindow } from "@tauri-apps/api/window";
import { writeText } from "@tauri-apps/api/clipboard";
import { listen } from "@tauri-apps/api/event";
import { ElMessage } from "element-plus";

// Private
import Header from "./Header.vue";
import systemLanguage from "/src/assets/data/system_language.js";
import translateFunc from "/src/utils/translate_func.js";
import defaultConfig from "/src/assets/data/default_config.js";
import { fontSizes } from "/src/assets/data/default_settings.js";
import getSelectedText from "/src/utils/get_selected_text.js";
import ocr from "/src/utils/ocr.js";
import showWindow from "/src/utils/show_window.js";
import { translationFormatter } from "/src/utils/result_formatter.js";

export default {
  name: "Translator",
  components: { Header, Headset, VideoPause, CopyDocument },
  data() {
    return {
      rawContent: "",
      tips: "",
      translatedContentArray: [],
      isTranslating: false,
      isResizing: false,
      listeners: [],
      isRawContentSpeech: false,
      isTranslatedContentSpeech: false,
      speechmaker: null,
    };
  },
  computed: {
    // 设置
    settings() {
      return this.$store.state.settings;
    },
    // 配置
    config() {
      return this.$store.state.config.translation;
    },
    // 系统语言
    systemLanguage() {
      return systemLanguage[this.settings.basics.language];
    },
    // 是否显示清空按钮
    clearBtnShow() {
      return !this.isTranslating && this.rawContent.length > 0;
    },
    // 字体大小
    fontSize() {
      return fontSizes[this.settings.basics.fontSize];
    },
    // 是否有可用引擎
    noEngines() {
      return this.config.engine === "";
    },
    // 翻译后的内容
    translatedContent() {
      return this.isResizing ? "" : translationFormatter(this, this.rawContent);
    },
  },
  watch: {
    // 监听翻译内容变化，自动滚动到底部
    "translatedContentArray.length"() {
      this.$nextTick(() => this.scrollToBottom());
    },
    // 字体改变需要手动刷新视图
    fontSize() {
      this.refreshContent();
    },
  },
  methods: {
    // 初始创建语音朗读实例
    initSpeech() {
      this.speechmaker = new SpeechSynthesisUtterance();
      this.speechmaker.onend = () => {
        this.isRawContentSpeech = false;
        this.isTranslatedContentSpeech = false;
      };
    },
    // 播放音频
    playAudio(arg) {
      if (this.isRawContentSpeech || this.isTranslatedContentSpeech) {
        try {
          speechSynthesis.cancel();
        } catch (err) {
          console.log(err);
        }
      }
      const upperCaseArg = arg[0].toUpperCase() + arg.slice(1);
      if (!this[`is${upperCaseArg}ContentSpeech`]) {
        this[`is${upperCaseArg}ContentSpeech`] = true;

        try {
          this.speechmaker.text = this[`${arg}Content`];
          this.speechmaker.volume = 1;
          speechSynthesis.speak(this.speechmaker);
        } catch (err) {
          console.log(err);
          this[`is${upperCaseArg}Speech`] = false;
        }
      } else {
        this[`is${upperCaseArg}ContentSpeech`] = false;
      }
      this[`is${arg === "raw" ? "Translated" : "Raw"}ContentSpeech`] = false;
    },
    // 截屏翻译
    async screenshot(base64) {
      const that = this;
      const {
        basics: { openMainOnScreenshot },
      } = this.settings;
      if (openMainOnScreenshot) {
        const { sourceLanguage } = this.config;
        await showWindow();
        this.$root.selectMenuItem(0);
        if (sourceLanguage === "auto") {
          ElMessage({
            message: that.systemLanguage["noSourceLanguage"],
            grouping: true,
            type: "error",
          });
        } else {
          this.rawContent = `${this.systemLanguage.recognizing}......`;
          this.translatedContentArray = [];
          const rawContent = await ocr(base64, sourceLanguage);
          if (!rawContent) {
            this.rawContent = "";
            ElMessage({
              message: that.systemLanguage["noContent"],
              grouping: true,
              type: "error",
            });
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
      if (openMainOnSelection) {
        this.rawContent = `${this.systemLanguage.gettingSelected}......`;
        this.translatedContentArray = [];
        const rawContent = await getSelectedText();
        await showWindow();
        this.$root.selectMenuItem(0);
        if (!rawContent) {
          that.rawContent = "";
          ElMessage({
            message: that.systemLanguage["noContent"],
            grouping: true,
            type: "error",
          });
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
    // 复制
    async copy() {
      if (!this.translatedContent) {
        return;
      }
      try {
        await writeText(this.translatedContent);
        ElMessage({
          message: that.systemLanguage["succeedToCopy"],
          grouping: true,
          type: "success",
        });
      } catch (err) {
        console.error(err);
        ElMessage({
          message: that.systemLanguage["failToCopy"],
          grouping: true,
          type: "error",
        });
      }
    },
    // 滚动到最底部
    scrollToBottom() {
      this.$refs["translatedContent"].setScrollTop(
        this.$refs["translatedContent"].wrapRef.scrollHeight
      );
    },
    // 刷新内容
    refreshContent() {
      const temp = this.rawContent;
      this.rawContent = "   ";
      this.isResizing = true;
      this.$nextTick(() => {
        this.rawContent = temp;
        this.isResizing = false;
      });
    },
    async addListeners() {
      try {
        this.listeners.push(
          ...[
            // 窗口尺寸监听器（性能优化）
            await appWindow.onResized(async ({ payload: size }) => {
              this.refreshContent();
            }),
            // 划词翻译
            await listen("selection", () => {
              this.selection();
            }),
            // 获取截图结果
            await listen("screenshot_result", async ({ payload: base64 }) => {
              this.screenshot(base64);
            }),
            // 同步翻译数据
            await listen("sync_translation_data", async ({ payload }) => {
              this.isTranslating = false;
              Object.assign(this, payload);
            }),
          ]
        );
      } catch (err) {
        console.error(err);
      }
    },
  },

  mounted() {
    this.initSpeech();
    this.addListeners();
  },
  unmounted() {
    this.listeners.map((item) => item());
  },
};
</script>

<template>
  <div class="translator flex-column-center">
    <Header :config="config" class="translator-header" />
    <div class="raw-content">
      <el-scrollbar height="100%">
        <el-input
          class="no-border-input"
          :style="{ fontSize: fontSize + 'px' }"
          autosize
          :disabled="noEngines"
          resize="none"
          v-model="rawContent"
          type="textarea"
          :placeholder="systemLanguage['inputRawContent']"
          :title="systemLanguage['inputRawContent']"
        />
      </el-scrollbar>
    </div>

    <div class="hints flex-row">
      <el-input
        class="no-border-input"
        v-model="tips"
        :disabled="noEngines"
        :title="systemLanguage['inputHints']"
        :placeholder="systemLanguage['inputHints']"
        :style="{ fontSize: fontSize - 1 + 'px', flex: '1' }"
      />
    </div>

    <div class="control-btns flex-row">
      <div class="left">
        <div class="icons">
          <div class="icon" @click="playAudio('raw')">
            <el-icon size="18">
              <VideoPause v-show="isRawContentSpeech" />
              <Headset v-show="!isRawContentSpeech" />
            </el-icon>
          </div>
        </div>
      </div>
      <div class="right">
        <el-button v-show="clearBtnShow" @click="rawContent = ''">{{
          systemLanguage["clear"]
        }}</el-button>

        <el-button type="primary" @click="translate" :disabled="noEngines">{{
          isTranslating ? systemLanguage["stop"] : systemLanguage["translate"]
        }}</el-button>
      </div>
    </div>
    <div class="divider"></div>
    <div class="translation">
      <el-scrollbar height="100%" ref="translatedContent" class="selectable">
        <div
          :style="{ fontSize: fontSize + 'px' }"
          class="translatedContent"
          v-html="translatedContent"
        ></div>
      </el-scrollbar>
    </div>
    <div class="control-btns flex-row">
      <div class="left">
        <div class="icons">
          <div class="icon" @click="playAudio('translated')">
            <el-icon size="18">
              <VideoPause v-show="isTranslatedContentSpeech" />
              <Headset v-show="!isTranslatedContentSpeech" />
            </el-icon>
          </div>
          <div class="icon" @click="copy" :title="systemLanguage['copy']">
            <el-icon size="18"><CopyDocument /></el-icon>
          </div>
        </div>
      </div>
      <div class="right"></div>
    </div>
  </div>
</template>
<style lang="scss">
$header-margin-top: 5px;
$header-height: 55px;
$tips-margin-top: 10px;
$btns-height: 35px;
$btns-margin-top: 10px;
$btns-margin-bottom: 15px;
$divider-height: 1px;
$divider-padding: 25px;
$divider-margin-bottom: 10px;

.translator {
  width: 100%;
  height: 100%;

  .hints,
  .translator-header,
  .divider,
  .raw-content,
  .control-btns,
  .translation {
    width: calc(100% - 2 * #{$divider-padding});
  }

  .translator-header {
    height: $header-height;
    margin-top: $header-margin-top;
  }

  .hints {
    margin-top: $tips-margin-top;
  }

  .control-btns {
    height: $btns-height;
  }

  .divider {
    height: 1px;
    background-color: $divider-color;
    margin-bottom: $divider-margin-bottom;
  }

  .control-btns {
    justify-content: space-between;
    margin: $btns-margin-top 0px $btns-margin-bottom 0px;
  }

  .raw-content,
  .translation {
    height: calc(
      50% -
        (
          #{$header-height} + #{$btns-height}* 2 + #{$btns-margin-top}* 2 + #{$btns-margin-bottom}*
            2 + #{$divider-height} + #{$tips-height} + #{$divider-margin-bottom} +
            #{$tips-margin-top} + #{$header-margin-top}
        ) / 2
    );
  }

  textarea,
  .translatedContent {
    color: var(--el-input-text-color, var(--el-text-color-regular));
    line-height: 1.8 !important;
  }
  .icons {
    margin-left: -7px;
  }
}
</style>
