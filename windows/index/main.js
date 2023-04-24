import { createApp } from "vue";
import App from "/src/windows/index/App.vue";
import router from "./router.js";
import store from "./store.js";

import "element-plus/dist/index.css";
import "/src/assets/css/styles.scss";
import "/src/assets/fonts/iconfont.css";

createApp(App).use(store).use(router).mount("#app");
