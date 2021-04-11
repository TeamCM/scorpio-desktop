let {app, BrowserWindow, ipcMain, nativeTheme, Notification} = require("electron");
if(require('electron-squirrel-startup')) return app.quit();
const electronLog = require("electron-log");

electronLog.transports.console.format = '{h}:{i}:{s} {text}';

require("update-electron-app")({
    repo: "TeamCM/scorpio-desktop",
    updateInterval: "10 minutes",
    logger: electronLog
});

nativeTheme.themeSource = "dark";
electronLog.log("Starting Scorpio...");

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
    let win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            allowRunningInsecureContent: false,
            contextIsolation: false
        },
        icon: "./favicon.ico",
        frame: false
    });
    electronLog.log("Started scorpio!");

    win.setMenu(null);
    win.maximize();

    win.on('closed', () => {
        win = null;
    });
    ipcMain.on("close", ()=>{win.close();});
    ipcMain.on("maximize", (event)=>{if(!win.isMaximized()){win.maximize();}else{win.unmaximize();}event.reply("Tried to maximize!");});
    ipcMain.on("minimize", (event)=>{win.minimize();event.reply("Tried to minimize!");});
    ipcMain.on("notification", (event, notObj) => {
        if(getDoNotDisturb() || win.isFocused()) return event.reply("false");
        new Notification({title: notObj.author, body: notObj.message}).on("click", function(){
            win.focus();
        }).show();
        event.reply("true");
    });

    win.loadURL(process.env.IP || "http://localhost/app"); //Zerotier one network not an real ip
    
    return true;
}