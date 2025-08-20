// src/lib/gtag.ts
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? '';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export const isGaEnabled =
  typeof window !== 'undefined' && typeof window.gtag === 'function' && !!GA_ID;

export function pageview(url: string) {
  if (!isGaEnabled) return;
  window.gtag('config', GA_ID, { page_path: url });
}

export function gaEvent(action: string, params: Record<string, any> = {}) {
  if (!isGaEnabled) return;
  window.gtag('event', action, params);
}

export {};
