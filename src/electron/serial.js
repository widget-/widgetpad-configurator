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

  ipcMain.on("serial-connect-request", async (event, port) => {
      if (serialConnection?.isOpen) {
        try {
          console.log(`Closing existing port ${ serialConnection.path }`);
          serialConnection.close();
        } catch (err) {
          console.error('Couldn\'t close serial connection: ', err);
        }
      }

      try {
        serialConnection = new SerialPort(port, { baudRate: 75 });
        await Promise.race([
          new Promise((resolve) => serialConnection.once('open', resolve)),
          new Promise((_, reject) => serialConnection.once('error', reject))
        ]);

        // console.log(`Baud rate is ${ serialConnection. }`);

        readlineParser = serialConnection.pipe(new Readline());

        const dataListener = (data) => {
          // console.log("Received data", data);
          event.sender.send("serial-receive-data", data);
        };
        readlineParser.on("data", dataListener);
        boundSerialEventListeners.push({ eventType: 'data', listener: dataListener });

        readlineParser.on("close", () => event.sender.send("serial-unexpected-close"));

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
        for (const { eventType, listener } of boundSerialEventListeners) {
          readlineParser.off(eventType, listener);
        }

        boundSerialEventListeners = [];
        console.log(`Closing existing port ${ serialConnection.path }`);
        try {
          serialConnection.close();
        } catch (err) {
          console.error('Couldn\'t close serial connection: ', err);
        }

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
        // console.log('Sending data:', arg);
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
