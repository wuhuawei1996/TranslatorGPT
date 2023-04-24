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
  },
  components: {
    Switch,
  },
  data() {
    return {
      formerSourceLanguages: [],
      listeners: [],
    };
  },
  computed: {
    sourceLanguageNoEmpty() {
      return this.config.sourceLanguages.length > 0;
    },
    languageNames() {
      return languageNames[this.settings.basics.language];
    },
    languageOptions() {
      return generateLanguageOptions(this.settings.basics.language);
    },
    sourceLanguageTitle() {
      return this.config.sourceLanguages
        .map((item) => {
          if (item === "auto") return this.systemLanguage.autoLanguage;
          return languageNames[this.settings.basics.language][item];
        })
        .join(" + ");
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
          return item.key !== "";
        });
    },
  },
  watch: {
    engineOptions: {
      handler(newVal) {
        if (newVal.length > 0 && this.config.engine === "") {
          this.config.engine = newVal[0].value;
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
      if (this.config.sourceLanguages.length === 0) {
        this.config.sourceLanguages = ["auto"];
      }
      if (this.config.targetLanguage === "") {
        this.config.targetLanguage = "eng";
      }
    },
    async onChange(value, key) {
      const index = value.indexOf("auto");
      if (index !== -1) {
        if (this.formerSourceLanguages.indexOf("auto") === -1) {
          if (this.formerSourceLanguages.length > 0) {
            value = ["auto"];
          }
        } else {
          value.splice(index, 1);
        }
      }
      if (value.length === 0) {
        value = ["auto"];
      }
      this.config[key] = value;
      this.formerSourceLanguages = [].concat(value);
    },
    switchLanguages() {
      const { sourceLanguages, targetLanguage } = this.config;
      const temp = sourceLanguages[0];
      if (temp !== "auto") {
        this.config.sourceLanguages = [targetLanguage];
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
        ]
      );
    },
  },
  mounted() {
    this.initData();
    this.formerSourceLanguages = [].concat(this.config.sourceLanguages);
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
      multiple
      placement="bottom"
      :filterable="false"
      :teleported="false"
      :no-match-text="systemLanguage.notFound"
      filterable
      :placeholder="systemLanguage['sourceLanguage']"
      size="small"
      class="source-language-selector"
      :class="{ 'multiple-non-empty': sourceLanguageNoEmpty }"
      :model-value="config.sourceLanguages"
      :title="sourceLanguageTitle"
      @change="onChange($event, 'sourceLanguages')"
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

    <div class="icon" style="margin: 0px 3px" @click="switchLanguages">
      <el-icon size="15" style="margin-top: -0.3px">
        <Switch />
      </el-icon>
    </div>

    <el-select
      placement="bottom"
      :teleported="false"
      filterable
      :no-match-text="systemLanguage.notFound"
      :placeholder="systemLanguage['targetLanguage']"
      size="small"
      class="target-language-selector"
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
