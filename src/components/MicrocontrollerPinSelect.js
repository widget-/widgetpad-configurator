import * as React from 'react';

import { ListSubheader, MenuItem, TextField, Typography } from "@mui/material";


class MicrocontrollerPinSelect extends React.Component {
  static defaultProps = {
    onChange: null,
    showAnalogPins: true,
    showDigitalPins: true,
    name: '',
    label: '',
    value: 0,
    microcontroller: '',
    selectProps: {}
  };

  static pins = {
    teensy40: {
      analog: Array(14).fill().map((_, i) => ({
        name: `A${ i }`,
        value: i + 14
      })),
      digital: Array(40).fill().map((_, i) => i)
    },
    teensy41: {
      analog: Array(18).fill().map((_, i) => ({
        name: `A${ i }`,
        value: i + 14
      })),
      digital: Array(55).fill().map((_, i) => i)
    }
  };

  onSelect = ($event) => {
    return this.props.onChange?.($event);
  };

  render = () => {
    return (
      <TextField
        select
        value={ this.props.value }
        id={ this.props.name }
        name={ this.props.name }
        label={ this.props.label }
        margin="normal"
        onChange={ this.onSelect }
        sx={ { width: "20ch" } }
        { ...this.props.selectProps }
      >
        {
          this.props.showAnalogPins &&
          <ListSubheader sx={ { backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.12))' } }>
            <Typography color="primary" typography="subtitle1">
              Analog Pins
            </Typography>
          </ListSubheader>
        }
        {
          this.props.showAnalogPins &&
          MicrocontrollerPinSelect.pins[this.props.microcontroller]?.analog?.map((pin) =>
            <MenuItem
              key={ pin.name }
              value={ pin.value }
            >{ pin.name }</MenuItem>
          )
        }
        {
          this.props.showDigitalPins &&
          <ListSubheader sx={ { backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.12))' } }>
            <Typography color="primary" typography="subtitle1">
              Digital Pins
            </Typography>
          </ListSubheader>
        }
        {
          this.props.showDigitalPins &&
          MicrocontrollerPinSelect.pins[this.props.microcontroller]?.digital?.map((pin) =>
            <MenuItem
              key={ pin }
              value={ pin }
            >{ pin }</MenuItem>)
        }
      </TextField>

    );
  };
}

export default MicrocontrollerPinSelect;
