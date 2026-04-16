// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const path = require('node:path')
const {ipcMain} = require('electron')
const {spawn} = require('child_process')

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


// List to keep check of what remotes are currently SSH:d into
const sshdRemotes = {};

// Function to run commands on remote and then pipe through the return which we send through preload and finally display using renderer.js
// Handles each remote separately by using their remoteId
ipcMain.on('execute-command', (event, {remoteId, commandString}) => {

  const commandStringSet = String(commandString);

  // Needed for ssh into the remote to work
  if (commandStringSet.startsWith('ssh-init')) {
    const target = commandStringSet.split(' ')[1];

    const child = spawn('ssh', ['-tt', '-o', 'StrictHostKeyChecking=no', target]);
    sshdRemotes[remoteId] = child;

    event.reply('ssh-status', {remoteId, active: true});

    child.stdout.on('data', (data) => event.reply(`terminal-output-${remoteId}`, data.toString()));
    child.stderr.on('data', (data) => event.reply(`terminal-output-${remoteId}`, data.toString()));

    child.on('close', (code) => {
      delete sshdRemotes[remoteId];
      event.reply('ssh-status', {remoteId, active: false});
      event.reply(`terminal-output-${remoteId}`, `\nSSH Session Closed with ${code}`);
    });
    return;
  }

  // If active ssh'd into that remote command is ran in that ssh instead of on local pc
  if (sshdRemotes[remoteId]){
    sshdRemotes[remoteId].stdin.write(commandStringSet + '\n');
    return;
  }


  // Usage of spawn somewhat requires breaking up commandstring for user to make it more user friendly for them
  const parts = commandStringSet.trim().split(/\s+/);
  // The command
  const cmd = parts [0];
  // The argument
  const args = parts.slice(1);

  // Runs the command on remote
  const child = spawn(cmd, args);

  // Data handling
  // By using spawn this data will be sent as a stream instead of dumped at once,
  // this allows us to handle larger data amounts such as logs without risking crashes
  child.stdout.on('data', (data) =>{
    event.reply(`terminal-output-${remoteId}`, data.toString());
  });

  // Streams potential errors with commands
  // Useful for debugging etc.
  child.stderr.on('data', (data) => {
    event.reply(`terminal-output-${remoteId}`, `ERROR: ${data.toString()}`);
  });

  // Handles end of command running/streaming
  child.on('close', (code) => {
    event.reply(`terminal-output-${remoteId}`, `\n[Process finished with code ${code}]\n`);
  });

  // Handles critical errors for system
  child.on('error', (err) => {
    event.reply(`terminal-output-${remoteId}`, `ERROR: ${err.message}`)
  })


})
