import * as React from 'react';

import Main from "./pages/Main";
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
  Settings as SettingsIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Clear as CancelIcon,
  Usb as UsbIcon,
  UsbOff as UsbOffIcon
} from "@mui/icons-material";
import { lightBlue, blueGrey } from "@mui/material/colors";
import SerialSelector from "./components/SerialSelector";
import SerialConnection from './services/SerialConnection';

const framerate = 1;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: false,
      serialConnected: false,
      padConfig: {},
      padValues: {}
    };

    this.timer = null;

    this.messagesReceived = 0;
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
        "main": lightBlue[500]
      },
      secondary: {
        "main": blueGrey[500]
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

  serialDataHandler = (data) => {
    console.log(++this.messagesReceived, data.message, data);

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
    this.setState({ editing: true });
  };

  handleCommitThresholdButtonClick = () => {
    this.setState({ editing: false });
  };

  handleCancelThresholdButtonClick = () => {
    const newState = { ...this.state, editing: false };
    this.state.padConfig.panels.forEach((_, panelIndex) => {
      this.state.padConfig.panels[panelIndex].sensors.forEach((_, sensorIndex) => {
        if (newState.padConfig.panels?.[panelIndex]?.sensors?.[sensorIndex]?.threshold) {
          newState.padConfig.panels[panelIndex].sensors[sensorIndex].threshold = newState.padValues.panels?.[panelIndex]?.sensors?.[0]?.threshold;
        }
      });
    });
    this.setState(newState);
  };

  onThresholdChange = (value, panelIndex, sensorIndex) => {
    const padConfig = { ...this.state.padConfig };
    padConfig.panels[panelIndex].sensors[sensorIndex].threshold = value;
    this.setState({
      padConfig: padConfig
    });
  };

  render() {
    return (
      <ThemeProvider theme={ App.theme }>
        <Paper style={ { width: "100%", minHeight: "100vh", margin: 0 } }>
          <AppBar position="sticky">
            <Toolbar>
              <SerialSelector serialConnection={ this.serialConnection }/>

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
              <IconButton
                size="large"
                color="inherit"
                disabled={ this.state.editing }>
                <SettingsIcon/>
              </IconButton>
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
        </Paper>
      </ThemeProvider>
    );
  }
}

export default App;
