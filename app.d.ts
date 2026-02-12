declare module "@mailchimp/mailchimp_marketing";

declare module "@nuxt/schema" {
  interface NuxtConfig {
    scripts?: {
      registry?: Record<string, unknown>;
    };
  }
}

declare global {
  interface Window {
    Cookiebot?: {
      show?: () => void;
      renew?: () => void;
      consent?: {
        marketing: boolean;
        statistics: boolean;
        preferences: boolean;
        necessary: boolean;
      };
    };
  }
}

export {};
