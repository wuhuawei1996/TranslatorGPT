<script>
// Public
import { appWindow } from "@tauri-apps/api/window";
import { emit, listen } from "@tauri-apps/api/event";
import { ElMessage } from "element-plus";
import {
  enable,
  isEnabled,
  disable,
} from "/src/utils/tauri-plugin-autostart/index";
import {
  register,
  unregisterAll,
  unregister,
  isRegistered,
} from "@tauri-apps/api/globalShortcut";

import { open } from "@tauri-apps/api/shell";

// Private
import systemLanguage from "/src/assets/data/system_language.js";
import defaultSettings from "/src/assets/data/default_settings.js";
import engineNames from "/src/assets/data/engine_names.js";
import testApiKeys from "/src/requests/test_api_keys.js";
import deepCopy from "/src/utils/deep_copy.js";
import showWindow from "/src/utils/show_window.js";

const sortFunc = (a, b) => {
  if (a === "Ctrl" || a === "Cmd") return -1;
  if (b === "Ctrl" || b === "Cmd") return 1;
  if (a === "Shift") return -1;
  if (b === "Shift") return 1;
  if (a === "Alt") return -1;
  if (b === "Alt") return 1;
  const isF = (c) => {
    return c.length > 1 && c[0] === "F";
  };
  if (isF(a) && !isF(b)) return -1;
  if (isF(b) && !isF(a)) return 1;
  return a < b ? -1 : 1;
};

const validate = (str) => {
  if (str.indexOf("Numpad") !== -1 || str.indexOf("Meta") !== -1) {
    return "";
  }
  str = str
    .replace("Key", "")
    .replace("Digit", "")
    .replace("Command", "Cmd")
    .replace("Control", "Ctrl")
    .replace("Minus", "-")
    .replace("Equal", "=");

  if (
    (str.indexOf("Left") != -1 || str.indexOf("Right")) != -1 &&
    str.indexOf("Arrow") == -1 &&
    str.indexOf("Bracket") == -1
  )
    str = str.replace("Left", "").replace("Right", "");

  return str;
};

const myDefaultSettings = defaultSettings();
const shortcutsWatcher = {};
Object.keys(myDefaultSettings.shortcuts).map((item) => {
  shortcutsWatcher["shortcuts." + item] = {
    async handler(newVal, oldVal) {
      const that = this;
      try {
        const oldShortcut = oldVal ? oldVal.join("+") : "";
        const newShortcut = newVal ? newVal.join("+") : "";
        if (oldShortcut && oldShortcut !== newShortcut) {
          if (await isRegistered(oldShortcut)) await unregister(oldShortcut);
        }
        if (newShortcut && oldShortcut !== newShortcut) {
          if (!(await isRegistered(newShortcut)))
            await register(newShortcut, () => {
              that[item]();
            });
        }
      } catch (err) {
        console.error(err);
      }
    },
    immediate: true,
  };
});

export default {
  name: "Settings",
  data() {
    return {
      windowHeight: "480px",
      scrollerHeight: "260px",
      activeName: "basic",
      visibility: false,
      settings: {
        ...myDefaultSettings,
      },
      oldSettings: {
        ...defaultSettings(),
      },
      candidate: new Set(),
      engineNames,
      keyVerified: {},
      loading: false,
      listeners: [],
    };
  },
  computed: {
    systemLanguage() {
      return systemLanguage[this.$store.state.settings.basics.language];
    },
    systemLanguageSettings() {
      return this.systemLanguage["settings"];
    },
    startOnBoot() {
      return this.$store.state.settings.basics.startOnBoot;
    },
    alwaysOnTop() {
      return this.$store.state.settings.basics.alwaysOnTop;
    },
    shortcuts() {
      return this.$store.state.settings.shortcuts;
    },
    // 配置
    config() {
      return this.$store.state.config.translation;
    },
  },
  watch: {
    // 开机自启动
    startOnBoot: {
      async handler(val) {
        try {
          const enabled = await isEnabled();
          if (enabled && !val) await disable();
          if (!enabled && val) await enable();
        } catch (err) {
          console.error(err);
          const that = this;
          ElMessage({
            message: val
              ? that.systemLanguageSettings.enableFailed
              : that.systemLanguageSettings.disableFailed,
            grouping: true,
            type: "error",
          });
        }
      },
      immediate: true,
    },
    alwaysOnTop: {
      async handler(val) {
        try {
          await appWindow.setAlwaysOnTop(val);
        } catch (err) {
          console.error(err);
        }
      },
      immediate: true,
    },
    ...shortcutsWatcher,
  },
  methods: {
    // 显示/隐藏
    async showOrHide() {
      try {
        const isVisible = await appWindow.isVisible();
        isVisible ? await appWindow.hide() : showWindow(); //await appWindow.show();
      } catch (err) {
        console.error(err);
      }
    },
    // 划词翻译
    async selection() {
      const { selectTranslation } = this.config;
      if (selectTranslation) {
        try {
          await emit("selection", {});
        } catch (err) {
          console.error(err);
        }
      }
    },
    // 截屏翻译
    async screenshot() {
      const { captureTranslation } = this.config;
      if (captureTranslation) {
        try {
          await emit("screenshot", {});
        } catch (err) {
          console.error(err);
        }
      }
    },
    // 执行设置
    async executeSettings() {
      const {
        basics: { autoToTray },
      } = this.$store.state.settings;
      try {
        if (!autoToTray) {
          await appWindow.show();
          await appWindow.setFocus();
        } else {
          await appWindow.hide();
        }
        await appWindow.setSkipTaskbar(false);
      } catch (err) {
        console.error(err);
      }
    },
    // 同步设置到其他窗口
    async syncSettings() {
      const that = this;
      try {
        await emit("sync_settings", { settings: that.$store.state.settings });
      } catch (err) {
        console.error(err);
      }
    },
    // 初始化设置
    initData() {
      Object.keys(this.settings).map((item) => {
        Object.keys(this.settings[item]).map((elem) => {
          const data = localStorage.getItem(item + "." + elem);
          if (data) {
            if (data === "true" || data === "false")
              this.settings[item][elem] = data === "true";
            else this.settings[item][elem] = JSON.parse(data);
            this.$store.commit("changeSettings", {
              [item + "." + elem]: deepCopy(this.settings[item][elem]),
            });
          }
        });
      });
    },
    // 清除空白
    clearBlank(key) {
      const apiKey = this.settings.keys[key].trim();
      if (!apiKey) {
        this.settings.keys[key] = "";
        this.keyVerified[key] = true;
        return true;
      } else {
        this.settings.keys[key] = apiKey;
        return false;
      }
    },
    // 判断是否全部测试通过
    checkKeyVerified() {
      for (let key in this.keyVerified) {
        if (!this.keyVerified[key]) {
          if (!this.clearBlank(key)) {
            return false;
          }
        }
      }
      return true;
    },
    // 测试
    async test(key) {
      const that = this;
      if (this.keyVerified[key]) {
        return;
      }
      if (this.clearBlank(key)) {
        return;
      }
      this.loading = true;
      const apiKey = this.settings.keys[key];
      const result = await testApiKeys[key](apiKey);
      this.loading = false;
      if (result) {
        ElMessage({
          message: that.systemLanguageSettings.testSuccess,
          grouping: true,
          type: "success",
        });

        this.keyVerified[key] = true;
      } else {
        ElMessage({
          message: that.systemLanguageSettings.testFailed,
          grouping: true,
          type: "error",
        });
      }
    },
    // 保存设置
    saveSettings() {
      const that = this;
      if (!this.checkKeyVerified()) {
        ElMessage({
          message: that.systemLanguageSettings.notTested,
          grouping: true,
          type: "error",
        });
        return;
      }
      Object.keys(this.settings).map((item) => {
        Object.keys(this.settings[item]).map((elem) => {
          localStorage.setItem(
            item + "." + elem,
            JSON.stringify(this.settings[item][elem])
          );
          if (item === "shortcuts" && elem === "screenshot") {
          }
          this.$store.commit("changeSettings", {
            [item + "." + elem]: deepCopy(this.settings[item][elem]),
          });
        });
      });
      this.syncSettings();
      this.visibility = false;
    },
    async openGithub() {
      await open("https://github.com/wuhuawei1996/TranslatorGPT");
    },
    show() {
      this.visibility = true;
      this.oldSettings = deepCopy(this.settings);
    },
    cancel() {
      this.visibility = false;
      this.settings = deepCopy(this.oldSettings);
    },
    keyUp(event, type) {
      if (this.candidate.size === 0) {
        if (event.code) this.candidate.add(validate(event.code));
        setTimeout(() => {
          const array = Array.from(this.candidate).filter((item) => item);
          array.sort(sortFunc);
          this.settings.shortcuts[type] = array;
          this.candidate = new Set();
        }, 500);
      } else {
        if (event.code) this.candidate.add(validate(event.code));
      }
    },
    async addListeners() {
      try {
        this.listeners.push(
          ...[
            await listen("call_for_sync_settings", async ({}) => {
              await this.syncSettings();
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
    this.initData();
    this.executeSettings();
    Object.keys(this.settings.keys).map((item) => {
      this.keyVerified[item] = true;
    });
  },
};
</script>

<template>
  <el-dialog
    v-model="visibility"
    :modal="false"
    :width="windowHeight"
    align-center
    :title="systemLanguageSettings.settings"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :before-close="cancel"
  >
    <el-tabs v-model="activeName" class="tabs" v-loading="loading">
      <el-tab-pane :label="systemLanguageSettings.basic" name="basic">
        <el-scrollbar class="settings" :height="scrollerHeight">
          <el-form>
            <el-form-item>
              <el-checkbox
                v-model="settings.basics.startOnBoot"
                :label="systemLanguageSettings.startOnBoot"
                size="large"
              />
            </el-form-item>
            <el-form-item>
              <el-checkbox
                v-model="settings.basics.autoToTray"
                :label="systemLanguageSettings.autoToTray"
                size="large"
              />
            </el-form-item>
            <el-form-item>
              <el-checkbox
                v-model="settings.basics.alwaysOnTop"
                :label="systemLanguageSettings.alwaysOnTop"
                size="large"
              />
            </el-form-item>
            <el-form-item>
              <el-checkbox
                v-model="settings.basics.autoUpdate"
                :label="systemLanguageSettings.autoUpdate"
                size="large"
              />
            </el-form-item>
            <el-form-item>
              <el-checkbox
                v-model="settings.basics.openMainOnSelection"
                :label="systemLanguageSettings.openMainOnSelection"
                size="large"
              />
            </el-form-item>
            <el-form-item>
              <el-checkbox
                v-model="settings.basics.openMainOnScreenshot"
                :label="systemLanguageSettings.openMainOnScreenshot"
                size="large"
              />
            </el-form-item>
            <el-form-item
              :label="systemLanguageSettings.closeMainWindow"
              class="margin-top"
            >
              <el-radio-group v-model="settings.basics.mainWindowClosed">
                <el-radio label="hide">{{
                  systemLanguageSettings.hideToTray
                }}</el-radio>
                <el-radio label="quit">{{
                  systemLanguageSettings.quit
                }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              :label="systemLanguageSettings.language"
              class="margin-top"
            >
              <el-radio-group v-model="settings.basics.language">
                <el-radio label="Chinese">中文</el-radio>
                <el-radio label="English">English</el-radio>
                <el-radio label="French">Français</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              :label="systemLanguageSettings.fontSize"
              class="margin-top"
            >
              <el-radio-group v-model="settings.basics.fontSize">
                <el-radio label="small">{{
                  systemLanguageSettings.small
                }}</el-radio>
                <el-radio label="standard">{{
                  systemLanguageSettings.standard
                }}</el-radio>
                <el-radio label="large">{{
                  systemLanguageSettings.large
                }}</el-radio>
                <el-radio label="huge">{{
                  systemLanguageSettings.huge
                }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </el-scrollbar>
      </el-tab-pane>

      <el-tab-pane :label="systemLanguageSettings.apiKey" name="api">
        <el-form class="api-keys-form">
          <el-form-item :label="item.label + ': '" v-for="item in engineNames">
            <el-input
              @input="keyVerified[item.key] = false"
              v-model="settings.keys[item.key]"
              :placeholder="systemLanguageSettings.inputTheKey"
            >
              <template #append>
                <el-button @click="test(item.key)">{{
                  keyVerified[item.key]
                    ? systemLanguageSettings.pass
                    : systemLanguageSettings.test
                }}</el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane :label="systemLanguageSettings.shortcut" name="shortcut">
        <el-form class="shortcut-form">
          <el-form-item :label="systemLanguageSettings.showOrHide">
            <el-input
              @keyup="keyUp($event, 'showOrHide')"
              readonly
              :model-value="settings.shortcuts.showOrHide.join('+')"
              :placeholder="systemLanguageSettings.recordShortcut"
            />
          </el-form-item>
          <el-form-item :label="systemLanguageSettings.selection">
            <el-input
              @keyup="keyUp($event, 'selection')"
              readonly
              :model-value="settings.shortcuts.selection.join('+')"
              :placeholder="systemLanguageSettings.recordShortcut"
            />
          </el-form-item>
          <el-form-item :label="systemLanguageSettings.screenshot">
            <el-input
              @keyup="keyUp($event, 'screenshot')"
              readonly
              :model-value="settings.shortcuts.screenshot.join('+')"
              :placeholder="systemLanguageSettings.recordShortcut"
            />
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane :label="systemLanguageSettings.aboutMe" name="author">
        <el-scrollbar class="settings" :height="scrollerHeight">
          <div class="author flex-column">
            <div class="treat-me">
              {{ systemLanguage["treatMe"]
              }}<a href="" style="margin-left: 10px" @click.prevent="openGithub"
                >TranslatorGPT</a
              >
            </div>
            <div class="pictures">
              <img src="/src/assets/imgs/alipay.jpg" />
            </div>
          </div>
        </el-scrollbar>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <span class="footer-btns">
        <el-button @click="cancel">{{
          systemLanguageSettings.cancel
        }}</el-button>
        <el-button type="primary" @click="saveSettings">
          {{ systemLanguageSettings.save }}</el-button
        >
      </span>
    </template>
  </el-dialog>
</template>

<style lang="scss">
.el-dialog {
  .el-dialog__body {
    padding-top: 5px !important;
  }
  .el-dialog__body,
  header,
  footer {
    padding-left: 30px !important;
    padding-right: 25px !important;
  }
  .el-dialog__headerbtn {
    margin-right: 5px !important;
  }
}

.tabs {
  height: 300px;
  padding-left: 0px;

  .el-tabs__nav-wrap::after {
    display: none;
  }

  .el-form-item {
    margin-bottom: 0px !important;
  }

  .el-form-item.margin-top {
    margin-top: 10px !important;
  }
  .el-form-item__label {
    color: black !important;
  }

  .el-radio-group {
    flex-direction: column !important;
    align-items: flex-start !important;
  }

  .el-checkbox,
  .el-radio-group {
    span {
      color: var(--el-radio-text-color) !important;
    }
  }

  .translation-form,
  .api-keys-form,
  .shortcut-form {
    .el-form-item {
      margin: 10px 0px 20px 0px !important;
    }
  }

  .shortcut-form {
    .el-input,
    input {
      cursor: pointer !important;
    }
  }

  .author {
    width: 100%;

    .treat-me {
      width: 80%;
      margin-top: 5px;
      line-height: 2;
    }

    .pictures {
      margin-top: 5px;
      img {
        width: 160px;
        height: auto;
      }
    }
  }
}
.footer-btns {
  button {
    width: 80px;
  }
}
</style>
