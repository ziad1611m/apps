const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron');
const path = require('path');
const Store = require('electron-store');

// Initialize electron store for persistent data
const store = new Store();

// Enable hot reload in development
if (process.env.NODE_ENV === 'development') {
    try {
        require('electron-reloader')(module);
    } catch { }
}

let mainWindow;

function createWindow() {
    // Get saved window state
    const windowState = store.get('windowState', {
        width: 1400,
        height: 900,
        x: undefined,
        y: undefined,
        isMaximized: false
    });

    mainWindow = new BrowserWindow({
        width: windowState.width,
        height: windowState.height,
        x: windowState.x,
        y: windowState.y,
        minWidth: 1200,
        minHeight: 700,
        frame: true,
        icon: path.join(__dirname, '../public/icon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        backgroundColor: '#f8fafc',
        show: false // Don't show until ready
    });

    // Restore maximized state
    if (windowState.isMaximized) {
        mainWindow.maximize();
    }

    // Load Next.js app
    const isDev = process.env.NODE_ENV === 'development';
    const url = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../out/index.html')}`;

    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
    } else {
        // For production, serve the Next.js export
        mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
    }

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Save window state on close
    mainWindow.on('close', () => {
        const bounds = mainWindow.getBounds();
        store.set('windowState', {
            width: bounds.width,
            height: bounds.height,
            x: bounds.x,
            y: bounds.y,
            isMaximized: mainWindow.isMaximized()
        });
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Open external links in default browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // Context Menu (Right Click)
    mainWindow.webContents.on('context-menu', (event, params) => {
        const menuItems = [];

        // Show Copy only if text is selected
        if (params.selectionText && params.selectionText.trim().length > 0) {
            menuItems.push({ label: 'Copy', role: 'copy' });
        }

        // Show Paste only if inside an editable field
        if (params.isEditable) {
            menuItems.push({ label: 'Paste', role: 'paste' });
        }

        // Only show menu if there are items
        if (menuItems.length > 0) {
            const menu = Menu.buildFromTemplate(menuItems);
            menu.popup(mainWindow);
        }
    });
}

// App lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// IPC Handlers for renderer process communication

// Store operations
ipcMain.handle('store:get', (event, key, defaultValue) => {
    return store.get(key, defaultValue);
});

ipcMain.handle('store:set', (event, key, value) => {
    store.set(key, value);
    return true;
});

ipcMain.handle('store:delete', (event, key) => {
    store.delete(key);
    return true;
});

// App info
ipcMain.handle('app:getVersion', () => {
    return app.getVersion();
});

ipcMain.handle('app:getPath', (event, name) => {
    return app.getPath(name);
});

// Window controls
ipcMain.on('window:minimize', () => {
    mainWindow.minimize();
});

ipcMain.on('window:maximize', () => {
    if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow.maximize();
    }
});

ipcMain.on('window:close', () => {
    mainWindow.close();
});
