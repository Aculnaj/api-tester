const { app, BrowserWindow, ipcMain, nativeTheme, Menu } = require('electron');
const path = require('path');
const express = require('express');
const cors = require('cors');

console.log('[Main Process] main.js starting');

// Set the application name (affects menu bar on macOS during development)
if (process.platform === 'darwin') {
  app.setName("API Tester");
  console.log('[Main Process] App name set to API Tester');
}

let storeInstance; // Will hold the initialized store

// Dynamically import electron-store
async function initializeStore() {
  console.log('[Main Process] initializeStore() called');
  try {
    const { default: Store } = await import('electron-store');
    console.log('[Main Process] electron-store imported successfully');
    storeInstance = new Store({
      defaults: {
        userTheme: 'system' // 'system', 'light', 'dark'
      }
    });
    console.log('[Main Process] Store initialized with defaults:', storeInstance.store);

    // Initialize store with a default structure for API keys if it doesn't exist
    if (!storeInstance.has('apiCredentials')) {
      storeInstance.set('apiCredentials', {});
      console.log('[Main Process] Initialized apiCredentials in store');
    }

    // IPC handlers for electron-store (and theme)
    console.log('[Main Process] Attempting to register get-store-value IPC handler.');
    ipcMain.handle('get-store-value', (event, key) => {
      const value = storeInstance.get(key);
      // console.log(`[Main Process] IPC Handler: get-store-value for key: ${key}, returning:`, value);
      return value;
    });
    console.log('[Main Process] Successfully registered get-store-value IPC handler.');

    console.log('[Main Process] Attempting to register set-store-value IPC handler.');
    ipcMain.handle('set-store-value', (event, key, value) => {
      storeInstance.set(key, value);
      // console.log(`[Main Process] IPC Handler: set-store-value for key: ${key}, value:`, value);
    });
    console.log('[Main Process] Successfully registered set-store-value IPC handler.');

    console.log('[Main Process] Attempting to register delete-store-value IPC handler.');
    ipcMain.handle('delete-store-value', (event, key) => {
      storeInstance.delete(key);
      // console.log(`[Main Process] IPC Handler: delete-store-value for key: ${key}`);
    });
    console.log('[Main Process] Successfully registered delete-store-value IPC handler.');

    console.log('[Main Process] Attempting to register get-theme-preference IPC handler.');
    ipcMain.handle('get-theme-preference', () => {
      const theme = storeInstance.get('userTheme', 'system');
      let shouldUseDark = nativeTheme.shouldUseDarkColors;
      if (theme === 'light') shouldUseDark = false;
      if (theme === 'dark') shouldUseDark = true;
      console.log('[Main Process] IPC Handler: get-theme-preference. Returning:', { theme, shouldUseDark }); // Corrected log
      return { theme, shouldUseDark };
    });
    console.log('[Main Process] Successfully registered get-theme-preference IPC handler.');

    console.log('[Main Process] Attempting to register set-theme-preference IPC handler.');
    ipcMain.handle('set-theme-preference', (event, theme) => {
      storeInstance.set('userTheme', theme);
      console.log(`[Main Process] IPC Handler: set-theme-preference. User theme set to: ${theme}`);
      let newShouldUseDark;
      if (theme === 'system') {
        nativeTheme.themeSource = 'system';
        newShouldUseDark = nativeTheme.shouldUseDarkColors;
      } else if (theme === 'light') {
        nativeTheme.themeSource = 'light';
        newShouldUseDark = false;
      } else {
        nativeTheme.themeSource = 'dark';
        newShouldUseDark = true;
      }
      windows.forEach(win => {
        if (win && !win.isDestroyed()) {
          win.webContents.send('theme-updated', { theme, shouldUseDark: newShouldUseDark });
        }
      });
      return { theme, shouldUseDark: newShouldUseDark };
    });
    console.log('[Main Process] Successfully registered set-theme-preference IPC handler.');

    console.log('[Main Process] IPC handlers set up');
  } catch (error) {
    console.error('[Main Process] Error in initializeStore():', error);
  }
}

// Express server setup for handling API requests
const expressApp = express();
const PORT = 3001;

expressApp.use(cors());
expressApp.use(express.json());

// Video generation endpoint
expressApp.post('/videos/generations', async (req, res) => {
  try {
    const { model, prompt, aspect_ratio, duration } = req.body;
    
    console.log('Video generation request:', {
      model,
      prompt,
      aspect_ratio,
      duration
    });
    
    // Here you would integrate with your actual video generation API
    // This is a placeholder implementation that returns a sample response
    const requestBody = {
      model: model,
      prompt: prompt,
      duration: duration
    };
    
    // Add aspect ratio if provided
    if (aspect_ratio) {
      requestBody.aspect_ratio = aspect_ratio;
    }
    
    // Simulate API processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For now, return a placeholder response
    // In a real implementation, you would call your video generation API here
    const videoResponse = {
      data: [{
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4' // Placeholder video URL
      }],
      usage: {
        prompt_tokens: prompt.length
      },
      created: Math.floor(Date.now() / 1000)
    };
    
    res.json(videoResponse);
    
  } catch (error) {
    console.error('Error in video generation:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to generate video'
      }
    });
  }
});

// Start Express server
let server;
function startExpressServer() {
  server = expressApp.listen(PORT, () => {
    console.log(`[Express Server] Running on http://localhost:${PORT}`);
  });
}

let windows = new Set();

let lastWindowPosition = null; // To store the position of the last created window
const WINDOW_OFFSET = 25; // Pixels to offset new windows

function createWindow() {
  console.log('[Main Process] createWindow() called');

  let newX, newY;
  const focusedWindow = BrowserWindow.getFocusedWindow();

  if (focusedWindow) {
    const [currentX, currentY] = focusedWindow.getPosition();
    newX = currentX + WINDOW_OFFSET;
    newY = currentY + WINDOW_OFFSET;
    lastWindowPosition = { x: newX, y: newY };
  } else if (lastWindowPosition) {
    newX = lastWindowPosition.x + WINDOW_OFFSET;
    newY = lastWindowPosition.y + WINDOW_OFFSET;
    lastWindowPosition = { x: newX, y: newY };
  } else {
    // Default position for the first window or if no window is focused
    // This could be centered or a fixed starting point
    // For simplicity, let's let Electron decide the first window's position
    // and subsequent windows will be offset from the last one created if no focus.
    // If a window is focused, new windows are offset from it.
  }


  // Create the browser window.
  const newWindow = new BrowserWindow({
    title: "API Tester",
    width: 800,
    height: 600,
    x: newX, // Set the x position
    y: newY, // Set the y position
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // If this is the first window and we didn't set an explicit x/y
  // capture its initial position to base future offsets if no window is focused.
  if (!lastWindowPosition && !focusedWindow) {
    const [initialX, initialY] = newWindow.getPosition();
    lastWindowPosition = { x: initialX, y: initialY };
  }


  // Load the index.html of the app.
  newWindow.loadFile('index.html');
  console.log('[Main Process] Window created and index.html loaded for new window');

  // Add the new window to our set
  windows.add(newWindow);

  // Handle window closure
  newWindow.on('closed', () => {
    console.log('[Main Process] Window closed, removing from set.');
    windows.delete(newWindow);
    if (windows.size === 0) {
      lastWindowPosition = null; // Reset position when all windows are closed
    }
  });

  // Optional: Open DevTools for new windows (useful for debugging)
  // newWindow.webContents.openDevTools();

  // Send initial theme information to the new window
  // This ensures new windows also get the correct theme immediately
  const currentThemeSetting = storeInstance.get('userTheme', 'system');
  let shouldUseDark = nativeTheme.shouldUseDarkColors;
  if (currentThemeSetting === 'light') shouldUseDark = false;
  if (currentThemeSetting === 'dark') shouldUseDark = true;
  
  newWindow.webContents.on('did-finish-load', () => {
    newWindow.webContents.send('theme-updated', {
      theme: currentThemeSetting,
      shouldUseDark: shouldUseDark
    });
  });

  return newWindow; // Return the new window instance
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  console.log('[Main Process] app.whenReady() promise resolved');
  await initializeStore(); // Ensure store is initialized before creating window
  console.log('[Main Process] initializeStore() awaited');
  
  // Start Express server
  startExpressServer();
  
  createWindow();

  // Set up application menu for New Window shortcut and Dock menu item
  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Window',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            createWindow();
          }
        },
        { type: 'separator' },
        process.platform === 'darwin' ? { role: 'close' } : { role: 'quit' }
      ]
    },
    // Edit menu (for copy, paste, etc.)
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(process.platform === 'darwin' ? [
          { role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' },
          { type: 'separator' },
          {
            label: 'Speech',
            submenu: [
              { role: 'startSpeaking' },
              { role: 'stopSpeaking' }
            ]
          }
        ] : [
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ])
      ]
    },
    // View menu (for devtools, fullscreen, etc.)
    {
        label: 'View',
        submenu: [
            { role: 'reload' },
            { role: 'forceReload' },
            { role: 'toggleDevTools' },
            { type: 'separator' },
            { role: 'resetZoom' },
            { role: 'zoomIn' },
            { role: 'zoomOut' },
            { type: 'separator' },
            { role: 'togglefullscreen' }
        ]
    },
    // Window menu
    {
        label: 'Window',
        submenu: [
            { role: 'minimize' },
            { role: 'zoom' },
            ...(process.platform === 'darwin' ? [
                { type: 'separator' },
                { role: 'front' },
                { type: 'separator' },
                { role: 'window' }
            ] : [
                { role: 'close' }
            ])
        ]
    }
  ];

  // On macOS, add an app menu
  if (process.platform === 'darwin') {
    menuTemplate.unshift({
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // IPC listener to open a new window (can still be triggered by the button)
  ipcMain.on('open-new-window', () => {
    console.log('[Main Process] Received open-new-window IPC message');
    createWindow();
  });

  // Listen for OS theme changes
  nativeTheme.on('updated', () => {
    console.log('[Main Process] nativeTheme updated event');
    const currentThemeSetting = storeInstance.get('userTheme', 'system');
    const shouldUseDark = nativeTheme.shouldUseDarkColors; // Get current OS state
    
    windows.forEach(win => {
      if (win && !win.isDestroyed() && win.webContents) {
        // The renderer needs to know the stored preference AND the current OS state
        // to correctly apply the theme, especially if preference is 'system'.
        win.webContents.send('theme-updated', {
          theme: currentThemeSetting,
          shouldUseDark: shouldUseDark
        });
      }
    });
  });

  app.on('activate', async function () {
    console.log('[Main Process] app.on(\'activate\') event');
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (windows.size === 0) { // Check our set of windows
      // initializeStore should already be called by whenReady,
      // but good to ensure if activate can be called independently in some scenarios.
      // await initializeStore(); // Usually not needed here if app is already ready.
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    // Close Express server before quitting
    if (server) {
      server.close(() => {
        console.log('[Express Server] Server closed');
        app.quit();
      });
    } else {
      app.quit();
    }
  }
});

// Handle app quit
app.on('before-quit', () => {
  if (server) {
    server.close(() => {
      console.log('[Express Server] Server closed on app quit');
    });
  }
});

// In this file, you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here. 