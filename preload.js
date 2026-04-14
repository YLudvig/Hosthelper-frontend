/**
 * The preload script runs before `index.html` is loaded
 * in the renderer. It has access to web APIs as well as
 * Electron's renderer process modules and some polyfilled
 * Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */
const { contextBridge, ipcRenderer } = require('electron');


window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})


// Acts as messenger between the frontend handler renderer.js and the highly secure main.js
// Command goes: renderer.js -> preload.js -> main.js where it is ran
// Output goes: main.js -> preload.js -> renderer.js where it is displayed for user
contextBridge.exposeInMainWorld('api', {
  sendCommand: (remoteId, commandString) => {
    ipcRenderer.send('execute-command', {remoteId, commandString});
  },

  onTerminalOutput: (remoteId, callback) => {
    const channel = `terminal-output-${remoteId}`;

    ipcRenderer.removeAllListeners(channel);

    ipcRenderer.on(channel, (event,data) => callback(data));
  }
})