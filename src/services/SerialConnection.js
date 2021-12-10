import typeof SerialPort from 'serialport';

let serialConnection = null;

class SerialConnection {
  /** @type string */
  currentPort = null;
  /** @type string[] */
  availablePorts = [];

  connected: false;
  onConnectionStateChangeCallback: () => {};

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
    this.currentPort = port;
    await this.connect();
  }

  async disconnect() {
    console.log('Closing previous Serial connection');
    await window.ipc_serial.closeSerialConnection();
    this.connected = false;
    this.onConnectionStateChangeCallback();
  }

  async connect() {
    if (this.connected) {
      await this.disconnect();
    }
    console.log(`Connecting to Serial port ${ this.currentPort }`);
    const result = await window.ipc_serial.openSerialConnection(this.currentPort);
    if (result.response === 'ok') {
      console.log('Connected');
      this.connected = true;
      this.onConnectionStateChangeCallback();
    } else {
      console.error('Error when connecting');
      console.error(result);
    }
  }

  isConnected() {
    return this.connected;
  }

  onConnectionStateChange(callback) {
    this.onConnectionStateChangeCallback = callback;
  }

  async sendData(data) {
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
}

function getSerialConnection() {
  if (!serialConnection) {
    serialConnection = new SerialConnection();
  }
  return serialConnection;
}

export default getSerialConnection;
