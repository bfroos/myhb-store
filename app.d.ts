declare module "@mailchimp/mailchimp_marketing";

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
