import React from 'react';
import Panel from '../components/Panel';


class Main extends React.Component {
  static defaultProps = {
    editing: false,
    padConfig: {},
    padValues: {},
    onThresholdChange: null
  };

  updatePanelThreshold(value, panelIndex, sensorIndex) {
    this.props.onThresholdChange?.(value, panelIndex, sensorIndex);
  }

  render() {
    let key = 0;
    return <div style={ { display: "flex", flexWrap: "wrap", padding: "0 10px" } }>
      {
        this.props.padConfig.panels?.map((panel, panelIndex) => {

          const sensors = panel.sensors?.map((sensorConfig, sensorIndex) => ({
            value: this.props.padValues.panels?.[panelIndex]?.sensors[sensorIndex]?.value,
            pressed: this.props.padValues.panels?.[panelIndex]?.sensors[sensorIndex]?.pressed,
            threshold: sensorConfig.threshold
          }));
          return <Panel
            max={ 1024 }
            sensors={ sensors }
            onChange={ (val, sensorIndex) => this.updatePanelThreshold(val, panelIndex, sensorIndex) }
            key={ key++ }
            editing={ this.props.editing }
          />;
        })
      }</div>;
  }
}

export default Main;
