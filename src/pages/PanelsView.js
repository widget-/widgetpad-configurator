import React from 'react';
import Panel from '../components/Panel';
import { selectConfigPanels } from '../slices/padConfig';
import { useSelector } from 'react-redux';


function PanelsView(props) {
  const panels = useSelector(selectConfigPanels);

  return <div style={ { display: "flex", flexWrap: "wrap", padding: "0 10px" } }>
    {
      panels?.map((panel, panelIndex) => {

        return <Panel
          max={ 1024 }
          key={ panelIndex }
          panelIndex={ panelIndex }
        />;
      })
    }</div>;
}

export default React.memo(PanelsView);
