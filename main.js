const electron = require('electron');
const url = require('url');
const path = require('path');
const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;
let addWindow;


// SET ENV
//process.env.NODE_ENV = 'production';
process.env.NODE_ENV = 'development';

// listen for app to be ready
app.on('ready', function(){
    // create new window
    mainWindow = new BrowserWindow({});

    // load html into new window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    // build menu from template
    const mainMenu  = Menu.buildFromTemplate(mainMenuTemplate);

    // add/insert menu
    Menu.setApplicationMenu(mainMenu);

    // quit app when closed
    mainWindow.on('closed', function(){
        app.quit();
    })
})

// handle create 'add' window
function createAddWindow(){
    // create new window
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add Shopping List Item'
    });

    // load html into new window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    // garbage collection
    addWindow.on('close', function(){
        addWindow = null;
    })
}

// catch item:add
ipcMain.on('item:add', function(e, item){
    console.log(item);
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
})

// create menu template
const mainMenuTemplate = [{
    label: 'File',
    submenu: [
        {
            label: 'Add Item',
            click(){
                createAddWindow();
            }
        },
        {
            label: 'Clear Item',
            click(){
                mainWindow.webContents.send('item:clear');
            }
        },
        {
            label: 'Quit',
            accelerator: process.platform == 'darwin' ? 'Command+Q': 'Ctrl+Q',
            click(){
                app.quit();
            }
        }
    ]
}];

// if mac , add empty object to menu
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

// add developer tools if not production
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developers Tools',
        submenu:[{
            label: 'Toggle DevTools',
            accelerator: process.platform == 'darwin' ? 'Command+I': 'Ctrl+I',
            click(item, focusWindow){
                focusWindow.toggleDevTools()
            }
        },
        {
            role: 'reload'
        }
    ]
    })
}

