const { ipcMain } = require("electron");
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');

/** @type {SerialPort} */
let serialConnection = null;
/** @type {?SerialPort.parsers.Readline} serialConnection */
let readlineParser = null;

function setupSerialHandler() {
  ipcMain.on("serial-list-request", async (event) => {
    try {
      const list = await SerialPort.list();
      event.sender.send('serial-list-response', list);
      console.log(list);
    } catch (err) {
      console.error(err);
      event.sender.send('serial-list-response', { err: err });
    }
  });

  let boundSerialEventListeners = [];

  ipcMain.on("serial-connect-request", async (event, arg) => {
      if (serialConnection?.isOpen) {
        try {
          console.log(`Closing existing port ${ serialConnection.path }`);
          serialConnection.close();
        } catch (err) {
          console.error('Couldn\'t close serial connection: ', err);
        }
      }

      serialConnection = new SerialPort(arg);
      try {
        await Promise.race([
          new Promise((resolve) => serialConnection.once('open', resolve)),
          new Promise((_, reject) => serialConnection.once('error', reject))
        ]);

        readlineParser = serialConnection.pipe(new Readline());

        const listener = (data) => {
          console.log("Received data", data);
          event.sender.send("serial-receive-data", data);
        };
        readlineParser.on("data", listener);
        boundSerialEventListeners.push({ eventType: 'data', listener: listener });

        event.sender.send('serial-connect-response', { response: "ok" });
      } catch (err) {
        console.error(err);
        event.sender.send('serial-connect-response', err);
      }
    }
  );

  ipcMain.on("serial-disconnect-request", async (event) => {
    if (serialConnection?.isOpen) {
      try {
        console.log(`Closing existing port ${ serialConnection.path }`);
        try {
          serialConnection.close();
        } catch (err) {
          console.error('Couldn\'t close serial connection: ', err);
        }

        for (const { eventType, listener } of boundSerialEventListeners) {
          readlineParser.off(eventType, listener);
        }
        boundSerialEventListeners = [];
        event.sender.send('serial-disconnect-response');
      } catch (err) {
        console.error('Couldn\'t close serial connection: ', err);
        event.sender.send('serial-disconnect-response', err);
      }
    }
  });

  ipcMain.on("serial-data-request", async (event, arg) => {
    if (serialConnection) {
      try {
        console.log('Sending data:', arg);
        const data = typeof arg === 'string' ? arg : JSON.stringify(arg);
        serialConnection.write(Buffer.from(data));
        event.sender.send('serial-data-response');
      } catch (err) {
        console.error('Couldn\'t send serial data: ', err);
        event.sender.send('serial-data-response', err);
      }
    }
  });
}

module.exports = setupSerialHandler;
