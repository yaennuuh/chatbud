import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';

export default class Main {
    static mainWindow: Electron.BrowserWindow;
    static application: Electron.App;
    static BrowserWindow;

    private static onWindowAllClosed() {
        if (process.platform !== 'darwin') {
            Main.application.quit();
        }
    }

    private static onClose() {
        // Dereference the window object. 
        Main.mainWindow = null;
    }

    private static onReady() {

        Main.mainWindow = new Main.BrowserWindow({
            width: 1280,
            height: 720,
            frame: false,
            webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true
            }
        });
        Main.mainWindow.setMenuBarVisibility(false);
        Main.mainWindow.loadURL('file://' + __dirname + '/ui/loading.html');
        setTimeout(() => Main.mainWindow.loadURL('file://' + __dirname + '/ui/main.html'), 5000)
        Main.mainWindow.on('closed', Main.onClose);
        Main.mainWindow.once('ready-to-show', () => {
            autoUpdater.checkForUpdatesAndNotify();
        });

        autoUpdater.on('update-available', () => {
            Main.mainWindow.webContents.send('update_available');
        });
        autoUpdater.on('update-downloaded', () => {
            Main.mainWindow.webContents.send('update_downloaded');
        });

        //Main.mainWindow.maximize();
        //Main.mainWindow.webContents.openDevTools();
        
        Main.init();
    }

    static init() {
        ipcMain.on('close-application', function (event, data) {
            Main.mainWindow.close();
        });
        ipcMain.on('app_version', (event) => {
            event.sender.send('app_version', { version: app.getVersion() });
        });
        ipcMain.on('restart_app', () => {
            autoUpdater.quitAndInstall();
        });
    };

    static main(app: Electron.App, browserWindow: typeof BrowserWindow) {
        // we pass the Electron.App object and the  
        // Electron.BrowserWindow into this function 
        // so this class has no dependencies. This 
        // makes the code easier to write tests for 
        Main.BrowserWindow = browserWindow;
        Main.application = app;
        Main.application.on('window-all-closed', Main.onWindowAllClosed);
        Main.application.on('ready', Main.onReady);
    }
}