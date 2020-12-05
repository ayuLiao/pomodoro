const {app, BrowserWindow, ipcMain, Notification} = require('electron')

// 全局变量，避免被垃圾回收
let mainWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 250,
        height: 350,
        webPreferences: {
            // 开启node.js支持，默认是不允许使用node.js的
            nodeIntegration: true
        }
    })
    mainWindow.loadFile('./index.html')

    return mainWindow
}

app.whenReady().then(() => {
    createMainWindow()
})
