import * as React from 'react';

class Meter extends React.Component {
    render() {
        return (
            <div>
                <div style={{
                    width: this.props.width ?? 50,
                    height: this.props.height ?? 400,
                    border: "1px solid cyan",
                    position: "relative",
                    textAlign: "center",
                    fontSize: "2rem",
                }}>
                    <div style={{
                        width: "100%",
                        height: this.props.value / this.props.max * this.props.height + "px",
                        marginTop: "auto",
                        backgroundColor: this.props.value > this.props.threshold ? "#900" : "#555",
                        position: "absolute",
                        bottom: 0
                    }}/>
                    <div style={{
                        position: "absolute",
                        zIndex: 2,
                        width: "100%"
                    }}>
                        {this.props.value}
                    </div>
                </div>
            </div>
        );
    }
}

export default Meter
