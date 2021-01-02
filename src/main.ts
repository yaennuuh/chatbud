import { BrowserWindow, ipcMain } from 'electron';

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
        Main.mainWindow
            .loadURL('file://' + __dirname + '/ui/main.html');
        Main.mainWindow.on('closed', Main.onClose);
        //Main.mainWindow.maximize();
        //Main.mainWindow.webContents.openDevTools();
        Main.init();
    }

    static init() {
        ipcMain.on('close-application', function (event, data) {
            Main.mainWindow.close();
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