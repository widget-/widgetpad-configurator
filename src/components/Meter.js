import * as React from 'react';

function Meter(props) {
  return (
    <div>
      <div style={ {
        width: props.width ?? 50,
        height: props.height ?? 400,
        border: "1px solid cyan",
        position: "relative",
        textAlign: "center",
        fontSize: "2rem"
      } }>
        <div style={ {
          width: "100%",
          height: props.value / props.max * props.height + "px",
          marginTop: "auto",
          backgroundColor: props.value > props.threshold ? "#900" : "#555",
          position: "absolute",
          bottom: 0
        } }/>
        <div style={ {
          position: "absolute",
          zIndex: 2,
          width: "100%"
        } }>
          { props.value }
        </div>
      </div>
    </div>
  );
}

export default Meter;
