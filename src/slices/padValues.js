import { createSelector, createSlice } from '@reduxjs/toolkit';

const padValues = createSlice({
  name: 'padValues',
  initialState: {
    panels: [],
    buttons: []
  },
  reducers: {
    setPadValues(state, action) {
      state.panels = action.payload.panels;
      state.buttons = action.payload.buttons;
    },
    clearPadValues(state, action) {
      state.panels = [];
      state.buttons = [];
    },
    setPadValue(state, action) {
      state.panels[action.payload.panelIndex].sensors[action.payload.sensorIndex].value = action.payload.value;
    },
    setButtonValue(state, action) {
      state.buttons[action.payload.buttonIndex].pressed = action.payload.pressed;
    },
    setPanelCount(state, action) {
      const panelCount = action.payload.panelCount;
      const sensorCount = action.payload.sensorCount;
      state.panels = Array(panelCount).fill(0).map(() =>
        Array(sensorCount).fill(0).map(() => ({
          value: 0,
          pressed: false
        }))
      );
    },
    setButtonCount(state, action) {
      const buttonCount = action.payload.panelCount;
      state.panels = Array(buttonCount).fill(0).map(() => ({
        pressed: false
      }));
    }
  }
});

export const selectPadValues = state => state.padValues;

export const createSelectPadValuesSensors = () =>
  createSelector(
    [selectPadValues, (state, panelIndex) => panelIndex],
    (values, panelIndex) => (values.panels[panelIndex]?.sensors ?? [])
  );
export const createSelectPadValuesSensor = () =>
  createSelector(
    [selectPadValues, (state, options) => options],
    (values, options) =>
      (values.panels[options.panelIndex]?.sensors?.[options.sensorIndex] ?? {
        pressed: false,
        value: 0
      })
  );

// Extract the action creators object and the reducer
const { actions, reducer } = padValues;
// Extract and export each action creator by name
export const {
  setPadValues,
  clearPadValues,
  setPadValue,
  setPanelCount
} = actions;
// Export the reducer, either as a default or named export
export default reducer;
