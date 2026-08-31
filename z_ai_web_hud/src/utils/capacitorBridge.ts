import { Capacitor } from '@capacitor/core';
import { AppLauncher } from '@capacitor/app-launcher';

export const isNative = Capacitor.isNativePlatform();

/**
 * Open a native application via its package name or URL scheme.
 * Example for Android: 'com.whatsapp' or 'com.google.android.youtube'
 */
export async function openApplication(appId: string): Promise<boolean> {
  if (!isNative) {
    console.warn(`openApplication called with ${appId} but not running on native mobile.`);
    // Fallback: try to open in a new window if it's a URL-like scheme (e.g. whatsapp://)
    if (appId.includes('://')) {
        window.open(appId, '_blank');
        return true;
    }
    return false;
  }
  
  try {
    const { value: canOpen } = await AppLauncher.canOpenUrl({ url: appId });
    if (canOpen) {
      await AppLauncher.openUrl({ url: appId });
      return true;
    } else {
      console.error(`Cannot open application: ${appId}`);
      return false;
    }
  } catch (err) {
    console.error('Error opening application', err);
    return false;
  }
}
