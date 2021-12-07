import { createSlice } from '@reduxjs/toolkit';

const padConfigSlice = createSlice({
  name: 'padConfig',
  initialState: {},
  reducers: {
    setPadConfig(state, action) {
      state = action.payload;
    },
    setPadThreshold(state, action) {
      state.panels[action.panelIndex].sensors[action.sensorIndex].threshold = action.threshold;
    },
    updatePadConfigFromSettings(state, action) {
      state.general = state.general ?? {};
      state.general.name = action.payload.name;
      state.panels = [...action.payload.panels];
      state.buttons = [...action.payload.buttons];
    }
  }
});

export const selectPadConfig = (state) => state.padConfig;
export const selectPadName = (state) => state.padConfig.general?.name;

// Extract the action creators object and the reducer
const { actions, reducer } = padConfigSlice;
// Extract and export each action creator by name
export const { getPadConfig, setPadConfig, setPadThreshold, updatePadConfigFromSettings } = actions;
// Export the reducer, either as a default or named export
export default reducer;
