require('dotenv').config();

const path = require("path");
const {
  default: installExtension,
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS
} = require('electron-devtools-installer');

const { app, BrowserWindow } = require("electron");
const isDev = require("electron-is-dev");
const setupSerialHandler = require('./serial');


function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js")
    },
    autoHideMenuBar: true
  });

  // and load the index.html of the app.
  // win.loadFile("index.html");
  void win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${ path.join(__dirname, "../../build/index.html") }`
  );

  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools();
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady()
.then(() => isDev ?
  installExtension([REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS], true)
  .then((name) => console.log(`Added Extension:  ${ name }`))
  .catch((err) => console.error('An error occurred adding extension: ', err)) :
  null
)
.then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS, it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

setupSerialHandler();
