<script>
// Public
import { appWindow, LogicalPosition } from "@tauri-apps/api/window";
import { Promotion, Document, EditPen, Setting } from "@element-plus/icons-vue";
import { listen, emit } from "@tauri-apps/api/event";
import { exit } from "@tauri-apps/api/process";

// Private
import systemLanguage from "/src/assets/data/system_language.js";
import Settings from "./components/Settings.vue";
import showWindow from "/src/utils/show_window.js";
import banDefaultShortcuts from "/src/utils/ban_default_shortcuts.js";

const Icons = [Promotion, EditPen, Document];

export default {
  name: "App",
  components: {
    Promotion,
    EditPen,
    Document,
    Setting,
    Settings,
  },
  data() {
    return {
      // UI
      maximized: false,
      isShowing: false,
      isBlurring: false,
      listeners: [],
    };
  },
  computed: {
    language() {
      return this.$store.state.settings.basics.language;
    },
    settings() {
      return this.$store.state.settings;
    },
    translationConfig() {
      return this.$store.state.config.translation;
    },
    systemLanguage() {
      return systemLanguage[this.language];
    },
    menu() {
      return this.systemLanguage["menu"].map((item, index) => {
        return {
          label: item,
          icon: Icons[index],
        };
      });
    },
  },
  methods: {
    async onSwitchChange(event, type) {
      await emit("sync_translation_config", { type: event });
    },
    menuOnSelect(arg) {
      this.$router.push(
        "/" + systemLanguage["English"].menu[arg].toLowerCase()
      );
    },
    manualBlur() {
      this.isBlurring = true;
    },
    minimize() {
      appWindow.minimize();
      this.manualBlur();
    },
    async hide() {
      if (this.settings.basics.mainWindowClosed === "hide") {
        await appWindow.hide();
        this.manualBlur();
      } else {
        await exit(0);
      }
    },
    maximize() {
      this.maximized ? appWindow.unmaximize() : appWindow.maximize();
    },
    async showWindow() {
      if (this.isShowing) {
        return;
      }
      this.isShowing = true;
      await showWindow();
      this.isShowing = false;
    },
    showSettings() {
      this.$refs.settings.show();
    },
    selectMenuItem(index) {
      const menu = document.getElementById("menu");
      if (menu) {
        const menuItem = document.getElementsByTagName("li")[index];
        if (menuItem) {
          menuItem.click();
        }
      }
    },
    async addListeners() {
      this.listeners.push(
        ...[
          // 显示主窗口
          await listen("show_index", async () => {
            await this.showWindow();
          }),
          // 切换到主窗口
          await listen("change_to_translation", async () => {
            await this.showWindow();
            this.selectMenuItem(0);
          }),
          // 监听窗口是否最大化
          await appWindow.onResized(async ({ payload: size }) => {
            this.maximized = await appWindow.isMaximized();
          }),
        ]
      );
    },
  },
  async mounted() {
    this.addListeners();
  },
  unmounted() {
    this.listeners.map((item) => item());
  },
};
</script>

<template>
  <div
    :class="{
      'app-container': !maximized,
      'has-border': !maximized,
      'app-container-full': maximized,
    }"
    class="flex-column"
  >
    <!-- 标题栏 -->
    <div class="header flex-row" data-tauri-drag-region>
      <img class="logo" src="/src/assets/icons/logo.png" />
      <div class="title">TranslateGPT</div>
      <div class="middle"></div>
      <div class="icons flex-row">
        <div
          class="icon icon-hover setting-button"
          @click="showSettings"
          :title="systemLanguage.settings.settings"
        >
          <el-icon size="18" color="#666666"><Setting /></el-icon>
        </div>
        <div
          class="icon"
          :class="{ 'icon-hover': !isBlurring }"
          @mouseenter="isBlurring = false"
        >
          <i class="iconfont icon-minimize" @click="minimize"></i>
        </div>
        <div class="icon icon-hover" @click="maximize">
          <i
            :class="[
              'iconfont',
              'icon-' + (maximized ? 'unmaximize' : 'maximize'),
            ]"
            :style="{ 'font-size': (maximized ? 16 : 14) + 'px' }"
          ></i>
        </div>

        <div
          class="icon"
          :class="{ 'icon-hover': !isBlurring }"
          @mouseenter="isBlurring = false"
        >
          <i class="iconfont icon-close" @click="hide"></i>
        </div>
      </div>
    </div>
    <div class="bottom flex-row">
      <!-- 菜单 -->
      <el-menu id="menu" class="menu" default-active="0" @select="menuOnSelect">
        <el-menu-item :index="index.toString()" v-for="(item, index) in menu">
          <el-icon><component :is="item.icon"></component></el-icon>
          <template #title>{{ item.label }}</template>
        </el-menu-item>
        <div class="menu-bottom-buttons" :class="[language]">
          <div class="button flex-row">
            <el-switch
              @change="onSwitchChange($event, 'selectTranslation')"
              v-model="translationConfig.selectTranslation"
              size="small"
            />{{ systemLanguage["select"] }}
          </div>
          <div class="button flex-row">
            <el-switch
              @change="onSwitchChange($event, 'captureTranslation')"
              v-model="translationConfig.captureTranslation"
              size="small"
            />{{ systemLanguage["capture"] }}
          </div>
        </div>
      </el-menu>
      <div class="main">
        <router-view v-slot="{ Component }">
          <transition>
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </div>
    </div>
    <Settings ref="settings" />
  </div>
</template>

<style lang="scss">
$header-height: 65px;
$header-margin: 10px;
$header-padding-left: 20px;
$header-padding-right: 15px;
$logo-size: 28px;
$icon-size: 30px;

.app-container-full {
  width: 100%;
  height: 100%;
}
.app-container-full,
.app-container,
.menu {
  background-color: #f9fbff !important;
}

.header {
  width: calc(100% - #{$header-padding-right} - #{$header-padding-left});
  height: $header-height;
  background-color: white;
  padding: 0px $header-padding-right 0px $header-padding-left;

  .setting-button {
    margin-right: 10px;
  }
  .logo {
    width: $logo-size;
    height: $logo-size;
    margin-left: 10px;
  }
  .title {
    margin-left: 10px;
    font-size: 21px;
    font-weight: 520;
    color: #4c4c4c;
  }

  .middle {
    flex: 1;
  }
  .icons {
    .icon {
      width: $icon-size;
      height: $icon-size;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      border-radius: 5px;
      margin-left: 3px;

      &:hover {
        background-color: transparent;
      }

      &.icon-hover:hover {
        background-color: #eff2f7;
        cursor: pointer;
      }

      i {
        line-height: $icon-size;
        font-size: 17px;
      }
    }
  }
}
.bottom {
  width: 100%;
  height: calc(100% - #{$header-height} - #{$header-margin});
  margin-top: $header-margin;
  justify-content: space-between;
}

.menu {
  height: 100%;
  border-right: none !important;

  .el-menu-item {
    color: #666666 !important;
    padding: 0px 40px !important;
    font-size: 15px;

    &.is-active,
    &:hover {
      //font-weight: bold;
      color: #379df1 !important;
      background-color: white !important;
    }
    i {
      margin-right: 10px !important;
    }
  }

  .menu-bottom-buttons {
    position: absolute;
    bottom: 15px;

    &.English {
      padding: 0px 40px;
      width: calc(100% - 80px);
    }

    &.French {
      padding: 0px 26px;
      width: calc(100% - 52px);
    }

    &.Chinese {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  }

  .button {
    .el-switch {
      margin-right: 8px;
    }
    margin-bottom: 10px;
    font-size: 13px;
  }
}

.main {
  flex: 1;
  height: 100%;
  background-color: white;

  .el-input__wrapper {
    padding-left: 7px !important;
    padding-right: 3px !important;
  }

  .el-input__wrapper,
  textarea {
    background-color: transparent !important;
  }

  textarea {
    padding-left: 3px !important;
    padding-right: 3px !important;
  }

  input {
    padding-left: 0px !important;
    padding-right: 0px !important;
  }

  .hints {
    height: $tips-height;
  }

  .control-btns {
    .el-button {
      width: 90px !important;
    }
  }

  .icon {
    width: 30px;
    height: 30px;
  }

  .config-selector {
    .el-select .el-input__wrapper {
      background-color: $blue-background !important;
      box-shadow: none !important;
    }
    input {
      color: black !important;
    }
  }
}
</style>
