import * as React from 'react';

import {
  ThemeProvider,
  createTheme,
  Paper,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Card,
  Tooltip
} from "@mui/material";
import {
  Edit as EditIcon,
  Check as CheckIcon,
  Clear as CancelIcon,
  Usb as UsbIcon,
  UsbOff as UsbOffIcon,
  Save as SaveIcon
} from "@mui/icons-material";
import { lightBlue, blueGrey } from "@mui/material/colors";
import update from 'immutability-helper';
import { Provider, useSelector } from 'react-redux';

import store from './actions/store';
import {
  selectPadConfig, selectPadName,
  setPadConfig,
  setPadThreshold,
  updatePadConfigFromSettings
} from './actions/padConfig';

import Main from "./pages/Main";
import SerialSelector from "./components/SerialSelector";
import SerialConnection from './services/SerialConnection';
import Settings from './pages/Settings';

const framerate = 60;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: false,
      modified: false,
      serialConnected: false,
      padConfig: {},
      padValues: {},
      padConfigBackupState: {},
      uiFrameTimes: [],
      uiFps: 0
    };

    this.timer = null;

    this.serialConnection = new SerialConnection();
  }

  componentDidMount = () => {
    console.log("Component mounted");
    this.serialConnection.onConnectionStateChange(this.handleSerialConnectionStateChange);
    this.serialConnection.addSerialDataHandler((data) => this.serialDataHandler(data));
  };

  static theme = createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: lightBlue[500]
      },
      secondary: {
        main: blueGrey[500]
      }
    }
  });

  handleSerialConnectionStateChange = async () => {
    this.setState({
      serialConnected: this.serialConnection.isConnected()
    });
    if (this.serialConnection.isConnected()) {
      await this.serialConnection.sendData({ "message": "requestConfig", "minified": true });
      this.startSerialData();
    } else {
      if (this.timer) {
        clearInterval(this.timer);
      }
      this.setState({
        padValues: {},
        padConfig: {}
      });
    }
  };

  updateUiFps = () => {
    const measurementPeriod = 2000;
    const now = Date.now();
    const uiFrameTimes = this.state.uiFrameTimes.filter((time) => (time > now - measurementPeriod));
    uiFrameTimes.push(Date.now());
    const fps = 1000 * uiFrameTimes.length / measurementPeriod;
    this.setState({ uiFrameTimes, fps });
  };

  serialDataHandler = (data) => {
    const message = data.message;
    delete data.message;

    if (message === "responseValues") {
      this.setState({
        padValues: {
          panels: data.panels,
          buttons: data.buttons
        }
      });
    }

    if (message === "responseConfig") {
      this.setState({
        padConfig: data
      });
    }

    this.updateUiFps();
  };

  startSerialData = async () => {
    if (this.timer) {
      clearInterval(this.timer);
    }
    await this.serialConnection.sendData({
      message: "requestConfig",
      pretty: false,
      minified: false
    });
    this.timer = setInterval(() => this.serialConnection.sendData({
      message: "requestValues",
      pretty: false,
      minified: false
    }), Math.floor(1000 / framerate)); // 60fps
  };

  handleSerialConnectButtonClick = () => {
    this.serialConnection.connect();
  };

  handleSerialDisconnectButtonClick = () => {
    this.serialConnection.disconnect();
  };

  handleEditButtonClick = () => {
    this.setState({
      editing: true,
      padConfigBackupState: this.state.padConfig
    });
  };

  handleCommitThresholdButtonClick = async () => {
    this.setState({ editing: false });
    await this.serialConnection.sendData({
      "message": "updateConfig",
      ...this.state.padConfig
    });
  };

  handleCancelThresholdButtonClick = () => {
    this.setState({
      editing: false,
      padConfig: { ...this.state.padConfigBackupState },
      padConfigBackupState: {}
    });
  };

  handleSaveToPadButtonClick = () => {
    return;
  };

  onThresholdChange = (value, panelIndex, sensorIndex) => {
    const padConfig = update(this.state.padConfig, {
      panels: {
        [panelIndex]: {
          sensors: {
            [sensorIndex]: {
              threshold: { $set: value }
            }
          }
        }
      }
    });
    this.setState({
      padConfig: padConfig
    });
  };

  onSettingsChange = (formSettings) => {
    const padConfig = { ...this.state.padConfig };

    padConfig.general = padConfig.general ?? {};
    padConfig.general.name = formSettings.name;
    padConfig.panels = [...formSettings.panels];
    padConfig.buttons = [...formSettings.buttons];

    this.setState({ padConfig });
  };

  render() {
    const padName = useSelector(selectPadName);

    return (
      <Provider store={ store }>
        <ThemeProvider theme={ App.theme }>
          <Paper style={ { width: "100%", minHeight: "100vh", margin: 0 } }>
            <AppBar position="sticky">
              <Toolbar>
                <SerialSelector
                  serialConnection={ this.serialConnection }
                  padName={ padName }
                />

                { this.state.serialConnected ?
                  <Tooltip title="Disconnect">
                    <IconButton
                      size="large"
                      color="error"
                      onClick={ this.handleSerialDisconnectButtonClick }>
                      <UsbOffIcon/>
                    </IconButton>
                  </Tooltip>
                  :
                  <Tooltip title="Connect">
                    <IconButton
                      size="large"
                      color="primary"
                      onClick={ this.handleSerialConnectButtonClick }>
                      <UsbIcon/>
                    </IconButton>
                  </Tooltip>
                }

                {/*using this as a spacer for now*/ }
                <Typography sx={ { flex: 1 } }/>

                <Tooltip title="Save configuration to pad">
                  <IconButton
                    size="large"
                    color="primary"
                    onClick={ this.handleSaveToPadButtonClick }>
                    <SaveIcon/>
                  </IconButton>
                </Tooltip>

                { this.state.editing ?
                  <div>
                    <IconButton
                      size="large"
                      color="error"
                      onClick={ this.handleCancelThresholdButtonClick }>
                      <CancelIcon/>
                    </IconButton>
                    <IconButton
                      size="large"
                      color="success"
                      onClick={ this.handleCommitThresholdButtonClick }>
                      <CheckIcon/>
                    </IconButton>
                  </div> :
                  <IconButton
                    size="large"
                    onClick={ this.handleEditButtonClick }>
                    <EditIcon/>
                  </IconButton> }

                <Settings
                  padConfig={ this.state.padConfig }
                  onChange={ this.onSettingsChange }
                />
              </Toolbar>
            </AppBar>
            <Card>
              <Main
                editing={ this.state.editing }
                padConfig={ this.state.padConfig }
                padValues={ this.state.padValues }
                onThresholdChange={ (value, panelIndex, senorIndex) =>
                  this.onThresholdChange(value, panelIndex, senorIndex) }/>
            </Card>
            <Card>
              <Typography>
                {
                  `Serial FPS: ${ this.state.fps?.toFixed?.(1) }`
                }
              </Typography>
            </Card>
          </Paper>
        </ThemeProvider>
      </Provider>
    );
  }
}

export default App;
