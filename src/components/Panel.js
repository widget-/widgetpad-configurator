import * as React from 'react';
import { Slider } from "@mui/material";

const panelHeight = 500;
// this is needed for Slider.value because React will think
// that the slider is an uncontrolled component before
// its props are properly initialized:
const defaultThreshold = 100;

class Panel extends React.Component {
  static defaultProps = {
    sensors: [{
      value: 0,
      threshold: defaultThreshold,
      pressed: false
    }],
    max: 1024,
    pressed: false,
    onChange: null,
    editing: false
  };

  render() {
    return (
      <div style={ {
        flex: "1 1 150px"
      } }>
        {
          this.props.sensors.map(({ value, threshold, pressed }, index, sensors) => {
            const first = (index === 0);
            const last = (index === sensors.length - 1);

            return <div key={ index } style={ {
              display: "inline-block",
              position: "relative",
              width: 100 / sensors.length + "%"
            } }>
              <div style={ {
                position: "absolute",
                top: 20,
                left: first ? 10 : 0,
                right: last ? 10 : 0,
                textAlign: "center",
                fontSize: 24
              } }>
                { value }<br/>
                ({ threshold })
              </div>
              <Slider orientation="vertical"
                      max={ this.props.max }
                      value={ threshold ?? defaultThreshold }
                      onChange={ $event => this.props.onChange?.($event.target.value, index) }
                      style={ {
                        height: panelHeight,
                        width: `calc(100% - ${ (first ? 10 : 0) + (last ? 10 : 0) }px)`
                      } }
                      sx={ {
                        mt: 2,
                        p: 0,
                        ml: (index === 0) ? "10px" : 0,
                        mr: (index === sensors.length - 1) ? "10px" : 0,
                        borderTopLeftRadius: first ? "12px" : 0,
                        borderBottomLeftRadius: first ? "12px" : 0,
                        borderTopRightRadius: last ? "12px" : 0,
                        borderBottomRightRadius: last ? "12px" : 0,
                        '& .MuiSlider-rail': {
                          backgroundColor: this.props.editing ? "secondary.500" : "secondary.700"
                          , width: "100%"
                        },
                        '& .MuiSlider-track': {
                          backgroundColor: pressed ? "primary.main" : "primary.900",
                          height: `${ value / this.props.max * 100 }% !important`,
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
                      disabled={ !this.props.editing }
                      valueLabelDisplay="auto"
                      track={ false }
              />
            </div>;
          })
        }
      </div>
    );
  }
}

export default Panel;
