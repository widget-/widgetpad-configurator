const { contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('ipc_serial', {
  listSerialPorts: async function() {
    const ipcSendReq = new Promise((resolve) =>
      ipcRenderer.once('serial-list-response', resolve));
    ipcRenderer.send('serial-list-request');
    return ipcSendReq;
  },

  openSerialConnection: async function(port) {
    const ipcSendReq = new Promise((resolve) =>
      ipcRenderer.once('serial-connect-response', resolve));
    ipcRenderer.send('serial-connect', port);
    return ipcSendReq;
  },

  sendSerialData: async function(data) {
    if (typeof data === 'object') {
      data = JSON.stringify(data);
    }

    const ipcSendReq = new Promise((resolve) =>
      ipcRenderer.once('serial-data-response', resolve));
    ipcRenderer.send('serial-data-request', data);
    return ipcSendReq;
  }

})
