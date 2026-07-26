import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.infinitychat',
  appName: 'InfinityChat',
  webDir: 'public',
  bundledWebRuntime: false,
  server: {
    url: 'http://localhost:3000',
    cleartext: true
  }
};

export default config;
