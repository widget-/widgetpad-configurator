import * as React from 'react';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

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

import {
  clearPadConfig,
  restoreBackupPadConfig,
  selectPadConfig,
  setPadConfig,
  updatePadConfigFromSettings
} from './actions/padConfig';
import {
  clearPadValues,
  selectPadValues,
  setPadValues
} from './actions/padValues';

import Main from "./pages/Main";
import SerialSelector from "./components/SerialSelector";
import SerialConnection from './services/SerialConnection';
import Settings from './pages/Settings';

const serialConnection = new SerialConnection();

function App(props) {
  const dispatch = useDispatch();

  const framerate = 60;

  const [editing, setEditing] = useState(false);
  const [serialConnected, setSerialConnected] = useState(false);
  const [padConfigBackupState, setPadConfigBackupState] = useState({});
  const [uiFrameTimes, setUiFrameTimes] = useState([]);
  const [uiFps, setUiFps] = useState(0);

  const padConfig = useSelector(selectPadConfig);

  let timer = null;

  useEffect(() => {
    serialConnection.onConnectionStateChange(handleSerialConnectionStateChange);
    serialConnection.addSerialDataHandler(serialDataHandler);
    return () => {
      serialConnection.disconnect();
    };
  }, []);

  const serialDataHandler = (data) => {
    const message = data.message;
    delete data.message;
    if (message === "responseValues") {
      dispatch(setPadValues({
        panels: data.panels,
        buttons: data.buttons
      }));
    }
    if (message === "responseConfig") {
      dispatch(setPadConfig(data));
    }
  };

  const handleSerialConnectionStateChange = () => {

    setSerialConnected(serialConnection.isConnected());
    if (serialConnection.isConnected()) {
      startSerialData();
    } else {
      if (timer) {
        clearInterval(timer);
      }
      dispatch(clearPadValues());
      dispatch(clearPadConfig());
    }
  };

  const theme = createTheme({
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


  const measurementPeriod = 2000;
  const padValues = useSelector(selectPadValues);
  useEffect(() => {
    const now = Date.now();
    const _uiFrameTimes = [...uiFrameTimes].filter((time) => (time > now - measurementPeriod));
    _uiFrameTimes.push(Date.now());
    setUiFrameTimes(_uiFrameTimes);
  }, [padValues]);
  useEffect(() => {
    setUiFps(1000 * uiFrameTimes.length / measurementPeriod);
  }, [uiFrameTimes]);

  const startSerialData = async () => {
    if (timer) {
      clearInterval(timer);
    }
    await serialConnection.sendData({
      message: "requestConfig",
      pretty: false,
      minified: false
    });
    timer = setInterval(() => serialConnection.sendData({
      message: "requestValues",
      pretty: false,
      minified: false
    }), Math.floor(1000 / framerate)); // 60fps
  };


  const handleSerialConnectButtonClick = () => {
    serialConnection.connect();
  };

  const handleSerialDisconnectButtonClick = () => {
    serialConnection.disconnect();
  };

  const handleEditButtonClick = () => {
    setEditing(true);
    setPadConfigBackupState(padConfig);
  };

  const handleCommitThresholdButtonClick = async () => {
    setEditing(false);
    await serialConnection.sendData({
      "message": "updateConfig",
      ...padConfig
    });
  };

  const handleCancelThresholdButtonClick = () => {
    setEditing(false);
    dispatch(restoreBackupPadConfig(padConfigBackupState));
    setPadConfigBackupState({});
  };

  const handleSaveToPadButtonClick = () => {
    return;
  };

  const onSettingsChange = (formSettings) => {
    dispatch(updatePadConfigFromSettings(formSettings));
  };

  return (
    <ThemeProvider theme={ theme }>
      <Paper style={ { width: "100%", minHeight: "100vh", margin: 0 } }>
        <AppBar position="sticky">
          <Toolbar>
            <SerialSelector
              serialConnection={ serialConnection }
            />

            { serialConnected ?
              <Tooltip title="Disconnect">
                <IconButton
                  size="large"
                  color="error"
                  onClick={ handleSerialDisconnectButtonClick }>
                  <UsbOffIcon/>
                </IconButton>
              </Tooltip>
              :
              <Tooltip title="Connect">
                <IconButton
                  size="large"
                  color="primary"
                  onClick={ handleSerialConnectButtonClick }>
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
                onClick={ handleSaveToPadButtonClick }>
                <SaveIcon/>
              </IconButton>
            </Tooltip>

            { editing ?
              <div>
                <IconButton
                  size="large"
                  color="error"
                  onClick={ handleCancelThresholdButtonClick }>
                  <CancelIcon/>
                </IconButton>
                <IconButton
                  size="large"
                  color="success"
                  onClick={ handleCommitThresholdButtonClick }>
                  <CheckIcon/>
                </IconButton>
              </div> :
              <IconButton
                size="large"
                onClick={ handleEditButtonClick }>
                <EditIcon/>
              </IconButton> }

            <Settings
              padConfig={ padConfig }
              onChange={ onSettingsChange }
            />
          </Toolbar>
        </AppBar>
        <Card>
          <Main
            editing={ editing }
          />
        </Card>
        <Card>
          <Typography>
            {
              `Serial FPS: ${ uiFps?.toFixed?.(1) }`
            }
          </Typography>
        </Card>
      </Paper>
    </ThemeProvider>
  );
}


export default App;
