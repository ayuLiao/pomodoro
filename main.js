const {app, BrowserWindow, ipcMain, Notification} = require('electron')

// 全局变量，避免被垃圾回收
let mainWindow;

function handleIPC() {
    // 接受渲染进程的ipc
    ipcMain.handle('notification', async (e, {body, title, actions, closeButtonText}) => {
        let res = await new Promise((resolve, reject) => {
            console.log({body, title, actions, closeButtonText})
            let notification = new Notification({
                title, 
                body,
                actions,
                closeButtonText
            })
            notification.show()
            notification.on('action', function(event) {
                resolve({event: 'action'})
            })
            notification.on('close', function(event) {
                resolve({event: 'close'})
            })
        })
        return res
    })
}

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
    handleIPC()
    createMainWindow()
})
