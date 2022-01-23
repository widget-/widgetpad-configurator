import * as React from 'react';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

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
  Download as DownloadIcon, Settings as SettingsIcon
} from "@mui/icons-material";
import { lightBlue, blueGrey } from "@mui/material/colors";

import {
  clearPadConfig,
  restoreBackupPadConfig,
  selectPadConfig,
  setPadConfig
} from './slices/padConfig';
import {
  clearPadValues,
  setPadValues
} from './slices/padValues';
import {
  addUiFrameTime,
  selectDarkMode,
  selectIsEditing,
  selectUiRxFps,
  selectUiTxFps,
  setIsEditing
} from './slices/appSettings';

import PanelsView from "./pages/PanelsView";
import SerialSelector from "./components/SerialSelector";
import getSerialConnection from './services/SerialConnection';
import Settings from './pages/Settings';

const serialConnection = getSerialConnection();

function App() {
  const dispatch = useDispatch();

  const [serialConnected, setSerialConnected] = useState(false);
  const [padConfigBackupState, setPadConfigBackupState] = useState({});

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const padConfig = useSelector(selectPadConfig);
  const isEditing = useSelector(selectIsEditing);
  const darkMode = useSelector(selectDarkMode);

  // useEffect(() => {
  //   let previousTime = Date.now();
  //   const timer = setInterval(async () => {
  //     const now = Date.now();
  //
  //     if (!serialConnection.isConnected()) return;
  //
  //     // await serialConnection.sendData({
  //     serialConnection.sendData({
  //       message: "requestValues"
  //     });
  //     const now2 = Date.now();
  //     console.info(`[serialtiming] Took ${ now2 - now } ms to request values`);
  //     console.info(`[serialtiming] ${ now2 - previousTime } since previous request`);
  //     previousTime = now2;
  //     dispatch(addUiFrameTime('tx'));
  //   }, Math.floor(1000 / framerate)); // 60fps
  //   console.info(`[serialtimer] setting up timer ${ timer }`);
  //
  //   return () => {
  //     console.info(`[serialtimer] clearing timer ${ timer }`);
  //     clearInterval(timer);
  //   };
  // }, [dispatch]);

  const serialDataHandler = useCallback((data) => {
    const message = data.message;
    const err = data.err;
    delete data.message;

    if (err) {
      console.error("Device error:", err);
      setSnackbarMessage("Device Error: " + err);
      setSnackbarOpen(true);
      return;
    }

    dispatch(addUiFrameTime('rx'));

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
      dispatch(addUiFrameTime('tx'));
    } else {
      console.log(message, data);
    }
  }, [dispatch]);

  const startSerialData = useCallback(async () => {
    await serialConnection.sendData({
      message: "requestConfig",
      pretty: false,
      minified: false
    });
  }, []);

  const MemoizedIconButton = useMemo(() => React.memo(IconButton), []);
  const MemoizedTooltip = useMemo(() => React.memo(Tooltip), []);

  const handleSerialConnectionStateChange = useCallback(() => {
    setSerialConnected(serialConnection.isConnected());
    if (serialConnection.isConnected()) {
      startSerialData();
    } else {
      dispatch(clearPadValues());
      dispatch(clearPadConfig());
    }
  }, [dispatch, startSerialData]);

  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? "dark" : 'light',
      primary: {
        main: lightBlue[500]
      },
      secondary: {
        main: blueGrey[500]
      }
    }
  }), [darkMode], createTheme);

  useEffect(() => {
    serialConnection.onConnectionStateChange(handleSerialConnectionStateChange);
    serialConnection.addSerialDataHandler(serialDataHandler);
    return () => {
      serialConnection.disconnect();
    };
  }, [handleSerialConnectionStateChange, serialDataHandler]);

  const uiRxFps = useSelector(selectUiRxFps);
  const uiTxFps = useSelector(selectUiTxFps);

  const handleSerialConnectButtonClick = useCallback(() => {
    serialConnection.connect(serialConnection.currentPort);
  }, []);

  const handleSerialDisconnectButtonClick = useCallback(() => {
    serialConnection.disconnect();
  }, []);

  const handleEditButtonClick = useCallback(() => {
    dispatch(setIsEditing(true));
    setPadConfigBackupState(padConfig);
  }, [dispatch, padConfig]);

  const handleCommitThresholdButtonClick = useCallback(async () => {
    dispatch(setIsEditing(false));
    await serialConnection.sendData({
      "message": "updateConfig",
      ...padConfig
    });
    dispatch(addUiFrameTime('tx'));
  }, [dispatch, padConfig]);

  const handleCancelThresholdButtonClick = useCallback(() => {
    dispatch(setIsEditing(false));
    dispatch(restoreBackupPadConfig(padConfigBackupState));
    setPadConfigBackupState({});
  }, [dispatch, padConfigBackupState]);

  const handleSaveToPadButtonClick = useCallback(async () => {
    await serialConnection.sendData({
      "message": "saveConfigRequest"
    });
    dispatch(addUiFrameTime('tx'));
  }, [dispatch]);
  const handleLoadFromPadButtonClick = useCallback(async () => {
    await serialConnection.sendData({
      "message": "loadConfigRequest"
    });
    dispatch(addUiFrameTime('tx'));
  }, [dispatch]);

  const handleSnackbarClose = useCallback(() => {
    setSnackbarOpen(false);
  }, []);


  return (
    <ThemeProvider theme={ theme }>
      <BrowserRouter>
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

        <Paper style={ {
          width: "100%",
          minHeight: "100vh",
          margin: 0,
          display: "flex",
          flex: 1,
          flexDirection: "column",
          alignContent: "stretch"
        } }>
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

              <MemoizedTooltip title="Save configuration to pad">
                <IconButton
                  size="large"
                  color="primary"
                  onClick={ handleSaveToPadButtonClick }>
                  <SaveIcon/>
                </IconButton>
              </MemoizedTooltip>

              <MemoizedTooltip title="Load configuration from pad">
                <IconButton
                  size="large"
                  onClick={ handleLoadFromPadButtonClick }>
                  <DownloadIcon/>
                </IconButton>
              </MemoizedTooltip>

              { isEditing ?
                <div>
                  <MemoizedIconButton
                    size="large"
                    color="error"
                    onClick={ handleCancelThresholdButtonClick }>
                    <CancelIcon/>
                  </MemoizedIconButton>
                  <MemoizedIconButton
                    size="large"
                    color="success"
                    onClick={ handleCommitThresholdButtonClick }>
                    <CheckIcon/>
                  </MemoizedIconButton>
                </div> :
                <MemoizedIconButton
                  size="large"
                  onClick={ handleEditButtonClick }>
                  <EditIcon/>
                </MemoizedIconButton>
              }

              <MemoizedIconButton
                size="large"
                color="inherit"
                disabled={ isEditing }
                component={ Link }
                to="settings"
              >
                <SettingsIcon/>
              </MemoizedIconButton>
            </Toolbar>
          </AppBar>
          <Card style={ { flex: 1 } }>
            <Routes>
              <Route path="/" element={ <PanelsView/> }/>
              <Route path="/settings" element={ <Settings/> }/>
            </Routes>
          </Card>
          <Card>
            <Typography>
              {
                `Serial FPS: ${ uiRxFps?.toFixed?.(1) } in / ${ uiTxFps?.toFixed?.(1) } out`
              }
            </Typography>
          </Card>
        </Paper>
      </BrowserRouter>
    </ThemeProvider>
  );
}


export default React.memo(App);
