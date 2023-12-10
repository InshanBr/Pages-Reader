const { app, BrowserWindow, globalShortcut } = require('electron');
const fs = require('fs');

const data = fs.readFileSync('links.txt', {
    encoding: 'utf8',
    flag:'r',
});
const links = (data.toString()).split('\r\n');
const linksLength = links.length - 1;
const wait = (time) => {
    return new Promise(resolve => setTimeout(resolve, time));
}
let index = 0;
let actualIndex = 0;

const createWindow = () => {
    const frame = new BrowserWindow({
        fullscreen: false,
        autoHideMenuBar: true,
    });

    // Responsavel por identificar o tipo de link, carrega-lo e impoedir de que o programa leia links muito rapido. IN PROGRESS
    async function delayReader() { 
        while (true) {
            if (index != actualIndex) {
                actualIndex = index;
                frame.loadURL(links[index]);
            }
            await wait(500);
        }
    }

    // Responsavel por mudar o link caso passe o tempo. IN PROGRESS
    // async function autoChange() { 
    //     let start = Date.now()
    //     let linkTimer = 2000;
    //     let timer;
    //     const savedIndex = index;
    //     while (true) {
    //         if (start) {

    //         } else if (savedIndex != index) {
    //             savedIndex = index;
    //             start = Date.now();
    //         }
            
    //         await wait(200);
    //     }
    // }

    frame.loadURL(links[0]);

    delayReader();
    //autoChange();

    globalShortcut.register('Escape', () => {
        frame.close();
    });

    globalShortcut.register('Left', () => {
        index = checkIndex(index, linksLength,-1);
    })

    globalShortcut.register('Right', () => {
        index = checkIndex(index, linksLength,1);
    })
}

function checkIndex(index,linksLength,value) {
    index += value;
    if (index > linksLength) {
      return 0;
    } else if (index < 0) {
      return linksLength;
    } else {
      return index;
    };
  };

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        globalShortcut.unregisterAll();
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
});