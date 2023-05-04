import { createStore } from "vuex";
import defaultSettings from "/src/assets/data/default_settings.js";
import defaultConfig from "/src/assets/data/default_config.js";

const store = createStore({
  state() {
    return {
      settings: {
        ...defaultSettings(),
      },
      config: {
        ...defaultConfig(),
      },
    };
  },
  mutations: {
    changeSettings(state, arg) {
      Object.keys(arg).map((item) => {
        const array = item.split(".");
        if (array.length > 1) {
          state.settings[array[0]][array[1]] = arg[item];
        } else {
          state.settings[array[0]] = arg[item];
        }
      });
    },
  },
});
export default store;
