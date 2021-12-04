import * as React from 'react';

import Select from '@mui/material/Select';
import { FormControl, IconButton, MenuItem } from "@mui/material";
import { Refresh } from "@mui/icons-material";


class SerialSelector extends React.Component {
  /**
   * @type {{serialConnection: ?SerialConnection}}
   */
  static defaultProps = {
    serialConnection: null
  };

  constructor(props) {
    super(props);
    this.state = {
      ports: [],
      currentPort: ""
    };
  }

  componentDidMount() {
    // send off untracked async function in the background
    void (() => this.refresh())();
  }

  onSelect($event) {
    this.setState({
      currentPort: $event.target.value
    });
    return this.props.serialConnection?.setPort($event.target.value);
  }

  async refresh() {
    if (!this.props.serialConnection) return;
    let ports = await this.props.serialConnection.listPorts();

    if (this.state.currentPort === "" && ports?.length > 0) {
      await this.props.serialConnection?.setPort(ports[0].path);
      this.setState({
        currentPort: ports[0].path,
        ports
      });
    } else if (ports?.length === 0 || !ports) {
      await this.props.serialConnection?.disconnect();
      this.setState({
        currentPort: "",
        ports
      });
    } else {
      this.setState({ ports });
    }
  }

  render() {
    return (
      <div>
        <FormControl>
          <Select variant="standard"
                  value={ this.state.currentPort }
                  onSelect={ this.onSelect }
                  displayEmpty={ true }
                  placeholder="Select a port"
                  sx={ {
                    minWidth: 150,
                    typography: "h6"
                  } }
                  renderValue={ (selected) => {
                    if (!selected) {
                      return <div>No Serial devices detected</div>;
                    }

                    return selected;
                  } }>
            { this.state?.ports?.map?.((port, i) =>
              <MenuItem value={ port?.path } key={ i }>
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

export default SerialSelector;
