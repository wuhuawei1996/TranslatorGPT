<script>
// Public
import { Headset, CopyDocument } from "@element-plus/icons-vue";
import { appWindow } from "@tauri-apps/api/window";
import { writeText } from "@tauri-apps/api/clipboard";
import { createWorker } from "tesseract.js";
import { listen } from "@tauri-apps/api/event";

// Private
import Header from "./Header.vue";
import systemLanguage from "/src/assets/data/system_language.js";
import stream from "/src/utils/stream.js";
import defaultConfig from "/src/assets/data/default_config.js";

const fontSizes = {
  small: "14",
  standard: "16",
  large: "20",
  huge: "22",
};

export default {
  name: "Translator",
  components: { Header, Headset, CopyDocument },
  data() {
    return {
      config: {
        ...defaultConfig().translation,
      },
      history: {
        ChatGPT: "",
        Google: "",
        DeepL: "",
      },
      rawContent: "",
      tips: "",
      translatedContentArray: [],
      isTranslating: false,
      isPolishing: false,
      isResizing: false,
      listeners: [],
    };
  },
  computed: {
    clearBtnShow() {
      return (
        !this.isTranslating && !this.isPolishing && this.rawContent.length > 0
      );
    },
    fontSize() {
      return fontSizes[this.$store.state.settings.basics.fontSize];
    },
    systemLanguage() {
      return systemLanguage[this.$store.state.settings.basics.language];
    },
    translatedContent() {
      return this.isResizing
        ? ""
        : this.translatedContentArray.length > 1
        ? this.translatedContentArray
            .filter(
              (item) => item != `${this.systemLanguage.translating}......`
            )
            .join("")
        : this.translatedContentArray.join("");
    },
  },
  watch: {
    "translatedContentArray.length"() {
      this.$nextTick(() => this.scrollToBottom());
    },
    fontSize() {
      this.refreshContent();
    },
  },
  methods: {
    // 翻译按钮点击事件
    translateBtnClick() {
      if (this.isTranslating) {
        return;
      }
      if (!this.rawContent) {
        this.translatedContentArray = [];
        return;
      }
      this.translate();
    },
    // 翻译
    async translate() {
      this.translatedContentArray = [
        `${this.systemLanguage.translating}......`,
      ];
      this.isTranslating = true;
      try {
        await stream(
          this.rawContent,
          this.config,
          this.config.sourceLanguages === this.systemLanguage.autoLanguage,
          this.translatedContentArray
        );
        this.history[this.config.engine] = this.rawContent;
      } catch (err) {
        console.error(err);
        this.translatedContentArray = [this.systemLanguage.translatingError];
      }
      this.isTranslating = false;
    },
    // 复制
    async copy() {
      if (!this.translatedContent) {
        return;
      }
      await writeText(this.translatedContent);
    },
    // 滚动到最底部
    scrollToBottom() {
      this.$refs["translatedContent"].setScrollTop(
        this.$refs["translatedContent"].wrapRef.scrollHeight
      );
    },
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
      // 结束进程时保存翻译配置
      this.listeners.push(
        // 窗口尺寸监听器（性能优化）
        ...[
          await appWindow.onResized(async ({ payload: size }) => {
            this.refreshContent();
          }),
          // 获取截图结果
          await listen("screenshot_result", async ({ payload: base64 }) => {
            var img = new Image();
            img.src = base64;
            img.onload = async function () {
              var canvas = document.createElement("canvas");
              canvas.width = img.width * 2;
              canvas.height = img.height * 2;
              var ctx = canvas.getContext("2d");
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              var enlargedBase64 = canvas.toDataURL();

              const worker = await createWorker({
                langPath: "https://github.com/tesseract-ocr/tessdata_best.git",
              });
              await worker.loadLanguage("chi_sim");
              await worker.initialize("chi_sim");

              const {
                data: { text },
              } = await worker.recognize(enlargedBase64);
              console.log(text);
            };
          }),
        ]
      );
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
  <div class="translator flex-column-center">
    <Header :config="config" class="translator-header" />
    <div class="raw-content">
      <el-scrollbar height="100%">
        <el-input
          class="no-border-input"
          :style="{ fontSize: fontSize + 'px' }"
          autosize
          resize="none"
          v-model="rawContent"
          type="textarea"
          :placeholder="systemLanguage['inputRawContent']"
        />
      </el-scrollbar>
    </div>

    <div class="translation-hints flex-row">
      <el-input
        class="no-border-input"
        v-model="tips"
        :placeholder="systemLanguage['inputHints']"
        :style="{ fontSize: fontSize - 1 + 'px', flex: '1' }"
      />
    </div>

    <div class="control-btns flex-row">
      <div class="left">
        <div class="icons">
          <div class="icon">
            <el-icon size="18"><Headset /></el-icon>
          </div>
        </div>
      </div>
      <div class="right">
        <el-button v-show="clearBtnShow" @click="rawContent = ''">{{
          systemLanguage["clear"]
        }}</el-button>
        <el-button type="info" v-show="!isTranslating">{{
          isPolishing ? systemLanguage["stop"] : systemLanguage["polish"]
        }}</el-button>
        <el-button
          type="primary"
          @click="translateBtnClick"
          v-show="!isPolishing"
          >{{
            isTranslating ? systemLanguage["stop"] : systemLanguage["translate"]
          }}</el-button
        >
      </div>
    </div>
    <div class="divider"></div>
    <div class="translation">
      <el-scrollbar height="100%" ref="translatedContent">
        <div :style="{ fontSize: fontSize + 'px' }" class="translatedContent">
          {{ translatedContent }}
        </div>
      </el-scrollbar>
    </div>
    <div class="control-btns flex-row">
      <div class="left">
        <div class="icons">
          <div class="icon">
            <el-icon size="18"><Headset /></el-icon>
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
$tips-height: 32px;
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

  .translation-hints,
  .translator-header,
  .divider,
  .raw-content,
  .control-btns,
  .translation {
    width: calc(100% - 2 *#{$divider-padding});
  }

  .translator-header {
    height: $header-height;
    margin-top: $header-margin-top;
  }

  .translation-hints {
    height: $tips-height;
    margin-top: $tips-margin-top;
  }

  .control-btns {
    height: $btns-height;
  }
  .divider {
    height: 1px;
    background-color: #f1f1f1;
    margin-bottom: $divider-margin-bottom;
  }

  .control-btns {
    justify-content: space-between;
    margin: $btns-margin-top 0px $btns-margin-bottom 0px;
    .el-button {
      width: 90px !important;
    }
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

  .raw-content,
  .translation,
  .translation-hints {
    .el-input__wrapper,
    textarea {
      padding-left: 3px !important;
      padding-right: 3px !important;
    }

    input {
      padding-left: 0px !important;
      padding-right: 0px !important;
    }
  }
  textarea,
  .translatedContent {
    color: var(--el-input-text-color, var(--el-text-color-regular));
    line-height: 1.8 !important;
  }
  .icons {
    margin-left: -7px;
  }
  .icon {
    width: 30px;
    height: 30px;
  }
}
</style>
