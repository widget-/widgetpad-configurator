import * as React from 'react';

import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import Select from '@mui/material/Select';
import { IconButton, MenuItem } from "@mui/material";
import { Refresh } from "@mui/icons-material";

import { selectPadName } from '../slices/padConfig';

/**
 * @param props
 * @property {?SerialConnection} serialConnection
 * @return {Promise<void>|boolean|*}
 */
function SerialSelector(props) {
  const [ports, setPorts] = useState([]);
  const [currentPort, setCurrentPort] = useState("");

  const padName = useSelector(selectPadName);


  const onSelect = ($event) => {
    setCurrentPort($event.target.value);
    return props.serialConnection?.setPort($event.target.value);
  };

  const refresh = useCallback(async () => {
    if (!props.serialConnection) return;
    let _ports = await props.serialConnection.listPorts();

    if (currentPort === "" && _ports?.length > 0) {
      await props.serialConnection?.setPort(_ports[0].path);
      setCurrentPort(_ports[0].path);
    } else if (_ports?.length === 0 || !_ports) {
      await props.serialConnection?.disconnect();
      setCurrentPort("");
    }
    setPorts(_ports);
  }, [currentPort, props.serialConnection]);

  useEffect(() => refresh(), [refresh]);

  const renderValue = (selected) => {
    if (padName) {
      return padName;
    } else if (!selected) {
      return <div>No Serial devices detected</div>;
    }

    return selected;
  };

  return (
    <>
      <Select variant="standard"
              value={ currentPort }
              onSelect={ onSelect }
              displayEmpty={ true }
              placeholder="Select a port"
              sx={ {
                minWidth: 150,
                typography: "h6"
              } }
              renderValue={ renderValue }>
        { ports.map?.((port, i) =>
          <MenuItem value={ port?.path } key={ port?.path ?? i }>
            { port?.path }
          </MenuItem>
        ) }
      </Select>

      <IconButton
        size="large"
        onClick={ refresh }>
        <Refresh/>
      </IconButton>
    </>
  );
}

export default React.memo(SerialSelector);
