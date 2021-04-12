let {app, BrowserWindow, ipcMain, nativeTheme, Notification, autoUpdater} = require("electron");
if(require('electron-squirrel-startup')) return app.quit();
const electronLog = require("electron-log");

electronLog.transports.console.format = '{h}:{i}:{s} {text}';

nativeTheme.themeSource = "dark";
electronLog.log("Starting Scorpio...");

const repo = {
    owner: "TeamCM",
    repository: "scorpio-desktop"
}
const url = `https://update.electronjs.org/${repo.owner}/${repo.repository}/${process.platform}-${process.arch}/${app.getVersion()}`;
electronLog.debug(`Your url to update is ${url}`);

autoUpdater.setFeedURL({url});

const { getDoNotDisturb } = require("electron-notification-state");

app.on("ready", ligar);

app.on("quit", function(){
    electronLog.log("Closing scorpio...");
    process.exit();
});

app.on("window-all-closed", function(){
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

function ligar(){
    let update = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            allowRunningInsecureContent: false
        },
        icon: "./icon.ico",
        frame: false
    });
    electronLog.log("Started scorpio!");
    let win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            allowRunningInsecureContent: false,
            contextIsolation: false
        },
        icon: "./icon.ico",
        frame: false,
        show: false
    });

    update.setMenu(null);
    win.setMenu(null);

    win.on('closed', () => {
        win = null;
    });
    update.on("closed", () => {
        update = null;
    });
    ipcMain.on("close", ()=>{win.close();});
    ipcMain.on("maximize", (event)=>{if(!win.isMaximized()){win.maximize();}else{win.unmaximize();}event.reply("true");});
    ipcMain.on("minimize", (event)=>{win.minimize();event.reply("true");});
    ipcMain.on("notification", (event, notObj) => {
        if(getDoNotDisturb() || win.isFocused()) return event.reply("false");
        new Notification({title: notObj.author, body: notObj.message}).on("click", function(){
            win.focus();
        }).show();
        event.reply("true");
    });
    ipcMain.on("update", ()=>{autoUpdater.quitAndInstall();});

    let isScorpioLoaded = false;
    update.loadFile("./update.html");

    autoUpdater.on("update-available", () => {
        ipcMain.emit("update-avaliable");
    });
    autoUpdater.on("update-downloaded", () => {
        ipcMain.emit("update-downloaded");
    });
    autoUpdater.on("error", err => {
        electronLog.error(err.message);
        if(!isScorpioLoaded){
            win.loadURL(process.env.IP || "http://localhost/app");
            ipcMain.emit("update-error");
            isScorpioLoaded = true;
            win.maximize();
            win.show();
            update.close();
        }
    });
    autoUpdater.on("update-not-available", () => {
        if(!isScorpioLoaded){
            win.loadURL(process.env.IP || "http://localhost/app");
            isScorpioLoaded = true;
            win.maximize();
            win.show();
            update.close();
        }
    });
    setTimeout(function(){
        autoUpdater.checkForUpdates();
    }, 1000);

    return true;
}