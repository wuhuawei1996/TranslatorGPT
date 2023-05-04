<script>
// Public
import { Switch } from "@element-plus/icons-vue";
import { listen, emit } from "@tauri-apps/api/event";

// Private
import languageNames from "/src/assets/data/language_names.js";
import generateLanguageOptions from "/src/utils/generate_language_options.js";
import engineNames from "/src/assets/data/engine_names.js";

export default {
  name: "ConfigSelector",
  props: {
    systemLanguage: {},
    config: {},
    settings: {},
    noSourceLanguage: false,
    filterProofreading: false,
  },
  components: {
    Switch,
  },
  data() {
    return {
      listeners: [],
    };
  },
  computed: {
    languageNames() {
      return languageNames[this.settings.basics.language];
    },
    languageOptions() {
      return generateLanguageOptions(this.settings.basics.language);
    },
    engineOptions() {
      const keys = this.settings.keys;
      return engineNames
        .map((item) => {
          return {
            label: item.label,
            value: item.key,
            key: keys[item.key],
          };
        })
        .filter((item) => {
          return (
            item.key !== "" &&
            (this.filterProofreading ? item.proofreading : true)
          );
        });
    },
  },
  watch: {
    engineOptions: {
      handler(newVal) {
        if (newVal.length > 0) {
          if (this.config.engine === "") {
            this.config.engine = newVal[0].value;
          }
        } else {
          this.config.engine = "";
        }
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    initConfig() {
      const config = {};
      Object.keys(this.config).map((item) => {
        const result = JSON.parse(
          localStorage.getItem("translation" + "." + item)
        );
        if (result) {
          config[item] = result;
        }
      });
    },
    initData() {
      if (this.config.sourceLanguage === "") {
        this.config.sourceLanguage = "auto";
      }
      if (this.config.targetLanguage === "") {
        this.config.targetLanguage = "eng";
      }
    },
    async onChange(value, key) {
      this.config[key] = value;
    },
    switchLanguages() {
      const { sourceLanguage, targetLanguage } = this.config;
      if (sourceLanguage !== "auto") {
        const temp = sourceLanguage;
        this.config.sourceLanguage = targetLanguage;
        this.config.targetLanguage = temp;
      }
    },
    async addListeners() {
      this.listeners.push(
        ...[
          // 同步配置
          await listen("sync_translation_config", ({ payload: { config } }) => {
            Object.assign(this.config, config);
          }),
          await listen("tauri://blur", () => {
            Object.keys(this.$refs).map((key) => {
              if (key.indexOf("selector") != -1) {
                this.$refs[key].blur();
              }
            });
          }),
        ]
      );
    },
  },
  mounted() {
    this.initData();
    this.addListeners();
  },
  unmounted() {
    this.listeners.forEach((listener) => listener());
  },
};
</script>

<template>
  <div class="config-selector flex-row">
    <el-select
      ref="engine-selector"
      :placeholder="systemLanguage['engine']"
      size="small"
      class="engine-selector"
      :model-value="config.engine"
      :title="config.engine"
      @change="onChange($event, 'engine')"
      :no-data-text="systemLanguage.noEngine"
    >
      <el-option
        v-for="item in engineOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
        :title="item.label"
      />
    </el-select>

    <el-select
      v-if="!noSourceLanguage"
      ref="source-language-selector"
      placement="bottom"
      :teleported="false"
      filterable
      :no-match-text="systemLanguage.notFound"
      :placeholder="systemLanguage['sourceLanguage']"
      size="small"
      class="language-selector"
      :model-value="config.sourceLanguage"
      :title="
        languageNames[config.sourceLanguage] || systemLanguage.autoLanguage
      "
      @change="onChange($event, 'sourceLanguage')"
    >
      <el-option
        v-for="item in [
          {
            value: 'auto',
            label: systemLanguage.autoLanguage,
          },
        ].concat(languageOptions)"
        :key="item.value"
        :label="item.label"
        :value="item.value"
        :title="item.label"
      />
    </el-select>

    <div
      class="icon"
      style="margin: 0px 3px"
      @click="switchLanguages"
      v-if="!noSourceLanguage"
    >
      <el-icon size="15" style="margin-top: -0.3px">
        <Switch />
      </el-icon>
    </div>

    <el-select
      ref="target-language-selector"
      placement="bottom"
      :teleported="false"
      filterable
      :no-match-text="systemLanguage.notFound"
      :placeholder="systemLanguage['targetLanguage']"
      size="small"
      class="language-selector"
      :model-value="config.targetLanguage"
      :title="languageNames[config.targetLanguage]"
      @change="onChange($event, 'targetLanguage')"
    >
      <el-option
        v-for="item in languageOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
        :title="item.label"
      />
    </el-select>
  </div>
</template>
<style lang="scss">
.config-selector {
  flex: 1;
}

.multiple-non-empty {
  input.el-input__inner {
    opacity: 0 !important;
  }
}
</style>
