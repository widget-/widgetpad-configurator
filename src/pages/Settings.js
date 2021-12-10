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
  InputAdornment,
  MenuItem, Switch,
  TextField, Toolbar,
  Tooltip,
  Typography
} from '@mui/material';
import {
  HelpOutline as HelpIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

import MicrocontrollerPinSelect from '../components/MicrocontrollerPinSelect';
import { useDispatch, useSelector } from 'react-redux';
import { selectPadConfig, updatePadConfigFromSettings } from '../slices/padConfig';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function _deepCopy(o) {
  return o && JSON.parse(JSON.stringify(o));
}

function Settings() {
  const dispatch = useDispatch();
  let navigate = useNavigate();

  const padConfig = useSelector(selectPadConfig);
  const [formSettings, setFormSettings] = useState({
    name: padConfig.general?.name,
    panelCount: padConfig.panels?.length,
    sensorCount: padConfig.panels?.[0]?.sensors?.length,
    buttonCount: padConfig.buttons?.length,
    panelThresholdLiftGap: padConfig.general?.panelThresholdLiftGap,
    panels: padConfig.panels,
    buttons: padConfig.buttons,
    invertedDigitalButtonLogic: padConfig.general?.invertedDigitalButtonLogic
  });


  const handleSaveButtonClick = () => {
    dispatch(updatePadConfigFromSettings(formSettings));
    navigate("/");
  };

  const handleCancelButtonClick = () => {
    navigate("/");
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
  const generateUpdatedPanels = (panelCount, sensorCount) => {
    const panels = [];

    for (let panelIndex = 0; panelIndex < panelCount; panelIndex++) {
      if (formSettings.panels[panelIndex]) {
        panels.push(_deepCopy(formSettings.panels[panelIndex]));
      } else if (padConfig.panels[panelIndex]) {
        panels.push(_deepCopy(padConfig.panels[panelIndex]));
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
        if (formSettings.panels[panelIndex]?.sensors?.[sensorIndex]) {
          panels[panelIndex].sensors.push(_deepCopy(formSettings.panels[panelIndex].sensors[sensorIndex]));
        } else if (padConfig.panels[panelIndex]?.sensors?.[sensorIndex]) {
          panels[panelIndex].sensors.push(_deepCopy(padConfig.panels[panelIndex].sensors[sensorIndex]));
        } else {
          panels[panelIndex].sensors.push({
            threshold: 30,
            teensyPin: MicrocontrollerPinSelect.pins[padConfig.general.controller].analog[0].value
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
  const generateUpdatedButtons = (buttonCount) => {
    const buttons = [];

    for (let buttonIndex = 0; buttonIndex < buttonCount; buttonIndex++) {
      if (formSettings.buttons[buttonIndex]) {
        buttons.push(_deepCopy(formSettings.buttons[buttonIndex]));
      } else if (padConfig.buttons[buttonIndex]) {
        buttons.push(_deepCopy(padConfig.buttons[buttonIndex]));
      } else {
        buttons.push({
          gamepadButton: 0,
          teensyPin: 0
        });
      }
    }
    return buttons;
  };

  const handleFormValueUpdate = ($event, padIndex, sensorIndex) => {
    const state = {
      formSettings
    };

    if ($event.target?.name === 'name') {
      state.formSettings.name = $event.target.value;
    } else if ($event.target?.name === 'panelCount') {
      if (state.formSettings.panelCount !== $event.target.value) {
        state.formSettings.panelCount = $event.target.value;

        state.formSettings.panels = generateUpdatedPanels(
          state.formSettings.panelCount,
          state.formSettings.sensorCount
        );
      }
    } else if ($event.target?.name === 'sensorCount') {
      if (state.formSettings.sensorCount !== $event.target.value) {
        state.formSettings.sensorCount = $event.target.value;

        state.formSettings.panels = generateUpdatedPanels(
          state.formSettings.panelCount,
          state.formSettings.sensorCount
        );
      }
    } else if ($event.target?.name === 'buttonCount') {
      if (state.formSettings.buttonCount !== $event.target.value) {
        state.formSettings.buttonCount = $event.target.value;

        state.formSettings.buttons = generateUpdatedButtons(
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

    setFormSettings(state.formSettings);
  };

  // useEffect(() => {
  //   generateUpdatedPanels(formSettings.panelCount, formSettings.sensorCount);
  // }, [formSettings.panelCount, formSettings.sensorCount])

  const heightCappedSelectProps = {
    MenuProps: {
      PaperProps: {
        style: {
          maxHeight: 400,
          width: '20ch'
        }
      }
    }
  };

  return (
    <>
      <Toolbar>
        <Typography typography="h6">
          Configure "{ formSettings.name }"
        </Typography>
      </Toolbar>

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
                value={ formSettings.name }
                onChange={ handleFormValueUpdate }
              />
            </Box>

            <Box>
              <TextField
                select
                id="panelCount"
                name="panelCount"
                label="Number of panels"
                margin="normal"
                value={ formSettings.panelCount }
                onChange={ handleFormValueUpdate }
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
                value={ formSettings.sensorCount }
                onChange={ handleFormValueUpdate }
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
                value={ formSettings.panelThresholdLiftGap }
                onChange={ handleFormValueUpdate }
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
                value={ formSettings.buttonCount }
                onChange={ handleFormValueUpdate }
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
                    value={ formSettings.invertedDigitalButtonLogic }
                    checked={ formSettings.invertedDigitalButtonLogic }
                    onChange={ handleFormValueUpdate }
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
              formSettings.panels?.map?.((panel, panelIndex) =>
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
                        onChange={ ($event) => handleFormValueUpdate($event, panelIndex) }
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
                            onChange={ ($event) => handleFormValueUpdate($event, panelIndex, sensorIndex) }
                            width="50%"
                            SelectProps={ heightCappedSelectProps }
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
                  formSettings.buttons?.map?.((button, buttonIndex) =>
                    <Box key={ buttonIndex } sx={ { width: "100%" } }>
                      <TextField
                        id="buttonGamepadButton"
                        name="buttonGamepadButton"
                        label={ `Button ${ buttonIndex + 1 } Gamepad button number` }
                        type="number"
                        margin="normal"
                        sx={ { width: "50%" } }
                        value={ button.gamepadButton }
                        onChange={ ($event) => handleFormValueUpdate($event, buttonIndex) }
                      />
                      <MicrocontrollerPinSelect
                        value={ button.teensyPin }
                        key="buttonPinSelect"
                        name="buttonPinSelect"
                        label={ `Button ${ buttonIndex + 1 } pin` }
                        microcontroller="teensy40"
                        showDigitalPins={ true }
                        showAnalogPins={ true }
                        onChange={ ($event) => handleFormValueUpdate($event, buttonIndex) }
                        width="50%"
                        SelectProps={ heightCappedSelectProps }
                      />
                    </Box>
                  )
                }
              </CardContent>
            </Card>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Button onClick={ handleCancelButtonClick }>
        <Typography variant="button" color="text.primary">
          Cancel
        </Typography>
      </Button>
      <Button onClick={ handleSaveButtonClick }>
        Ok
      </Button>

    </>
  );
};

export default Settings;
