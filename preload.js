const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  exitApp: () => ipcRenderer.send("exitApp"),
});

// Now you can use window.electron.exitApp() in your renderer process to send the exitApp message.
// You can also access ipcRenderer directly via window.ipcRenderer if needed.
// However, be cautious with exposing ipcRenderer directly as it can pose security risks.
// It's generally better to expose only the specific functions you need via contextBridge.
// For example, to listen for messages from the main process, you can do something like this:
