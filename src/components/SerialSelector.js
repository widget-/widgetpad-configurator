import * as React from 'react';

import Select from '@mui/material/Select';
import { IconButton, MenuItem } from "@mui/material";
import { Refresh } from "@mui/icons-material";


class SerialSelector extends React.Component {
  /**
   * @type {{serialConnection: ?SerialConnection}}
   */
  static defaultProps = {
    serialConnection: null,
    padName: null
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

  refresh = async () => {
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
  };

  renderValue = (selected) => {
    if (this.props.padName) {
      return this.props.padName;
    } else if (!selected) {
      return <div>No Serial devices detected</div>;
    }

    return selected;
  };

  render = () => {
    return (
      <div>
        <Select variant="standard"
                value={ this.state.currentPort }
                onSelect={ this.onSelect }
                displayEmpty={ true }
                placeholder="Select a port"
                sx={ {
                  minWidth: 150,
                  typography: "h6"
                } }
                renderValue={ this.renderValue }>
          { this.state?.ports?.map?.((port, i) =>
            <MenuItem value={ port?.path } key={ port?.path ?? i }>
              { port?.path }
            </MenuItem>
          ) }
        </Select>

        <IconButton
          size="large"
          onClick={ this.refresh }>
          <Refresh/>
        </IconButton>
      </div>
    );
  };
}

export default SerialSelector;
