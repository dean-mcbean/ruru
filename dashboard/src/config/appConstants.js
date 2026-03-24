/**
 * Dashboard build-time config (Vue CLI exposes only `VUE_APP_*` env vars).
 * Organisation-specific defaults belong in `.env`, not here.
 */

function parseIntEnvOptional(key) {
  const v = process.env[key];
  if (v === undefined || v === "") return null;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
}

function parseIntListEnv(key, fallbackList) {
  const raw = process.env[key];
  if (!raw) return fallbackList;
  return raw
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !Number.isNaN(n));
}

export const RUNN_APP_BASE_URL =
  process.env.VUE_APP_RUNN_APP_BASE_URL || "https://app.runn.io";

/** When set, Runn projects with this `clientId` are hidden from the project list. */
export const RUNN_INTERNAL_CLIENT_ID =
  parseIntEnvOptional("VUE_APP_RUNN_INTERNAL_CLIENT_ID");

export const BASECAMP_EXCLUDED_PROJECT_IDS = parseIntListEnv(
  "VUE_APP_BASECAMP_EXCLUDED_PROJECT_IDS",
  [],
);

const templateEntries = [
  { title: "No Template", value: undefined },
];
if (process.env.VUE_APP_BASECAMP_TEMPLATE_CONSULTING) {
  templateEntries.push({
    title: "Consulting",
    value: process.env.VUE_APP_BASECAMP_TEMPLATE_CONSULTING,
  });
}
if (process.env.VUE_APP_BASECAMP_TEMPLATE_QUARTERLY) {
  templateEntries.push({
    title: "Quarterly Update",
    value: process.env.VUE_APP_BASECAMP_TEMPLATE_QUARTERLY,
  });
}
if (process.env.VUE_APP_BASECAMP_TEMPLATE_SAAS) {
  templateEntries.push({
    title: "SaaS",
    value: process.env.VUE_APP_BASECAMP_TEMPLATE_SAAS,
  });
}

export const BASECAMP_PROJECT_TEMPLATES = templateEntries;

export function getDefaultRunnClient() {
  const id = parseIntEnvOptional("VUE_APP_DEFAULT_RUNN_CLIENT_ID");
  return {
    id: id ?? 0,
    name:
      process.env.VUE_APP_DEFAULT_RUNN_CLIENT_NAME || "Default client",
    website: null,
    isArchived: false,
    references: [],
    createdAt: "",
    updatedAt: "",
  };
}

export function getDefaultBasecampSubscribers() {
  return parseIntListEnv("VUE_APP_BASECAMP_DEFAULT_SUBSCRIBERS", []);
}

/** Label shown in the “copy Runn → Basecamp” confirmation (display only). */
export const BASECAMP_COPY_SUBSCRIBERS_LABEL =
  process.env.VUE_APP_BASECAMP_COPY_SUBSCRIBERS_LABEL || "Subscribers";
