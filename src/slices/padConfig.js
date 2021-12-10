import { createSelector, createSlice } from '@reduxjs/toolkit';

const padConfigSlice = createSlice({
  name: 'padConfig',
  initialState: {},
  reducers: {
    setPadConfig(state, action) {
      state.backupConfig = {};
      for (const [key, value] of Object.entries(action.payload)) {
        state[key] = value;
      }
    },
    clearPadConfig(state, action) {
      for (const key of Object.keys(state)) {
        state[key] = undefined;
      }
    },
    setPadThreshold(state, action) {
      state.panels[action.payload.panelIndex].sensors[action.payload.sensorIndex].threshold = action.payload.threshold;
    },
    updatePadConfigFromSettings(state, action) {
      state.general = state.general ?? {};
      state.general.name = action.payload.name;
      state.panels = action.payload.panels;
      state.buttons = action.payload.buttons;
    },
    backupPadConfig(state, action) {
      for (const [key, value] of Object.entries(action.payload)) {
        if (key !== 'backupConfig') {
          state.backupConfig[key] = value;
        }
      }
    },
    restoreBackupPadConfig(state, action) {
      for (const key of Object.keys(state)) {
        if (key !== 'backupConfig') {
          state[key] = undefined;
        }
      }

      for (const key of Object.keys(state.backupConfig)) {
        state[key] = action.payload[key];
      }

      state.backupConfig = {};
    }
  }
});

export const selectPadConfig = (state) => state.padConfig;
export const selectPadName = (state) => state.padConfig.general?.name;
export const selectPanelsCount = (state) => state.padConfig.panels?.length ?? 0;
export const selectConfigPanels = (state) => state.padConfig.panels ?? [];
export const selectSensorsCount = (state) => state.padConfig.panels?.[0]?.sensors?.length ?? 0;

export const createSelectPadConfigSensors = () =>
  createSelector([
    selectPadConfig,
    (state, panelIndex) => panelIndex
  ], (values, panelIndex) => values.panels?.[panelIndex]?.sensors ?? []);
export const createSelectPadConfigSensorThreshold = () =>
  createSelector(
    [selectPadConfig, (state, options) => options],
    (config, options) =>
      config.panels[options.panelIndex]?.sensors?.[options.sensorIndex]?.threshold ?? 0
  );


// Extract the action creators object and the reducer
const { actions, reducer } = padConfigSlice;
// Extract and export each action creator by name
export const {
  setPadConfig,
  clearPadConfig,
  setPadThreshold,
  updatePadConfigFromSettings,
  backupPadConfig,
  restoreBackupPadConfig
} = actions;
// Export the reducer, either as a default or named export
export default reducer;
