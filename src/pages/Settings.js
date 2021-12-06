/**
 * We use a modal popup to try and signify to the user that the settings they're
 * configuring are specific to the pad being shown. App-wide settings instead
 * open in a full page.
 */

import * as React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle, FormControlLabel, FormGroup,
  IconButton,
  InputAdornment,
  MenuItem, Switch,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import {
  Settings as SettingsIcon,
  HelpOutline as HelpIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

import MicrocontrollerPinSelect from '../components/MicrocontrollerPinSelect';

function _deepCopy(o) {
  return o && JSON.parse(JSON.stringify(o));
}

class Settings extends React.Component {
  static defaultProps = {
    padConfig: {},
    onChange: null
  };

  constructor(props) {
    super(props);

    this.state = {
      open: false,
      formSettings: {
        name: '',
        panelCount: 0,
        sensorCount: 0,
        buttonCount: 0,
        panelThresholdLiftGap: 0,
        panels: [],
        buttons: [],
        invertedDigitalButtonLogic: false
      }
    };
  }

  handleSettingsIconClick = () => {
    this.setState({
      open: true,
      formSettings: {
        name: this.props.padConfig.general?.name,
        panelCount: this.props.padConfig.panels?.length,
        sensorCount: this.props.padConfig.panels?.[0]?.sensors?.length,
        buttonCount: this.props.padConfig.buttons?.length,
        panelThresholdLiftGap: this.props.padConfig.general?.panelThresholdLiftGap,
        panels: this.props.padConfig.panels,
        buttons: this.props.padConfig.buttons,
        invertedDigitalButtonLogic: this.props.padConfig.general?.invertedDigitalButtonLogic
      }
    });
  };

  handleSaveButtonClick = () => {
    this.setState({
      open: false
    });
    this.props.onChange?.(this.state.formSettings);
  };

  handleCancelButtonClick = () => {
    this.setState({
      open: false
    });
  };

  /**
   * When the user changes the number of panels, try and keep any settings that were
   * already configured.
   *
   * In order, we try:
   *   * The settings made in the form
   *   * The settings inherited from what the pad told us originally
   *   * An empty default configuration
   *
   * @param {int} panelCount
   * @param {int} sensorCount
   * @return {PanelConfig[]}
   */
  generateUpdatedPanels = (panelCount, sensorCount) => {
    const panels = [];

    for (let panelIndex = 0; panelIndex < panelCount; panelIndex++) {
      if (this.state.formSettings.panels[panelIndex]) {
        panels.push(_deepCopy(this.state.formSettings.panels[panelIndex]));
      } else if (this.props.padConfig.panels[panelIndex]) {
        panels.push(_deepCopy(this.props.padConfig.panels[panelIndex]));
      } else {
        panels.push({
          gamepadButton: 1,
          ledOrder: 3,
          statusLedPin: 20,
          stepOrder: 3,
          sensors: []
        });
      }
    }

    for (let panelIndex = 0; panelIndex < panelCount; panelIndex++) {
      panels[panelIndex].sensors = [];
      for (let sensorIndex = 0; sensorIndex < sensorCount; sensorIndex++) {
        if (this.state.formSettings.panels[panelIndex]?.sensors?.[sensorIndex]) {
          panels[panelIndex].sensors.push(_deepCopy(this.state.formSettings.panels[panelIndex].sensors[sensorIndex]));
        } else if (this.props.padConfig.panels[panelIndex]?.sensors?.[sensorIndex]) {
          panels[panelIndex].sensors.push(_deepCopy(this.props.padConfig.panels[panelIndex].sensors[sensorIndex]));
        } else {
          panels[panelIndex].sensors.push({
            threshold: 30,
            teensyPin: MicrocontrollerPinSelect.pins[this.props.padConfig.general.controller].analog[0].value
          });
        }
      }
    }
    
    return panels;
  };

  /**
   * Similar thing but for buttons
   * @param {int} buttonCount
   * @return {[]}
   */
  generateUpdatedButtons = (buttonCount) => {
    const buttons = [];

    for (let buttonIndex = 0; buttonIndex < buttonCount; buttonIndex++) {
      if (this.state.formSettings.buttons[buttonIndex]) {
        buttons.push(_deepCopy(this.state.formSettings.buttons[buttonIndex]));
      } else if (this.props.padConfig.buttons[buttonIndex]) {
        buttons.push(_deepCopy(this.props.padConfig.buttons[buttonIndex]));
      } else {
        buttons.push({
          gamepadButton: 0,
          teensyPin: 0
        });
      }
    }
    return buttons;
  };

  handleFormValueUpdate = ($event, padIndex, sensorIndex) => {
    const state = {
      ...this.state
    };

    if ($event.target?.name === 'name') {
      state.formSettings.name = $event.target.value;
    } else if ($event.target?.name === 'panelCount') {
      if (state.formSettings.panelCount !== $event.target.value) {
        state.formSettings.panelCount = $event.target.value;

        state.formSettings.panels = this.generateUpdatedPanels(
          state.formSettings.panelCount,
          state.formSettings.sensorCount
        );
      }
    } else if ($event.target?.name === 'sensorCount') {
      if (state.formSettings.sensorCount !== $event.target.value) {
        state.formSettings.sensorCount = $event.target.value;

        state.formSettings.panels = this.generateUpdatedPanels(
          state.formSettings.panelCount,
          state.formSettings.sensorCount
        );
      }
    } else if ($event.target?.name === 'buttonCount') {
      if (state.formSettings.buttonCount !== $event.target.value) {
        state.formSettings.buttonCount = $event.target.value;

        state.formSettings.buttons = this.generateUpdatedButtons(
          state.formSettings.buttonCount
        );
      }
    } else if ($event.target?.name === 'panelThresholdLiftGap') {
      state.formSettings.panelThresholdLiftGap = $event.target.value;
    } else if ($event.target?.name === 'gamepadButton') {
      state.formSettings.panels[padIndex].gamepadButton = $event.target.value;
    } else if ($event.target?.name === 'sensorPinSelect') {
      state.formSettings.panels[padIndex].sensors[sensorIndex].teensyPin = $event.target.value;
    } else if ($event.target?.name === 'invertedDigitalButtonLogic') {
      state.formSettings.invertedDigitalButtonLogic = $event.target.checked;
    }

    this.setState(state);
  };

  componentDidMount = () => {
    this.generateUpdatedPanels(this.state.panelCount, this.state.sensorCount);
  };

  render = () => {
    return (
      <>
        <IconButton
          size="large"
          color="inherit"
          disabled={ this.state.editing }
          onClick={ this.handleSettingsIconClick }
        >
          <SettingsIcon/>
        </IconButton>

        <Dialog
          open={ this.state.open }
          maxWidth="sm"
          scroll="paper"
          PaperProps={ {
            elevation: 4,
            sx: {
              width: "80%"
            }
          } }
        >
          <DialogTitle>
            Configure "{ this.state.formSettings.name }"
          </DialogTitle>

          <DialogContent dividers sx={ { p: 0 } }>

            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={ <ExpandMoreIcon/> }>
                <Typography>General Settings</Typography>
              </AccordionSummary>
              <AccordionDetails sx={ { p: "16px 24px" } }>
                <Box component="form">
                  <Box>
                    <TextField
                      id="name"
                      name="name"
                      label="Pad Name"
                      fullWidth
                      variant="standard"
                      margin="normal"
                      value={ this.state.formSettings.name }
                      onChange={ this.handleFormValueUpdate }
                    />
                  </Box>

                  <Box>
                    <TextField
                      select
                      id="panelCount"
                      name="panelCount"
                      label="Number of panels"
                      margin="normal"
                      value={ this.state.formSettings.panelCount }
                      onChange={ this.handleFormValueUpdate }
                      sx={ { width: "20ch" } }
                    >
                      <MenuItem value={ 1 }>1</MenuItem>
                      <MenuItem value={ 4 }>4</MenuItem>
                      <MenuItem value={ 5 }>5</MenuItem>
                      <MenuItem value={ 6 }>6</MenuItem>
                      <MenuItem value={ 8 }>8</MenuItem>
                      <MenuItem value={ 9 }>9</MenuItem>
                    </TextField>

                    <TextField
                      select
                      id="sensorCount"
                      name="sensorCount"
                      label="Sensors per panel"
                      margin="normal"
                      value={ this.state.formSettings.sensorCount }
                      onChange={ this.handleFormValueUpdate }
                      sx={ { width: "20ch" } }
                    >
                      <MenuItem value={ 1 }>1</MenuItem>
                      <MenuItem value={ 2 }>2</MenuItem>
                      <MenuItem value={ 3 }>3</MenuItem>
                      <MenuItem value={ 4 }>4</MenuItem>
                      <MenuItem value={ 5 }>5</MenuItem>
                    </TextField>
                  </Box>

                  <Box>
                    <TextField
                      id="panelThresholdLiftGap"
                      name="panelThresholdLiftGap"
                      label="Sensor threshold activation gap"
                      variant="standard"
                      type="number"
                      margin="normal"
                      sx={ { width: "20ch" } }
                      value={ this.state.formSettings.panelThresholdLiftGap }
                      onChange={ this.handleFormValueUpdate }
                      InputProps={ {
                        endAdornment:
                          <InputAdornment position="end">
                            <Tooltip
                              placement="top"
                              arrow
                              title={
                                <Typography>
                                  <p>
                                    The threshold gap is the amount that a sensor needs to
                                    be below the threshold value before the panel is set to
                                    "not pressed". This helps prevent unintentional double-presses.
                                  </p>
                                  <p>
                                    The default value of 10 should work well for most setups.
                                    Misfiring pads may want a larger value.
                                  </p>
                                </Typography>
                              }>
                              <HelpIcon sx={ { cursor: "default" } }/>
                            </Tooltip>
                          </InputAdornment>
                      } }
                    />
                  </Box>
                  <Box>
                    <TextField
                      select
                      id="buttonCount"
                      name="buttonCount"
                      label="Number of digital buttons"
                      margin="normal"
                      value={ this.state.formSettings.buttonCount }
                      onChange={ this.handleFormValueUpdate }
                      sx={ { width: "20ch" } }
                    >
                      {
                        Array(20).fill().map((_, index) =>
                          <MenuItem value={ index } key={ index }>{ index }</MenuItem>
                        )
                      }
                    </TextField>
                  </Box>
                  <Box>
                    <FormGroup>
                      <FormControlLabel control={
                        <Switch
                          id="invertedDigitalButtonLogic"
                          name="invertedDigitalButtonLogic"
                          value={ this.state.formSettings.invertedDigitalButtonLogic }
                          checked={ this.state.formSettings.invertedDigitalButtonLogic }
                          onChange={ this.handleFormValueUpdate }
                        />
                      } label="Invert button logic"/>
                    </FormGroup>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={ <ExpandMoreIcon/> }>
                <Typography>Panel Settings</Typography>
              </AccordionSummary>
              <AccordionDetails sx={ { p: "16px 24px" } }>
                <Box component="form">
                  {
                    this.state.formSettings.panels?.map?.((panel, panelIndex) =>
                      <Card key={ panelIndex } elevation={ 3 }>
                        <CardHeader title={ `Panel ${ panelIndex + 1 } ` }/>
                        <CardContent>
                          <Box>
                            <TextField
                              id="gamepadButton"
                              name="gamepadButton"
                              label="Gamepad button number"
                              variant="standard"
                              type="number"
                              margin="normal"
                              sx={ { width: "20ch" } }
                              value={ panel.gamepadButton }
                              onChange={ ($event) => this.handleFormValueUpdate($event, panelIndex) }
                            />
                          </Box>
                          <Box sx={ { width: "100%" } }>
                            {
                              panel.sensors.map?.((sensor, sensorIndex) =>
                                <MicrocontrollerPinSelect
                                  value={ sensor.teensyPin }
                                  key={ `pinselect-${ panelIndex }-${ sensorIndex }` }
                                  name="sensorPinSelect"
                                  label={ `Sensor ${ sensorIndex + 1 } analog pin` }
                                  microcontroller="teensy40"
                                  showDigitalPins={ false }
                                  onChange={ ($event) => this.handleFormValueUpdate($event, panelIndex, sensorIndex) }
                                  selectProps={ { sx: { width: "50%" } } }
                                />
                              )
                            }
                          </Box>
                        </CardContent>
                      </Card>
                    )
                  }
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={ <ExpandMoreIcon/> }>
                <Typography>Button Settings</Typography>
              </AccordionSummary>
              <AccordionDetails sx={ { p: "16px 24px" } }>
                <Box component="form">
                  <Card elevation={ 3 }>
                    <CardContent>
                      {
                        this.state.formSettings.buttons?.map?.((button, buttonIndex) =>
                          <Box key={ buttonIndex } sx={ { width: "100%" } }>
                            <TextField
                              id="buttonGamepadButton"
                              name="buttonGamepadButton"
                              label={ `Button ${ buttonIndex + 1 } Gamepad button number` }
                              type="number"
                              margin="normal"
                              sx={ { width: "50%" } }
                              value={ button.gamepadButton }
                              onChange={ ($event) => this.handleFormValueUpdate($event, buttonIndex) }
                            />
                            <MicrocontrollerPinSelect
                              value={ button.teensyPin }
                              key="buttonPinSelect"
                              name="buttonPinSelect"
                              label={ `Button ${ buttonIndex + 1 } pin` }
                              microcontroller="teensy40"
                              showDigitalPins={ true }
                              showAnalogPins={ true }
                              onChange={ ($event) => this.handleFormValueUpdate($event, buttonIndex) }
                              selectProps={ { sx: { width: "50%" } } }
                            />
                          </Box>
                        )
                      }
                    </CardContent>
                  </Card>
                </Box>
              </AccordionDetails>
            </Accordion>

          </DialogContent>

          <DialogActions>
            <Button onClick={ this.handleCancelButtonClick }>
              <Typography variant="button" color="text.primary">
                Cancel
              </Typography>
            </Button>
            <Button onClick={ this.handleSaveButtonClick }>
              Ok
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  };
};

export default Settings;
