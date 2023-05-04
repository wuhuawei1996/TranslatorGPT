import { createRouter, createWebHashHistory } from "vue-router";
import Translator from "/src/windows/index/pages/translator/Translator.vue";
import Proofreader from "/src/windows/index/pages/proofreader/Proofreader.vue";
const routes = [
  {
    path: "/",
    redirect: "/translator",
  },
  {
    path: "/translator",
    name: "Translator",
    component: Translator,
    meta: {
      keepAlive: true,
    },
  },
  {
    path: "/proofreader",
    name: "Proofreader",
    component: Proofreader,
    meta: {
      keepAlive: true,
    },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
