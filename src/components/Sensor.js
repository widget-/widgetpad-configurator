import * as React from 'react';

import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { IconButton, Slider } from "@mui/material";

import {
  createSelectPadConfigSensorThreshold,
  selectSensorsCount,
  setPadThreshold
} from '../slices/padConfig';
import { createSelectPadValuesSensor } from '../slices/padValues';
import {
  selectIsEditing,
  selectPanelHeight
} from '../slices/appSettings';

// this is needed for Slider.value because React will think
// that the slider is an uncontrolled component before
// its props are properly initialized:
const defaultThreshold = 100;

/**
 * @param {object} props
 * @property {int} props.panelIndex
 * @return {JSX.Element}
 */
function Sensor(props) {
  const dispatch = useDispatch();

  const sensorsCount = useSelector(selectSensorsCount);
  const isEditing = useSelector(selectIsEditing);
  const panelHeight = useSelector(selectPanelHeight);

  const MemoizedSlider = useMemo(() => React.memo(Slider), []);

  const selectPadConfigSensorThreshold = useMemo(createSelectPadConfigSensorThreshold, []);
  const threshold = useSelector((state) => {
      return selectPadConfigSensorThreshold(state, {
        panelIndex: props.panelIndex,
        sensorIndex: props.sensorIndex
      });
    }
  );

  const selectPadValuesSensor = useMemo(createSelectPadValuesSensor, []);
  const { pressed, value } = useSelector((state) => {
      return selectPadValuesSensor(state, {
        panelIndex: props.panelIndex,
        sensorIndex: props.sensorIndex
      });
    }
  );

  const handleOnChange = useCallback(($event) => {
    dispatch(setPadThreshold({
      panelIndex: props.panelIndex,
      sensorIndex: props.sensorIndex,
      threshold: $event.target.value
    }));
  }, [props.panelIndex, props.sensorIndex, dispatch]);

  return <div key={ props.sensorIndex } style={ {
    display: "inline-block",
    position: "relative",
    width: 100 / sensorsCount + "%"
  } }>
    <div style={ {
      position: "absolute",
      top: 20,
      left: props.first ? 10 : 0,
      right: props.last ? 10 : 0,
      textAlign: "center",
      fontSize: 24
    } }>
      { value }<br/>
      ({ threshold })
    </div>
    <MemoizedSlider orientation="vertical"
                    max={ props.max }
                    value={ threshold ?? defaultThreshold }
                    onChange={ handleOnChange }
                    style={ {
                      height: panelHeight,
                      width: `calc(100% - ${ (props.first ? 10 : 0) + (props.last ? 10 : 0) }px)`
                    } }
                    sx={ {
                      mt: 2,
                      p: 0,
                      ml: props.first ? "10px" : 0,
                      mr: props.last ? "10px" : 0,
                      borderTopLeftRadius: props.first ? "12px" : 0,
                      borderBottomLeftRadius: props.first ? "12px" : 0,
                      borderTopRightRadius: props.last ? "12px" : 0,
                      borderBottomRightRadius: props.last ? "12px" : 0,
                      '& .MuiSlider-rail': {
                        backgroundColor:
                          props.editing ? "secondary.500" : "secondary.700", width: "100%"
                      },
                      '& .MuiSlider-track': {
                        backgroundColor: pressed ? "primary.main" : "primary.900",
                        height: `${ value / props.max * 100 }% !important`,
                        width: "100%",
                        border: "none",
                        minHeight: "12px",
                        transition: "none",
                        display: "block"
                      },
                      '& .MuiSlider-thumb': {
                        width: "100%",
                        height: "4px",
                        borderRadius: 0
                      }
                    } }
                    disabled={ !isEditing }
                    valueLabelDisplay="auto"
                    track={ false }/>
  </div>;
}

export default React.memo(Sensor, (prevProps, nextProps) => {
  return prevProps.first === nextProps.first &&
    prevProps.last === nextProps.last &&
    prevProps.last === nextProps.last &&
    prevProps.panelIndex === nextProps.panelIndex &&
    prevProps.sensorIndex === nextProps.sensorIndex &&
    prevProps.max === nextProps.max;
});
