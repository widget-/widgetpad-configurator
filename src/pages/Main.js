import React from 'react';
import Panel from '../components/Panel';
import { selectConfigPanels } from '../actions/padConfig';
import { useSelector } from 'react-redux';


function Main(props) {
  const panels = useSelector(selectConfigPanels);

  return <div style={ { display: "flex", flexWrap: "wrap", padding: "0 10px" } }>
    {
      panels?.map((panel, panelIndex) => {

        return <Panel
          max={ 1024 }
          key={ panelIndex }
          editing={ props.editing }
          panelIndex={ panelIndex }
        />;
      })
    }</div>;
}

export default React.memo(Main);
