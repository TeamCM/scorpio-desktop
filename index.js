let {app, BrowserWindow} = require("electron");
const url = require("url");
const path = require("path");
const fs = require("fs");

console.log("");

app.on("ready", ligar);

app.on("quit", desligar);

app.on("window-all-closed", desligarTudo);

function ligar(){
    const win = new BrowserWindow({

    });
    
    win.loadURL(url.pathToFileURL(path.join(__dirname, "./scorpio/login.html")));
}

function desligar(){
    process.exit(0);
}

function desligarTudo(){app = null}