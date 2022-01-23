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


  const handlePortConnectionError = useCallback(async (err) => {
    console.log('Port connection error', err);
  }, []);

  const onSelectPort = useCallback(async ($event) => {
    console.log(`Trying to select ${ $event.target.value }...`);
    try {
      await props.serialConnection?.setPort($event.target.value);
      setCurrentPort($event.target.value);
    } catch (e) {
      console.log(e); // show popup later...
    }
  }, [props.serialConnection]);

  const refresh = useCallback(async () => {
    if (!props.serialConnection) return;
    let _ports = await props.serialConnection?.listPorts();

    if (currentPort === "" && _ports?.length > 0) {
      for (let port of _ports) {
        try {
          await props.serialConnection?.setPort(port.path);
          setCurrentPort(port.path);
          break;
        } catch (err) {
          await handlePortConnectionError(err);
        }
      }
    } else if (_ports?.length === 0 || !_ports) {
      try {
        await props.serialConnection?.disconnect();
        setCurrentPort("");
      } catch (err) {
        await handlePortConnectionError(err);
      }
    }
    setPorts(_ports);
  }, [currentPort, handlePortConnectionError, props.serialConnection]);

  useEffect(refresh, [refresh]);

  const renderValue = useCallback((selected) => {
    if (padName) {
      return padName;
    } else if (!selected) {
      return <div>No Serial devices detected</div>;
    }

    return selected;
  }, [padName]);

  return (
    <>
      <Select variant="standard"
              value={ currentPort }
              onSelect={ onSelectPort }
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

// export default React.memo(SerialSelector);
export default SerialSelector;
