import * as React from 'react';

import Select from '@mui/material/Select';
import {FormControl, IconButton, MenuItem} from "@mui/material";
import {Refresh} from "@mui/icons-material";

class SerialSelector extends React.Component {
  static defaultProps = {
    ports: [],
    currentPort: ""
  };

  constructor() {
    super();
    this.state = {
      ports: [],
      currentPort: ""
    }
  }

  componentDidMount() {
    this.refresh();
  }

  onSelect($event) {
    this.setState({
      currentPort: $event.target.value
    })
  }

  refresh() {
    const portsIpc = window.ipc_serial.listSerialPorts();
    const ports = JSON.parse(portsIpc) ?? [];

    console.log("list serial ports",ports)
    this.setState({ports});

    if (this.state.currentPort === "" && ports?.length > 0) {
      this.setState({
        currentPort: ports[0].path
      });
    }
  }

  render() {
    return (
      <div>
        <FormControl sx={ {pl: 1} }>
          <Select variant="standard"
                  value={this.state.currentPort}
                  onSelect={ this.onSelect }
                  displayEmpty={true}
                  placeholder="Select a port"
                  sx={ {
                    minWidth: 150,
                    typography: "h6"
                  } }
                  renderValue={(selected) => {
                    if (!selected) {
                      return <div>No Serial devices detected</div>;
                    }

                    return selected;
                  }}>
            { this.state?.ports?.map?.((port, i) =>
              <MenuItem value={ port?.path } key={i}>
                { port?.path }
              </MenuItem>
            ) }
          </Select>
        </FormControl>

        <IconButton
          size="large"
          onClick={ () => this.refresh() }>
          <Refresh/>
        </IconButton>
      </div>
    );
  }
}

export default SerialSelector
