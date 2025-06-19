const { contextBridge, ipcRenderer } = require('electron');

console.log('[Preload] preload.js loaded');

contextBridge.exposeInMainWorld('electronAPI', {
  // Store operations
  getStoreValue: (key) => ipcRenderer.invoke('get-store-value', key),
  setStoreValue: (key, value) => ipcRenderer.invoke('set-store-value', key, value),
  deleteStoreValue: (key) => ipcRenderer.invoke('delete-store-value', key),

  // Theme operations
  getThemePreference: () => ipcRenderer.invoke('get-theme-preference'),
  setThemePreference: (theme) => ipcRenderer.invoke('set-theme-preference', theme),
  onThemeUpdated: (callback) => {
    console.log('[Preload] onThemeUpdated listener being set up in renderer.');
    const handler = (event, { theme, shouldUseDark }) => {
      console.log('[Preload] Theme update received from main:', { theme, shouldUseDark });
      callback(theme, shouldUseDark);
    };
    ipcRenderer.on('theme-updated', handler);
    // Return a cleanup function
    return () => {
      console.log('[Preload] Cleaning up onThemeUpdated listener.');
      ipcRenderer.removeListener('theme-updated', handler);
    };
  },

  // Window operations
  send: (channel, data) => {
    // Whitelist channels
    const validChannels = ['open-new-window'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    } else {
      console.warn(`[Preload] Attempted to send on invalid channel: ${channel}`);
    }
  },

  // If you need to receive messages in renderer initiated by main (not invoke/handle)
  // on: (channel, func) => {
  //   const validChannels = ['some-channel-from-main']; // Example
  //   if (validChannels.includes(channel)) {
  //     // Deliberately strip event as it includes `sender`
  //     ipcRenderer.on(channel, (event, ...args) => func(...args));
  //   }
  // }
});

console.log('[Preload] electronAPI exposed to main world.');
