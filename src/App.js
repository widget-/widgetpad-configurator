import * as React from 'react';

import Main from "./pages/Main";
import {
  // Tab,
  // Box,
  ThemeProvider,
  createTheme,
  Paper,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  // Container,
  Card
} from "@mui/material";
import {Settings as SettingsIcon, Edit as EditIcon, Save as SaveIcon, Clear as CancelIcon} from "@mui/icons-material";
import {lightBlue, blueGrey} from "@mui/material/colors";
import SerialSelector from "./components/SerialSelector";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: false
    }
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

  handleEditButtonClick = () => {
    this.setState({editing: true});
  }

  handleSaveButtonClick = () => {
    this.setState({editing: false});
  }

  handleCancelButtonClick = () => {
    this.setState({editing: false});
  }

  render() {
    return (
      <ThemeProvider theme={ App.theme }>
        <Paper style={ {width: "100%", minHeight: "100vh", margin: 0} }>
          <AppBar position="sticky">
            <Toolbar>
              {/*<Typography variant="h6" component="div" sx={ {flex: 1} }>*/}
              {/*  Pad name goes here*/}
              {/*</Typography>*/}

              <SerialSelector/>

              <Typography sx={ {flex: 1} }/> {/*using it as a spacer for now*/}

              { this.state.editing ?
                <div>
                  <IconButton
                    size="large"
                    onClick={ this.handleCancelButtonClick }>
                    <CancelIcon/>
                  </IconButton>
                  <IconButton
                    size="large"
                    onClick={ this.handleSaveButtonClick }>
                    <SaveIcon/>
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
