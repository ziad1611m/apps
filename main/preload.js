/**
 * Electron Preload Script
 * 
 * Exposes secure APIs to the renderer process.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Store operations
    store: {
        get: (key, defaultValue) => ipcRenderer.invoke('store:get', key, defaultValue),
        set: (key, value) => ipcRenderer.invoke('store:set', key, value),
        delete: (key) => ipcRenderer.invoke('store:delete', key)
    },

    // App operations
    app: {
        getVersion: () => ipcRenderer.invoke('app:getVersion'),
        getPath: (name) => ipcRenderer.invoke('app:getPath', name)
    },

    // Window controls
    window: {
        minimize: () => ipcRenderer.send('window:minimize'),
        maximize: () => ipcRenderer.send('window:maximize'),
        close: () => ipcRenderer.send('window:close')
    },

    // Platform info
    platform: process.platform,

    // Check if running in Electron
    isElectron: true
});
