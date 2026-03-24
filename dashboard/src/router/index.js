import { createRouter, createWebHistory } from "vue-router";
import { requireAuth, requireGuest } from "./authGuard";

const routes = [
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/LoginPage.vue"),
    beforeEnter: requireGuest,
  },
  {
    path: "/home",
    name: "home",
    component: () => import("@/views/HomePage.vue"),
    beforeEnter: requireAuth,
  },
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/project-management",
    name: "project-management",
    component: () => import("@/views/ProjectManagement.vue"),
    beforeEnter: requireAuth,
  },
  {
    path: "/feature-flags",
    name: "feature-flags",
    component: () => import("@/views/FeatureFlagsPage.vue"),
    beforeEnter: requireAuth,
  },
  {
    path: "/user-management",
    name: "user-management",
    component: () => import("@/views/UserManagementPage.vue"),
    beforeEnter: requireAuth,
  },
  {
    path: "/upload-markdown",
    name: "upload-markdown",
    component: () => import("@/views/UploadMarkdownToBasecamp.vue"),
    beforeEnter: requireAuth,
  },
];

const router = createRouter({
  history: createWebHistory("/dashboard/"),
  routes,
});

export default router;
