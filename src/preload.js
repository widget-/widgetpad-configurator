const { contextBridge, ipcRenderer } = require('electron');

/**
 * @typedef SerialData
 * @property {string} message
 */

contextBridge.exposeInMainWorld('ipc_serial', {
  /** @returns Promise<SerialPort.PortInfo[]> */
  listSerialPorts: async function () {
    const ipcSendReq = new Promise((resolve) =>
      ipcRenderer.once('serial-list-response', (_, args) => resolve(args)));
    ipcRenderer.send('serial-list-request');
    return ipcSendReq;
  },

  /**
   * @param {string} port
   * @return {Promise<object>}
   */
  openSerialConnection: async function (port) {
    const ipcSendReq = new Promise((resolve) =>
      ipcRenderer.once('serial-connect-response', (_, args) => resolve(args)));
    ipcRenderer.send('serial-connect-request', port);
    return ipcSendReq;
  },

  /**
   * @return {Promise<void>}
   */
  closeSerialConnection: async function () {
    const ipcSendReq = new Promise((resolve) =>
      ipcRenderer.once('serial-disconnect-response', (_, args) => resolve(args)));
    ipcRenderer.send('serial-disconnect-request');
    return ipcSendReq;
  },

  /**
   * @param {SerialData} data
   * @return {Promise<object>}
   */
  sendSerialData: async function (data) {
    if (typeof data === 'object') {
      data = JSON.stringify(data);
    }

    const ipcSendReq = new Promise((resolve) =>
      ipcRenderer.once('serial-data-response', (_, args) => resolve(args)));
    ipcRenderer.send('serial-data-request', data);
    return ipcSendReq;
  },

  /** @param {(SerialData) => void} handler */
  setupSerialResponseHandler: function (handler) {
    ipcRenderer.on('serial-receive-data', handler);
  }

});
