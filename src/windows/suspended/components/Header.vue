<script>
// Public
import { appWindow } from "@tauri-apps/api/window";
import { Close, House } from "@element-plus/icons-vue";
import { emit } from "@tauri-apps/api/event";

// Private
import ConfigSelector from "/src/components/ConfigSelector.vue";

export default {
  name: "Header",
  props: {
    headerHeight: 0,
    config: {},
    settings: {},
  },
  components: {
    Close,
    House,
    ConfigSelector,
  },
  data() {
    return { windowHeight: 0, isTranslating: false };
  },
  computed: {
    logoPic() {
      return this.config.engine ? this.config.engine : "translateGPT";
    },
    systemLanguage() {
      return this.$root.systemLanguage;
    },

    headerStyle() {
      return {
        "--height": this.windowHeight - this.headerHeight + "px",
      };
    },
  },
  methods: {
    close() {
      appWindow.hide();
      this.$emit("isTranslatingChange", false);
    },
    changeToMainWindow() {
      if (this.isTranslating) return;
      this.$emit("changeToMainWindow");
    },
    async syncTranslationConfig() {
      await emit("sync_translation_config", {
        config: this.config,
      });
    },
  },
  async mounted() {
    const { height } = await appWindow.innerSize();
    this.windowHeight = height;
  },
};
</script>

<template>
  <div class="header flex-row" :style="headerStyle">
    <img
      class="logo"
      :src="`/src/assets/icons/${logoPic}.png`"
      data-tauri-drag-region
    />
    <ConfigSelector
      data-tauri-drag-region
      :systemLanguage="systemLanguage"
      :config="config"
      :settings="settings"
      class="el-select-limit-height"
    />

    <div class="icons" data-tauri-drag-region>
      <div
        class="icon"
        @click="changeToMainWindow"
        :style="{ cursor: isTranslating ? 'not-allowed' : 'pointer' }"
        :title="systemLanguage['changeToMain']"
      >
        <el-icon size="15" style="margin-top: -0.3px">
          <House />
        </el-icon>
      </div>
      <div class="icon" @click="close">
        <el-icon size="16">
          <Close />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.header {
  background-color: #f5f7fa;
  justify-content: space-between;

  .engine-selector {
    width: 90px;
    margin-right: 20px;
  }

  .language-selector {
    width: 100px;
  }
}

.logo {
  width: 20px;
  height: 20px;
  margin-left: 5px;
  margin-right: 8px;
}

.icons {
  display: flex;
  flex-direction: row;
}

.icon {
  color: #9ea3af;
  width: 25px;
  height: 25px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.icons .icon {
  margin-left: 3px;
}

.icon:hover {
  background-color: #e4e7ed;
  border-radius: 5px;
  cursor: pointer;
}

.icon i {
  font-weight: bold;
}
</style>
