<script>
// Public
import { appWindow } from "@tauri-apps/api/window";
import { Switch } from "@element-plus/icons-vue";

// Private
import languageNames from "/src/assets/data/language_names.js";
import ConfigSelector from "/src/components/ConfigSelector.vue";

export default {
  name: "TranslatorHeader",
  props: {
    config: {},
  },
  components: {
    Switch,
    ConfigSelector,
  },
  data() {
    return {};
  },
  computed: {
    systemLanguage() {
      return this.$root.systemLanguage;
    },
    languageOptions() {
      return languageNames["Chinese"].map((item) => {
        return {
          value: item,
        };
      });
    },
    settings() {
      return this.$store.state.settings;
    },
  },
  methods: {
    close() {
      appWindow.hide();
    },
  },
};
</script>

<template>
  <div class="translator-header flex-row">
    <ConfigSelector
      :systemLanguage="systemLanguage"
      :config="config"
      :settings="settings"
    />
    <div class="icons">
      <!--<div class="icon"></div>-->
    </div>
  </div>
</template>

<style lang="scss">
.translator-header {
  justify-content: space-between;

  .engine-selector {
    width: 110px;
    margin-right: 20px;
  }

  .language-selector {
    width: 120px;
  }
}

.icons .icon {
  width: 25px;
  height: 25px;
  margin-left: 3px;
}
</style>
