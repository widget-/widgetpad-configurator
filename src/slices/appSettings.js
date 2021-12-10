import { createSlice } from '@reduxjs/toolkit';

const fpsSmoothingTime = 3000; // ms

const appSettingsSlice = createSlice({
  name: 'appSettings',
  initialState: {
    editing: false,
    darkMode: true,
    showNumericThresholds: true,
    panelHeight: 400,
    uiFrameTimes: []
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
    addUiFrameTime(state) {
      const now = Date.now();
      state.uiFrameTimes = state.uiFrameTimes.filter((time) => (time > now - fpsSmoothingTime));
      state.uiFrameTimes.push(now);
    }
  }
});
export const selectIsEditing = (state) => state.appSettings.isEditing;
export const selectDarkMode = (state) => state.appSettings.darkMode;
export const selectShowNumericThresholds = (state) => state.appSettings.showNumericThresholds;
export const selectPanelHeight = (state) => state.appSettings.panelHeight;
export const selectUiFps = (state) => 1000 * state.appSettings.uiFrameTimes.length / fpsSmoothingTime;


const { actions, reducer } = appSettingsSlice;

export const {
  setIsEditing,
  setDarkMode,
  setShowNumericThresholds,
  setPanelHeight,
  addUiFrameTime
} = actions;

export default reducer;
