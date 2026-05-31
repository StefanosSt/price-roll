import { ApiVersion } from "@shopify/shopify-app-react-router/server";
import { shopifyApiProject, ApiType } from "@shopify/api-codegen-preset";

const config = {
  projects: {
    default: shopifyApiProject({
      apiType: ApiType.Admin,
      apiVersion: ApiVersion.October25,
      documents: [
        "./app/**/*.{js,ts,jsx,tsx}",
        "./app/.server/**/*.{js,ts,jsx,tsx}",
      ],
      outputDir: "./app/types",
    }),
  },
};
export default config;
