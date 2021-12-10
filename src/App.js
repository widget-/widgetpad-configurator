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
  Tooltip, Snackbar
} from "@mui/material";
import {
  Edit as EditIcon,
  Check as CheckIcon,
  Clear as CancelIcon,
  Usb as UsbIcon,
  UsbOff as UsbOffIcon,
  Save as SaveIcon,
  Download as DownloadIcon
} from "@mui/icons-material";
import { lightBlue, blueGrey } from "@mui/material/colors";

import {
  clearPadConfig,
  restoreBackupPadConfig,
  selectPadConfig,
  setPadConfig,
  updatePadConfigFromSettings
} from './slices/padConfig';
import {
  clearPadValues,
  selectPadValues,
  setPadValues
} from './slices/padValues';
import {
  selectDarkMode,
  selectIsEditing,
  setIsEditing
} from './slices/appSettings';

import Main from "./pages/Main";
import SerialSelector from "./components/SerialSelector";
import getSerialConnection from './services/SerialConnection';
import Settings from './pages/Settings';

const serialConnection = getSerialConnection();

function App() {
  const dispatch = useDispatch();

  const framerate = 60;

  const [serialConnected, setSerialConnected] = useState(false);
  const [padConfigBackupState, setPadConfigBackupState] = useState({});
  const [uiFrameTimes, setUiFrameTimes] = useState([]);
  const [uiFps, setUiFps] = useState(0);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const padConfig = useSelector(selectPadConfig);
  const isEditing = useSelector(selectIsEditing);
  const darkMode = useSelector(selectDarkMode);

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
    const err = data.err;
    delete data.message;

    if (err) {
      console.error("Device error:", err);
      setSnackbarMessage("Device Error: " + err);
      setSnackbarOpen(true);
      return;
    }

    if (message === "responseValues") {
      dispatch(setPadValues({
        panels: data.panels,
        buttons: data.buttons
      }));
    } else if (message === "responseConfig") {
      dispatch(setPadConfig(data));
    } else if (message === "loadConfigResponse") {
      console.log("loadConfigResponse", data);
      serialConnection.sendData({
        message: "requestConfig",
        pretty: false,
        minified: false
      });
    } else {
      console.log(message, data);
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
      mode: darkMode ? "dark" : 'light',
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
    dispatch(setIsEditing(true));
    setPadConfigBackupState(padConfig);
  };

  const handleCommitThresholdButtonClick = async () => {
    dispatch(setIsEditing(false));
    await serialConnection.sendData({
      "message": "updateConfig",
      ...padConfig
    });
  };

  const handleCancelThresholdButtonClick = () => {
    dispatch(setIsEditing(false));
    dispatch(restoreBackupPadConfig(padConfigBackupState));
    setPadConfigBackupState({});
  };

  const handleSaveToPadButtonClick = async () => {
    await serialConnection.sendData({
      "message": "saveConfigRequest"
    });
  };
  const handleLoadFromPadButtonClick = async () => {
    await serialConnection.sendData({
      "message": "loadConfigRequest"
    });
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const onSettingsChange = (formSettings) => {
    dispatch(updatePadConfigFromSettings(formSettings));
  };

  const openSettings = () => {

  };

  const handleAppSettingsClick = () => {
    
  };

  return (
    <ThemeProvider theme={ theme }>
      <Snackbar
        open={ snackbarOpen }
        autoHideDuration={ 3000 }
        message={ snackbarMessage }
        onClose={ handleSnackbarClose }
        action={ <React.Fragment>
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={ handleSnackbarClose }
          >
            <CancelIcon fontSize="small"/>
          </IconButton>
        </React.Fragment> }
      />

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

            <Tooltip title="Load configuration from pad">
              <IconButton
                size="large"
                onClick={ handleLoadFromPadButtonClick }>
                <DownloadIcon/>
              </IconButton>
            </Tooltip>

            { isEditing ?
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
              disabled={ isEditing }
            />
          </Toolbar>
        </AppBar>
        <Card>
          <Main/>
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
