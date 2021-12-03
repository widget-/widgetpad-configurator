import React from 'react';
import Panel from '../components/Panel'


class Main extends React.Component {
    static defaultProps = {
        editing: false
    }

    constructor(props) {
        super(props);
        this.state = {
            numberOfPanels: 4,
            panels: [
                {
                    value: 0,
                    threshold: 100
                },
                {
                    value: 0,
                    threshold: 100
                },
                {
                    value: 0,
                    threshold: 100
                },
                {
                    value: 0,
                    threshold: 100
                }
            ]
        }
    }

    updatePanelValue(value, index) {
        const panels = [...this.state.panels];
        panels[index].value = +value;
        this.setState({panels: panels});
    }

    updatePanelThreshold(value, index) {
        const panels = [...this.state.panels];
        panels[index].threshold = +value;
        this.setState({panels: panels});
    }

    render() {
        return <div>
            <h1>Main</h1>
            <div style={{display: "flex", flexWrap: "wrap"}}>
                {
                    this.state.panels.map((panel, index) =>
                        <Panel value={panel.value} max={1024} threshold={panel.threshold}
                               onChange={(val) => this.updatePanelThreshold(val, index)}
                               onChangeValue={(val) => this.updatePanelValue(val, index)}
                               key={index} editing={this.props.editing}/>
                    )
                }</div>
        </div>
    }
}

export default Main;
