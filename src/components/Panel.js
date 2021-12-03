import * as React from 'react';
import {Slider} from "@mui/material";

const panelWidth = 200;
const panelHeight = 500;


class Panel extends React.Component {
  static defaultProps = {
    value: 0,
    threshold: 100,
    max: 1024,
    onChange: null,
    onChangeValue: null,
    editing: false
  };

  render() {
    return (
      <div>
        <input type="range" min="0" max={ this.props.max }
               onChange={ $event => this.props.onChangeValue?.($event.target.value) }
               style={ {
                 width: `${ panelWidth }px`,
                 display: "block",
                 margin: "10px auto"
               } }/>

        <Slider orientation="vertical"
                max={ this.props.max }
                value={ this.props.threshold }
                onChange={ $event => this.props.onChange?.($event.target.value) }
                style={ {
                  height: panelHeight,
                  width: panelWidth
                } }
                sx={ {
                  '& .MuiSlider-rail': {
                    backgroundColor: this.props.editing ? "secondary.500" : "secondary.700"
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: this.props.value > this.props.threshold ? "primary.main" : "primary.900",
                    height: `${ this.props.value / this.props.max * 100 }% !important`,
                    minHeight: "12px",
                    transition: "none",
                    "display": "block",
                  },
                  '& .MuiSlider-thumb': {
                    width: "100%",
                    height: "4px",
                    borderRadius: "2px"
                  }
                } }
                disabled={ !this.props.editing }
                valueLabelDisplay="auto"
                track={ false }
        />

        {/*, "-webkit-appearance": "slider-vertical"*/ }
        {/*<Meter value={this.props.value} max={this.props.max} threshold={this.props.threshold} width={panelWidth}*/ }
        {/*       height={panelHeight}/>*/ }
      </div>
    );
  }
}

export default Panel
