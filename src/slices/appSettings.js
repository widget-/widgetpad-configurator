import { createSlice } from '@reduxjs/toolkit';

const fpsSmoothingTime = 3000; // ms

const appSettingsSlice = createSlice({
  name: 'appSettings',
  initialState: {
    editing: false,
    darkMode: true,
    showNumericThresholds: true,
    panelHeight: 400,
    uiFrameTimes: {
      rx: [],
      tx: []
    }
  },
  reducers: {
    setIsEditing(state, action) {
      state.isEditing = action.payload;
    },
    setDarkMode(state, action) {
      state.darkMode = action.payload;
    },
    setShowNumericThresholds(state, action) {
      state.showNumericThresholds = action.payload;
    },
    setPanelHeight(state, action) {
      state.panelHeight = action.payload;
    },
    addUiFrameTime(state, action) {
      const now = Date.now();
      const direction = action.payload;
      if (direction !== 'rx' && direction !== 'tx') {
        console.error('Invalid Frametime type. Use rx or tx.');
        return;
      }
      state.uiFrameTimes[direction] = state.uiFrameTimes[direction].filter((time) => (time > now - fpsSmoothingTime));
      state.uiFrameTimes[direction].push(now);
    }
  }
});
export const selectIsEditing = (state) => state.appSettings.isEditing;
export const selectDarkMode = (state) => state.appSettings.darkMode;
export const selectShowNumericThresholds = (state) => state.appSettings.showNumericThresholds;
export const selectPanelHeight = (state) => state.appSettings.panelHeight;
export const selectUiRxFps = (state) => 1000 * state.appSettings.uiFrameTimes.rx.length / fpsSmoothingTime;
export const selectUiTxFps = (state) => 1000 * state.appSettings.uiFrameTimes.tx.length / fpsSmoothingTime;


const { actions, reducer } = appSettingsSlice;

export const {
  setIsEditing,
  setDarkMode,
  setShowNumericThresholds,
  setPanelHeight,
  addUiFrameTime
} = actions;

export default reducer;
