const electron = require('electron');
const url = require('url');
const path = require('path');
const {app, BrowserWindow} = electron;
let mainWindow;
app.on('ready', function(){
    mainWindow = new BrowserWindow({
        height: 600,
        width: 500,
        backgroundColor: '#28252e',
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.setResizable(false);
    mainWindow.loadURL(`file://${__dirname}/main-window.html`);
    mainWindow.on("closed", function() {
        app.quit();
    })
});