import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hajadnan.basa',
  appName: 'Basa Finder',
  webDir: 'dist',
  server: {
    // Points to the live Cloudflare Pages URL for instant, automated over-the-air updates
    url: 'https://basa-azi.pages.dev',
    cleartext: true
  }
};

export default config;
