/**
 * We use a modal popup to try and signify to the user that the settings they're
 * configuring are specific to the pad being shown. App-wide settings instead
 * open in a full page.
 */

import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card, CardActions,
  CardContent, CardHeader,
  FormControlLabel,
  FormGroup,
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
import { selectPadConfig, updatePadConfigFromSettings } from '../slices/padConfig';

function _deepCopy(o) {
  return o && JSON.parse(JSON.stringify(o));
}

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

function GeneralSettings(props) {
  return (<Box component="form">
    <Box>
      <TextField
        id="name"
        name="name"
        label="Pad Name"
        fullWidth
        variant="standard"
        margin="normal"
        value={ props.padName }
        onChange={ props.handleFormValueUpdate }
      />
    </Box>

    <Box sx={ { width: "100%" } }>
      <TextField
        select
        id="panelCount"
        name="panelCount"
        label="Number of panels"
        margin="normal"
        value={ props.panelCount }
        onChange={ props.handleFormValueUpdate }
        sx={ { width: "50%" } }
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
        value={ props.sensorCount }
        onChange={ props.handleFormValueUpdate }
        sx={ { width: "50%" } }
      >
        <MenuItem value={ 1 }>1</MenuItem>
        <MenuItem value={ 2 }>2</MenuItem>
        <MenuItem value={ 3 }>3</MenuItem>
        <MenuItem value={ 4 }>4</MenuItem>
        <MenuItem value={ 5 }>5</MenuItem>
      </TextField>
    </Box>

    <Box sx={ { width: "100%" } }>
      <TextField
        select
        id="buttonCount"
        name="buttonCount"
        label="Number of digital buttons"
        margin="normal"
        value={ props.buttonCount }
        onChange={ props.handleFormValueUpdate }
        sx={ { width: "50%" } }
        SelectProps={ heightCappedSelectProps }
      >
        {
          Array(20).fill().map((_, index) =>
            <MenuItem value={ index } key={ index }>{ index }</MenuItem>
          )
        }
      </TextField>
    </Box>

    <Box sx={ { width: "100%" } }>
      <TextField
        id="panelThresholdLiftGap"
        name="panelThresholdLiftGap"
        label="Sensor threshold deactivation gap"
        variant="standard"
        type="number"
        margin="normal"
        sx={ { width: "50%" } }
        value={ props.panelThresholdLiftGap }
        onChange={ props.handleFormValueUpdate }
        InputProps={ {
          endAdornment:
            useMemo(() => <InputAdornment position="end">
              <Tooltip
                placement="top"
                arrow
                title={
                  <>
                    <Typography typography="body1" sx={ { mt: 1, mb: 1 } }>
                      The threshold gap is the amount that a sensor needs to
                      be below the threshold value before the panel is set to
                      "not pressed". This helps prevent unintentional double-presses.
                    </Typography>
                    <Typography typography="body1" sx={ { mt: 1, mb: 1 } }>
                      The default value of 10 should work well for most setups.
                      Misfiring pads may want a larger value. Hyper-sensitive
                      pads may want a smaller number.
                    </Typography>
                  </>
                }>
                <HelpIcon sx={ { cursor: "default" } }/>
              </Tooltip>
            </InputAdornment>, [])
        } }
      />

      <FormGroup sx={ { width: "50%" } }>
        <FormControlLabel control={
          <Switch
            id="invertedDigitalButtonLogic"
            name="invertedDigitalButtonLogic"
            value={ props.invertedDigitalButtonLogic }
            checked={ props.invertedDigitalButtonLogic }
            onChange={ props.handleFormValueUpdate }
          />
        } label="Invert button logic"/>
      </FormGroup>
    </Box>
  </Box>);
}

function PanelSettings(props) {
  return (<Box component="form" style={ {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap"
  } }>
    {
      props.panels?.map?.((panel, panelIndex) =>
        <Card key={ panelIndex } elevation={ 3 } sx={ { m: 1 } } style={ { flex: "1 0 300px", maxWidth: "500px" } }>
          <CardHeader title={ `Panel ${ panelIndex + 1 } ` }/>
          <CardContent>
            <TextField
              select
              id="gamepadButton"
              name="gamepadButton"
              label="Gamepad button number"
              margin="normal"
              value={ panel.gamepadButton }
              onChange={ ($event) => props.handleFormValueUpdate($event, panelIndex) }
              sx={ { width: "100%" } }
              SelectProps={ heightCappedSelectProps }
            >
              {
                Array(16).fill().map((_, index) =>
                  <MenuItem value={ index + 1 } key={ index }>{ index + 1 }</MenuItem>
                )
              }
            </TextField>
            {
              panel.sensors.map?.((sensor, sensorIndex) =>
                <MicrocontrollerPinSelect
                  value={ sensor.teensyPin }
                  key={ `pinselect-${ panelIndex }-${ sensorIndex }` }
                  name="sensorPinSelect"
                  label={ `Sensor ${ sensorIndex + 1 } analog pin` }
                  microcontroller="teensy40"
                  showDigitalPins={ false }
                  onChange={ ($event) => props.handleFormValueUpdate($event, panelIndex, sensorIndex) }
                  width="100%"
                  SelectProps={ heightCappedSelectProps }
                />
              )
            }
          </CardContent>
        </Card>
      )
    }
  </Box>);
}

function ButtonSettings(props) {
  const { buttons, handleFormValueUpdate } = props;

  return (<Box component="form">
    <Card elevation={ 3 }>
      <CardContent>
        {
          useMemo(() => buttons?.map?.((button, buttonIndex) =>
            <Box key={ buttonIndex } sx={ { width: "100%" } }>
              <TextField
                select
                id="buttonGamepadButton"
                name="buttonGamepadButton"
                label={ `Button ${ buttonIndex + 1 } Gamepad button number` }
                margin="normal"
                value={ button.gamepadButton }
                onChange={ ($event) => handleFormValueUpdate($event, buttonIndex) }
                sx={ { width: "50%" } }
                SelectProps={ heightCappedSelectProps }
              >
                {
                  Array(16).fill().map((_, index) =>
                    <MenuItem value={ index + 1 } key={ index }>{ index + 1 }</MenuItem>
                  )
                }
              </TextField>
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
          ), [buttons, handleFormValueUpdate])
        }
      </CardContent>
    </Card>
  </Box>);
}

const MemoizedGeneralSettings = React.memo(GeneralSettings);
const MemoizedPanelSettings = React.memo(PanelSettings);
const MemoizedButtonSettings = React.memo(ButtonSettings);

function Settings() {
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const [expanded, setExpanded] = React.useState("general");


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

  const handleExpandedAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
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
  const generateUpdatedPanels = useCallback((panelCount, sensorCount) => {
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
  }, [formSettings.panels, padConfig.general?.controller, padConfig.panels]);

  /**
   * Similar thing but for buttons
   * @param {int} buttonCount
   * @return {[]}
   */
  const generateUpdatedButtons = useCallback((buttonCount) => {
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
  }, [formSettings.buttons, padConfig.buttons]);

  const handleFormValueUpdate = useCallback(($event, padIndex, sensorIndex) => {
    const state = _deepCopy({
      formSettings
    });

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
    } else if ($event.target?.name === 'invertedDigitalButtonLogic') {
      state.formSettings.invertedDigitalButtonLogic = $event.target.checked;
    } else if ($event.target?.name === 'sensorPinSelect') {
      state.formSettings.panels[padIndex].sensors[sensorIndex].teensyPin = $event.target.value;
    } else if ($event.target?.name === 'buttonGamepadButton') {
      state.formSettings.buttons[padIndex].buttonGamepadButton = $event.target.value;
    } else if ($event.target?.name === 'buttonPinSelect') {
      state.formSettings.buttons[padIndex].buttonPinSelect = $event.target.value;
    }

    setFormSettings(state.formSettings);
  }, [formSettings, generateUpdatedButtons, generateUpdatedPanels]);


  return (
    <div style={ {
      maxHeight: "100%"
    } }>
      <Toolbar>
        <Typography typography="h6">
          Configure "{ formSettings.name }"
        </Typography>
      </Toolbar>

      <Accordion
        defaultExpanded
        expanded={ expanded === "general" }
        onChange={ handleExpandedAccordionChange("general") }
      >
        <AccordionSummary expandIcon={ <ExpandMoreIcon/> } style={ { backgroundColor: "#FFFFFF11" } }>
          <Typography>General Settings</Typography>
        </AccordionSummary>
        <AccordionDetails sx={ { p: "16px 24px" } }>
          <MemoizedGeneralSettings
            handleFormValueUpdate={ handleFormValueUpdate }
            padName={ formSettings.name }
            panelCount={ formSettings.panelCount }
            sensorCount={ formSettings.sensorCount }
            buttonCount={ formSettings.buttonCount }
            panelThresholdLiftGap={ formSettings.panelThresholdLiftGap }
            invertedDigitalButtonLogic={ formSettings.invertedDigitalButtonLogic }
          />
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={ expanded === "panels" }
        onChange={ handleExpandedAccordionChange("panels") }
      >
        <AccordionSummary expandIcon={ <ExpandMoreIcon/> } style={ {
          backgroundColor: "#FFFFFF11"
        } }>
          < Typography> Panel Settings</Typography>
        </AccordionSummary>
        <AccordionDetails sx={ { p: "16px 24px" } }>
          <MemoizedPanelSettings
            panels={ formSettings.panels }
            handleFormValueUpdate={ handleFormValueUpdate }
            buttonCount={ formSettings.buttonCount }
          />
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={ expanded === "buttons" }
        onChange={ handleExpandedAccordionChange("buttons") }
      >
        <AccordionSummary expandIcon={ <ExpandMoreIcon/> } style={ { backgroundColor: "#FFFFFF11" } }>
          <Typography>Button Settings</Typography>
        </AccordionSummary>
        <AccordionDetails sx={ { p: "16px 24px" } }>
          <MemoizedButtonSettings
            buttons={ formSettings.buttons }
            handleFormValueUpdate={ handleFormValueUpdate }
          />
        </AccordionDetails>
      </Accordion>

      <CardActions>
        <Typography sx={ { flex: 1 } }/>
        <Button onClick={ handleCancelButtonClick }>
          <Typography variant="button" color="text.primary">
            Cancel
          </Typography>
        </Button>
        <Button onClick={ handleSaveButtonClick } variant={ "outlined" }>
          Ok
        </Button>
      </CardActions>
    </div>
  )
    ;
};

export default React.memo(Settings);
