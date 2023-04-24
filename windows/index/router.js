import { createRouter, createWebHashHistory } from "vue-router";
import Translator from "/src/windows/index/pages/translator/Translator.vue";
const routes = [
  {
    path: "/translator",
    component: Translator,
  },
  {
    path: "/",
    redirect: "/translator",
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
