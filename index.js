let {app, BrowserWindow} = require("electron");
if(require("electron-squirrel-startup")) app.quit();

console.log("Starting Scorpio...");

app.on("ready", function(){ligar()});

app.on("quit", function(){desligar()});

app.on("window-all-closed", function(){desligarTudo()});

function ligar(){
    const win = new BrowserWindow({

    });
    console.log("Started scorpio!");
    win.loadFile("./scorpio/login.html");

    function sendStatusToWindow(obj){
        win.webContents.send(obj);
    }
}

function desligar(){
    console.log("Closing scorpio...");
    process.exit(0);
}

function desligarTudo(){app = null}