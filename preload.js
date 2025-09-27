const _require = typeof require !== "undefined" ? require : eval("require");
const { contextBridge, ipcRenderer, shell } = _require("electron");
const fs = _require("fs");
const os = _require("os");
const path = _require("path");
// Buffer is global in Node.js/Electron

contextBridge.exposeInMainWorld("electron", {
  exitApp: () => ipcRenderer.send("exitApp"),
  // Write file to disk (buffer)
  writeFile: (filePath, buffer) => {
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, globalThis.Buffer.from(buffer), (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },
  // Get Desktop path
  getDesktopPath: () => {
    return os.homedir() ? path.join(os.homedir(), "Desktop") : "";
  },
  // Open file (Excel)
  openFile: (filePath) => {
    shell.openPath(filePath);
  },
});

// Now you can use window.electron.exitApp() in your renderer process to send the exitApp message.
// You can also access ipcRenderer directly via window.ipcRenderer if needed.
// However, be cautious with exposing ipcRenderer directly as it can pose security risks.
// It's generally better to expose only the specific functions you need via contextBridge.
// For example, to listen for messages from the main process, you can do something like this:
