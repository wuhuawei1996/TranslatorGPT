<script>
import { appWindow, PhysicalSize } from "@tauri-apps/api/window";
import { currentMonitor } from "@tauri-apps/api/window";
import { listen, emit } from "@tauri-apps/api/event";

// Private
import systemLanguage from "/src/assets/data/system_language.js";
import defaultSettings from "/src/assets/data/default_settings.js";
import defaultConfig from "/src/assets/data/default_config.js";
import Main from "./components/Main.vue";
import Header from "./components/Header.vue";
import banDefaultShortcuts from "/src/utils/ban_default_shortcuts.js";

export default {
  name: "App",
  data() {
    return {
      windowWidth: 0,
      windowHeight: 0,
      screenWidth: 0,
      screenHeight: 0,
      headerHeight: 40,
      isHeaderVisible: false,
      listeners: [],
      settings: { ...defaultSettings() },
      config: defaultConfig().translation, // 特指翻译配置
    };
  },
  computed: {
    systemLanguage() {
      return systemLanguage[this.settings.basics.language];
    },
  },
  components: {
    Main,
    Header,
  },
  watch: {
    config: {
      handler(newVal) {
        const { main } = this.$refs;
        if (main) {
          main.refreshTranslation();
        }
      },
      deep: true,
    },
  },
  methods: {
    isTranslatingChange(newVal) {
      this.$refs.header.isTranslating = newVal;
      this.$refs.main.isTranslating = newVal;
    },
    async changeToMainWindow() {
      const { header, main } = this.$refs;
      await header.syncTranslationConfig();
      await main.syncTranslationConfig();
      await header.close();
      await emit("change_to_translation");
    },

    async setWindowSize() {
      const monitor = await currentMonitor();
      this.screenWidth = monitor.size.width;
      this.screenHeight = monitor.size.height;
      const width = Math.max(monitor.size.width / 4, 420);
      this.windowWidth = parseInt(width);
      this.windowHeight = parseInt(width / 1.8);
      await appWindow.setSize(
        new PhysicalSize(this.windowWidth, this.windowHeight)
      );
    },
    async setWindow() {
      try {
        await this.setWindowSize();
      } catch (err) {
        console.error(err);
      }
    },
    async listener() {
      this.listeners.push(
        ...[
          // 窗口失焦
          await listen("tauri://blur", ({ windowLabel }) => {
            if (!this.isHeaderVisible && windowLabel === "suspended") {
              appWindow.hide();
            }
          }),
          // 修改设置
          await listen("sync_settings", async ({ payload: { settings } }) => {
            this.settings = settings;
          }),
        ]
      );
    },
  },
  async mounted() {
    await this.listener();
    emit("call_for_sync_settings");
    this.setWindowSize();
    //banDefaultShortcuts();
  },
  unmounted() {
    this.listeners.map((item) => item());
  },
};
</script>

<template>
  <div class="app-container" :class="{ 'has-border': isHeaderVisible }">
    <div
      class="fake-header"
      v-show="!isHeaderVisible"
      :style="{ height: headerHeight + 'px' }"
    ></div>
    <Header
      :headerHeight="headerHeight"
      :settings="settings"
      :config="config"
      @changeToMainWindow="changeToMainWindow"
      ref="header"
      v-show="isHeaderVisible"
      :style="{ height: headerHeight + 'px' }"
    />
    <Main
      :headerHeight="headerHeight"
      :settings="settings"
      :config="config"
      ref="main"
      :class="{ 'has-border': !isHeaderVisible }"
      @mouseenter="isHeaderVisible = true"
      @isTranslatingChange="isTranslatingChange"
    />
  </div>
</template>

<style>
.header,
.fake-header {
  width: calc(100% - 10px);
  padding: 0px 5px;
}

.main {
  height: calc(100% - 40px);
  background-color: rgba(255, 255, 255, 1);
}
</style>
