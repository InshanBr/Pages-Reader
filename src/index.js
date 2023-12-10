const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');

if (require('electron-squirrel-startup')) {
  app.quit();
}

const data = fs.readFileSync('links.txt', {
    encoding: 'utf8',
    flag:'r',
});
const links = (data.toString()).split('\r\n');
const linksLength = links.length - 1;
const wait = (time) => {
    return new Promise(resolve => setTimeout(resolve, time));
}
const linksTime = 5000;
let index = 0;
let actualIndex = -1;

const createWindow = () => {
    const frame = new BrowserWindow({
        fullscreen: true,
        autoHideMenuBar: true,
    });

    async function delayReader() { 
        start = Date.now();
        hold = linksTime;
        while (true) {
            if (index != actualIndex) {
                start = Date.now();
                actualIndex = index;
                frame.loadURL(links[index]);
                if (links[index].includes('file://')) {
                    frame.webContents.once('dom-ready', () => {
                        frame.webContents.mainFrame.executeJavaScript(`
                        new Promise((resolve, reject) => {
                          const mediaElement = document.getElementsByName("media")[0];
                          if (mediaElement && mediaElement.readyState >= 2) {
                            resolve(mediaElement.duration);
                          } else {
                            mediaElement.addEventListener('loadedmetadata', () => {
                              resolve(mediaElement.duration);
                            });
                          }
                        });
                      `)
                      .then(time => {
                        hold = 1000 + time * 1000;
                      })
                      .catch(error => {
                        console.error(error);
                      });
                    });
                } else {
                    hold = linksTime;
                }
            }
            if (Date.now() > start + hold) {
                index = checkIndex(index, linksLength,1);
            }
            await wait(500);
        }
    }

    delayReader();

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