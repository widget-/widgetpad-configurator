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

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: false,
      serialConnected: false
    };

    this.timer = null;

    this.serialConnection = new SerialConnection();
    this.serialConnection.onConnectionStateChange(() => this.setState({
      serialConnected: this.serialConnection.connected
    }));
    this.serialConnection.addSerialDataHandler(this.serialDataHandler);
  }

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

  serialDataHandler = (data) => {
    console.log(data);
  };

  startSerialData = () => {
    // this.timer = setInterval()
    // this.serialConnection.
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

  handleSaveButtonClick = () => {
    this.setState({ editing: false });
  };

  handleCancelButtonClick = () => {
    this.setState({ editing: false });
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

              <Typography sx={ { flex: 1 } }/> {/*using it as a spacer for now*/ }

              { this.state.editing ?
                <div>
                  <IconButton
                    size="large"
                    color="error"
                    onClick={ this.handleCancelButtonClick }>
                    <CancelIcon/>
                  </IconButton>
                  <IconButton
                    size="large"
                    color="success"
                    onClick={ this.handleSaveButtonClick }>
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
            <Main editing={ this.state.editing }/>
          </Card>
        </Paper>
      </ThemeProvider>
    );
  }
}

export default App;
