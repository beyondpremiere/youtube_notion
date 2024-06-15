const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { downloadVideo, transcribe } = require('./server/transcriber');
const { addToNotion } = require('./server/notion');

let mainWindow;
let loadingWindow;

// Path to the bundled Python executable
const pythonPath = path.join(__dirname, 'python', 'bin', 'python');

function createLoadingWindow() {
  console.log('Creating loading window');
  loadingWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  const loadingPath = path.join(__dirname, 'public', 'loading.html');
  console.log(`Loading window path: ${loadingPath}`);
  loadingWindow.loadFile(loadingPath).then(() => {
    console.log('Loading window loaded');
  }).catch((error) => {
    console.error('Error loading loading.html:', error);
  });
}

function createMainWindow() {
  console.log('Creating main window');
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });
  const mainPath = path.join(__dirname, 'public', 'index.html');
  console.log(`Main window path: ${mainPath}`);
  mainWindow.loadFile(mainPath).then(() => {
    console.log('Main window loaded');
  }).catch((error) => {
    console.error('Error loading index.html:', error);
  });
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function checkDependencies() {
  console.log('Checking dependencies');
  try {
    execSync(`${pythonPath} --version`, { stdio: 'ignore' });
    execSync(`${pythonPath} -m pip show whisper`, { stdio: 'ignore' });
    execSync('yt-dlp --version', { stdio: 'ignore' });
    console.log('Dependencies are installed');
    return true;
  } catch (error) {
    console.error('Dependencies check failed:', error);
    return false;
  }
}

function installDependencies() {
  return new Promise((resolve, reject) => {
    console.log('Installing dependencies');
    const installScript = path.join(__dirname, 'scripts', 'installDependencies.js');
    try {
      execSync(`node "${installScript}"`, { stdio: 'inherit' });
      console.log('Dependencies installed successfully');
      resolve();
    } catch (error) {
      console.error('Error installing dependencies:', error);
      reject(error);
    }
  });
}

app.whenReady().then(() => {
  console.log('App is ready');
  if (!checkDependencies()) {
    console.log('Dependencies missing. Creating loading window');
    createLoadingWindow();
    installDependencies()
      .then(() => {
        console.log('Dependencies installed. Closing loading window and creating main window');
        loadingWindow.close();
        createMainWindow();
      })
      .catch((error) => {
        console.error('Failed to install dependencies:', error);
        loadingWindow.close();
        app.quit();
      });
  } else {
    console.log('Dependencies already installed. Creating main window');
    createMainWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

const settingsFilePath = path.join(app.getPath('userData'), 'settings.json');

function readSettings() {
  console.log('Reading settings');
  if (fs.existsSync(settingsFilePath)) {
    const data = fs.readFileSync(settingsFilePath, 'utf8');
    return JSON.parse(data);
  }
  return {};
}

function saveSettings(settings) {
  console.log('Saving settings');
  fs.writeFileSync(settingsFilePath, JSON.stringify(settings));
}

ipcMain.handle('transcribe', async (event, videoUrl) => {
  try {
    console.log('Transcription started');
    const settings = readSettings();
    const { notionApiToken, notionDatabaseId } = settings;
    if (!notionApiToken || !notionDatabaseId) {
      throw new Error('Notion API token and database ID are not set.');
    }
    event.sender.send('progress', 10);
    const { filePath, thumbnail, title } = await downloadVideo(videoUrl);
    event.sender.send('progress', 50);
    const transcription = await transcribe(filePath);
    event.sender.send('progress', 80);
    await addToNotion(notionApiToken, notionDatabaseId, title, transcription, videoUrl, thumbnail);
    event.sender.send('progress', 100);
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) console.error('Error deleting file:', unlinkErr);
    });
    return 'Transcription added to Notion successfully!';
  } catch (error) {
    console.error('Error during transcription or adding to Notion:', error);
    throw error;
  } finally {
    event.sender.send('progress', 0); // Reset progress
  }
});

ipcMain.handle('saveSettings', async (event, notionApiToken, notionDatabaseId) => {
  console.log('Saving settings via IPC');
  const settings = { notionApiToken, notionDatabaseId };
  saveSettings(settings);
  return 'Settings saved successfully';
});

ipcMain.handle('getSettings', () => {
  console.log('Getting settings via IPC');
  return readSettings();
});

ipcMain.handle('checkDependencies', () => {
  console.log('Checking dependencies via IPC');
  return checkDependencies();
});

ipcMain.handle('installDependencies', () => {
  console.log('Installing dependencies via IPC');
  installDependencies();
  mainWindow.loadFile('public/index.html');
});

// Capture unhandled exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
