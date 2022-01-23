import typeof SerialPort from 'serialport';

const framerate = 60;

let serialConnection = null;

class SerialConnection {
  /** @type ?string */
  currentPort = null;
  /** @type string[] */
  availablePorts = [];

  connected: false;
  onConnectionStateChangeCallback: () => {};

  constructor() {
    const requestValues = () => {
      if (!this.connected)
        return;
      this.sendData({
        message: "requestValues"
      });
    };
    setInterval(requestValues, 1000 / framerate);
  }

  async listPorts(): Promise<SerialPort.PortInfo[]> {
    try {
      this.availablePorts = await window.ipc_serial.listSerialPorts() ?? [];
    } catch (err) {
      console.error(err);
      this.availablePorts = [];
    }
    return this.availablePorts;
  }

  /** @param {string} port */
  async setPort(port) {
    console.log(`Serial port set to ${ port }`);
    await this.connect(port);
  }

  async disconnect() {
    console.log('Closing previous Serial connection');
    await window.ipc_serial.closeSerialConnection();
    this.connected = false;
    this.onConnectionStateChangeCallback();
  }

  unexpectedDisconnect() {
    this.onConnectionStateChangeCallback({ unexpected: true });
  }

  /** @param {string} port */
  async connect(port) {
    if (this.connected) {
      await this.disconnect();
    }
    console.log(`Connecting to Serial port ${ port }`);
    const result = await window.ipc_serial.openSerialConnection(port);
    if (result.response === 'ok') {
      console.log('Connected');
      this.connected = true;
      this.currentPort = port;
      this.onConnectionStateChangeCallback();
    } else {
      console.error('Error when connecting');
      console.error(result);
      throw new Error(`Error when connecting to serialPort: ${ result }`);
    }
  }

  isConnected() {
    return this.connected;
  }

  onConnectionStateChange(callback) {
    this.onConnectionStateChangeCallback = callback;
  }

  async sendData(data) {
    // console.log('[serialdata] sending', data);
    await window.ipc_serial.sendSerialData(JSON.stringify(data));
  }

  addSerialDataHandler(handler) {
    window.ipc_serial.setupSerialResponseHandler((data) => {
      // convert to object if possible
      try {
        let o = JSON.parse(data);
        handler(o);
      } catch {
        handler(data);
      }
    });
  }

  addSerialUnexpectedDisconnectHandler(handler) {
    window.ipc_serial.setupSerialUnexpectedDisconnectHandler((data) => {
      // convert to object if possible
      try {
        let o = JSON.parse(data);
        handler(o);
      } catch {
        handler(data);
      }
    });
  }
}

function getSerialConnection() {
  if (!serialConnection) {
    serialConnection = new SerialConnection();
  }
  return serialConnection;
}

export default getSerialConnection;
