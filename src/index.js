process.env.GOOGLE_APPLICATION_CREDENTIALS = './src/vivid-science-327616-2a2c0443fda6.json'
const { app, BrowserWindow, BrowserView, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
var env = process.env

// const electronDl = require('electron-dl');

const { download } = require('electron-dl');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}


const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({

    width: 800,
    height: 600,
    // backgroundColor: '#262323',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    frame: false,
    resizable: false
    // transparent: true
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  // mainWindow.setBackgroundColor('#111827')

  //window controls
  ipcMain.on('close-window', () => {

    //if mainWindow is the window object
    mainWindow.close();

  })

  ipcMain.on('min-window', () => {

    //if mainWindow is the window object
    mainWindow.minimize();

  })

  ipcMain.on('force-reload', (event, arg) => {
    mainWindow.webContents.reload()
  })




  // download mods
  ipcMain.on('download-items', async (event, info) => {
    // console.log(info.files[0][0])
    async function fileDownload() {
      await Promise.all(info.files.map(async file => {
        if (info.files.length === 1) {
          download(mainWindow, file[0].downloadUrl, {
            directory: info.directory
          })
            .then(dl => mainWindow.webContents.send("download complete", dl.getSavePath()))
            .catch(console.error)
        } else {
          download(mainWindow, file[0].downloadUrl, {
            directory: info.directory
          })
            .then(dl => mainWindow.webContents.send("download complete", dl.getSavePath()))
            .catch(console.error)
        }
      }))
    }
    async function startDownload() {
      await fileDownload()
    }
    startDownload()
  });




  //download minecraft installers
  ipcMain.on('download-installers', async (event, { paths, urls }) => {
    // console.log(paths, urls)
    if (fs.existsSync(`${env.programW6432}/Java`) === false) {
      async function jreDownload() {
        await download(mainWindow, urls.jre, {
          directory: paths.dirpathInstallers,
          overwrite: true,
          onCompleted: mainWindow.webContents.send("jre-downloaded")
        })
      }

      async function triggerJreDownload() {
        await jreDownload()
      }
      triggerJreDownload()
    }

    async function fileDownload() {

      await download(mainWindow, urls.forge, {
        directory: paths.dirpathInstallers,
        overwrite: true
      })
        .then(dl => mainWindow.webContents.send("forge-downloaded", dl.getSavePath()))
        .catch(console.error)

      await download(mainWindow, urls.optifine, {
        directory: paths.dirpathMods,
        overwrite: true
      })
        .then(dl => mainWindow.webContents.send("optifine-downloaded", dl.getSavePath()))
        .catch(console.error)
      await download(mainWindow, urls.customSkinLoader, {
        directory: paths.dirpathMods,
        overwrite: true
      })
        .then(dl => mainWindow.webContents.send("customSkinLoader-downloaded", dl.getSavePath()))
        .catch(console.error)

    }
    setTimeout(async function () { await fileDownload(); }, 20000);
    // async function startDownload() {
    //   // await fileDownload()

    // }
    // startDownload()
  });



  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};




// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
