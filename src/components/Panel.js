import * as React from 'react';
import { useSelector } from 'react-redux';
import { selectSensorsCount } from '../slices/padConfig';

import Sensor from './Sensor';

/**
 * @param {object} props
 * @property {int} props.panelIndex
 * @return {JSX.Element}
 */
function Panel(props) {
  const panelIndex = props.panelIndex;

  const sensorsCount = useSelector(selectSensorsCount);

  return <div style={ {
    flex: "1 1 150px"
  } }>
    {
      Array(sensorsCount).fill(0).map((_, sensorIndex) => {
        const first = (sensorIndex === 0);
        const last = (sensorIndex === sensorsCount - 1);

        return <Sensor
          key={ sensorIndex }
          panelIndex={ panelIndex }
          sensorIndex={ sensorIndex }
          max={ props.max }
          editing={ props.editing }
          first={ first }
          last={ last }/>;
      })
    }
  </div>;
}

export default React.memo(Panel);
