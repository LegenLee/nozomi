import { createRouter, createWebHashHistory } from "vue-router";

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      name: "components-view",
      path: "/components",
      component: () => import("@/views/ComponentsView.vue"),
    },
    {
      name: "navigation-rail-view",
      path: "/navigation-rail",
      component: () => import("@/views/NavigationRailView.vue"),
    },
  ],
});
