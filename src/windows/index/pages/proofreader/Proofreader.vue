<script>
// Public
import { CopyDocument } from "@element-plus/icons-vue";
import { writeText } from "@tauri-apps/api/clipboard";
import { ElMessage } from "element-plus";
import { listen } from "@tauri-apps/api/event";
import { appWindow } from "@tauri-apps/api/window";

// Private
import systemLanguage from "/src/assets/data/system_language.js";
import { fontSizes } from "/src/assets/data/default_settings.js";
import { engineNames } from "/src/assets/data/engine_names.js";
import proofread from "/src/requests/proofread.js";
import ConfigSelector from "/src/components/ConfigSelector.vue";

export default {
  name: "Proofreader",
  components: { CopyDocument, ConfigSelector },
  data() {
    return {
      listeners: [],
      isResizing: false,
      rawContent: "",
      proofreadContent: "",
      oldProofreadContent: "",
      proofreadContentArray: [],
      appendIndex: 0,
      tips: "",
      isProofreading: false,
      config: {
        engine: "gpt3",
        sourceLanguage: "auto",
        targetLanguage: "eng",
      },
    };
  },
  computed: {
    // 设置
    settings() {
      return this.$store.state.settings;
    },
    // 系统语言
    systemLanguage() {
      return systemLanguage[this.settings.basics.language];
    },
    // 字体大小
    fontSize() {
      return fontSizes[this.settings.basics.fontSize];
    },
    // 是否有可用的润色引擎
    noEngines() {
      return (
        Object.keys(engineNames).filter((item) => {
          return (
            engineNames[item].proofreading && this.settings.keys[item] !== ""
          );
        }).length === 0
      );
    },
  },
  watch: {
    proofreadContent(newVal) {
      this.proofreadContent = newVal.replace(/<br\/>/g, "\n");
    },
    noEngines(newVal) {
      if (newVal) {
        this.isProofreading = false;
        this.rawContent = this.systemLanguage["noEngine"];
        this.proofreadContent = "";
        this.tips = "";
        this.config.engine = "";
      }
    },
    // 监听润色内容变化，自动滚动到底部
    "proofreadContentArray.length"() {
      this.$nextTick(() => this.scrollToBottom());
    },
    // 字体改变需要手动刷新视图
    fontSize() {
      this.refreshContent();
    },
    proofreadContentArray: {
      handler(newVal) {
        if (newVal.length > 0) {
          const oldProofreadContent = this.oldProofreadContent;
          this.proofreadContent =
            oldProofreadContent +
            (oldProofreadContent ? "\n\n" : "") +
            newVal.join("");
          /*
          if (newVal.length === 1) {
            const proofreading = `${this.systemLanguage.proofreading}......`;
            this.proofreadContent = this.proofreadContent.replace(
              proofreading,
              ""
            );
            if (this.proofreadContent.length > 0) {
              this.proofreadContent += "\n\n";
            }
          }
          this.proofreadContent += newVal[this.appendIndex];
          this.appendIndex++;*/
        }
      },
      deep: true,
    },
  },
  methods: {
    clear(arg) {
      this[arg] = "";
    },
    async copy() {
      const that = this;
      if (!this.proofreadContent) {
        return;
      }
      try {
        await writeText(this.proofreadContent);
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
    appendPlaceholder() {
      const proofreading = `${this.systemLanguage.proofreading}......`;
      if (this.proofreadContent.length > 0) {
        this.proofreadContent += "\n\n";
      }
      this.proofreadContent += proofreading;
    },
    clearPlaceholder() {
      const proofreading = `${this.systemLanguage.proofreading}......`;
      const difference = this.proofreadContent.length - proofreading.length;
      if (this.proofreadContent.substring(difference) == proofreading) {
        this.proofreadContent = this.proofreadContent.substring(0, difference);
        if (
          this.proofreadContent.length > 1 &&
          this.proofreadContent.substring(this.proofreadContent.length - 2) ==
            "\n\n"
        ) {
          this.proofreadContent = this.proofreadContent.substring(
            0,
            this.proofreadContent.length - 2
          );
        }
      }
    },
    getSelectedContent() {
      const selection = window.getSelection();
      const textarea = this.$refs["before-proofreading"].textarea;
      try {
        if (
          selection &&
          selection.anchorNode &&
          selection.anchorNode
            .getAttribute("class")
            .split(/\s/)
            .indexOf("before-proofreading") !== -1
        ) {
          const selectedContent = selection.toString();
          const { selectionStart, selectionEnd } = textarea;
          textarea.focus();
          textarea.setSelectionRange(selectionStart, selectionEnd);
          return selectedContent;
        } else {
          return "";
        }
      } catch (err) {
        console.error(err);
        return "";
      }
    },
    proofreadFun() {
      const that = this;
      if (this.isProofreading) {
        this.getSelectedContent();
        this.clearPlaceholder();
        this.isProofreading = false;
      } else {
        let selectedContent = this.getSelectedContent();
        if (selectedContent.trim()) {
          this.isProofreading = true;
          this.proofread(selectedContent);
        } else {
          if (this.rawContent.trim()) {
            selectedContent = this.rawContent;
            this.isProofreading = true;
            this.proofread(selectedContent);
          } else {
            ElMessage({
              message: that.systemLanguage["noContentToProofread"],
              grouping: true,
              type: "error",
            });
          }
        }
      }
    },
    async proofread(selectedContent) {
      this.oldProofreadContent = this.proofreadContent;
      this.appendPlaceholder();
      try {
        await proofread(
          selectedContent,
          this.tips,
          this.settings.keys,
          this.config.engine,
          this.config.targetLanguage,
          this.proofreadContentArray,
          this
        );
      } catch (err) {
        console.error(err);
        this.clearPlaceholder();
        this.proofreadContent += `\n\n${this.systemLanguage["proofreadingError"]}`;
      }
      this.isProofreading = false;
      this.proofreadContentArray = [];
      this.appendIndex = 0;
    },
    // 刷新内容
    refreshContent() {
      const temp_1 = this.rawContent;
      this.rawContent = "   ";
      const temp_2 = this.proofreadContent;
      this.proofreadContent = "   ";
      this.isResizing = true;
      this.$nextTick(() => {
        this.rawContent = temp_1;
        this.proofreadContent = temp_2;
        this.isResizing = false;
      });
    },
    // 滚动到最底部
    scrollToBottom() {
      this.$refs["proofreadContent"].setScrollTop(
        this.$refs["proofreadContent"].wrapRef.scrollHeight
      );
    },
    async addListeners() {
      try {
        this.listeners.push(
          ...[
            // 窗口尺寸监听器（性能优化）
            await appWindow.onResized(async ({ payload: size }) => {
              this.refreshContent();
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
  <div class="proofreader flex-row">
    <div class="proofreader-left">
      <div class="title">
        <span class="title-text flex-row-center">{{
          systemLanguage["beforeProofreading"]
        }}</span>
        <ConfigSelector
          :systemLanguage="systemLanguage"
          :config="config"
          :settings="settings"
          :noSourceLanguage="true"
        />
      </div>
      <div class="input-wrapper">
        <el-scrollbar height="100%">
          <el-input
            ref="before-proofreading"
            class="no-border-input before-proofreading"
            :style="{ fontSize: fontSize + 'px' }"
            autosize
            resize="none"
            v-model="rawContent"
            type="textarea"
            :placeholder="systemLanguage['inputRawContentForProofreading']"
            :title="systemLanguage['inputRawContentForProofreading']"
            :disabled="noEngines"
          />
        </el-scrollbar>
      </div>
      <div class="hints flex-row">
        <el-input
          class="no-border-input"
          v-model="tips"
          :title="systemLanguage['inputProofreadingHints']"
          :placeholder="systemLanguage['inputProofreadingHints']"
          :style="{ fontSize: fontSize - 1 + 'px', flex: '1' }"
          :disabled="noEngines"
        />
      </div>
      <div class="control-btns flex-row">
        <el-button
          v-show="!noEngines && !isProofreading && this.rawContent.length > 0"
          @click="clear('rawContent')"
          >{{ systemLanguage["clear"] }}</el-button
        >
        <el-button type="primary" @click="proofreadFun" :disabled="noEngines">{{
          isProofreading ? systemLanguage["stop"] : systemLanguage["proofread"]
        }}</el-button>
      </div>
    </div>
    <div class="divider"></div>
    <div class="proofreader-right">
      <div class="title">
        <span class="title-text flex-row-center">{{
          systemLanguage["afterProofreading"]
        }}</span>
      </div>
      <div class="input-wrapper">
        <el-scrollbar height="100%" ref="proofreadContent">
          <el-input
            class="no-border-input"
            :style="{ fontSize: fontSize + 'px' }"
            autosize
            resize="none"
            v-model="proofreadContent"
            type="textarea"
            :disabled="noEngines"
          />
        </el-scrollbar>
      </div>
      <div class="control-btns flex-row">
        <el-button
          @click="clear('proofreadContent')"
          v-show="!isProofreading && this.proofreadContent.length > 0"
          >{{ systemLanguage["clear"] }}</el-button
        >
        <div
          class="icon"
          @click="copy"
          :title="systemLanguage['copy']"
          style="margin-left: 10px"
        >
          <el-icon size="18"><CopyDocument /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
$padding-horizontal: 20px;
$padding-vertical: 20px;
$title-margin-bottom: 10px;
$title-height: 24px;
$btns-height: 35px;
$btns-margin-vertical: 10px;

.proofreader {
  width: 100%;
  height: 100%;

  .divider {
    border-left: 1px dashed $divider-color;
    width: 0px;
    height: calc(100% - #{$padding-vertical} * 2);
  }

  .proofreader-left {
    .input-wrapper {
      height: calc(
        100% - #{$title-height} - #{$title-margin-bottom} - #{$btns-height} - #{$btns-margin-vertical} *
          2 - #{$tips-height}
      );
    }

    .hints {
      margin-top: $btns-margin-vertical;
    }
  }

  .proofreader-right {
    .input-wrapper {
      height: calc(
        100% - #{$title-height} - #{$title-margin-bottom} - #{$btns-height} - #{$btns-margin-vertical}
      );
    }
  }

  .proofreader-left,
  .proofreader-right {
    padding: 0px $padding-horizontal;
    flex: 1;
    height: calc(100% - #{$padding-vertical} * 2);

    .title {
      display: flex;

      flex-direction: row;
      align-items: center;
      margin-bottom: $title-margin-bottom;

      .title-text {
        height: $title-height;
        font-size: 12px;
        background: $blue-background !important;
        padding: 0px 7px;
        border-radius: 4px;
      }
    }

    .control-btns {
      height: $btns-height;
      justify-content: flex-end;
      margin-top: $btns-margin-vertical;
    }
  }

  .engine-selector {
    width: 90px;
    margin-left: 20px;
    margin-right: 20px;
  }

  .language-selector {
    width: 100px;
  }
}
</style>
