import { createSlice } from '@reduxjs/toolkit';

const appSettingsSlice = createSlice({
  name: 'appSettings',
  initialState: {
    editing: false,
    darkMode: true,
    showNumericThresholds: true,
    panelHeight: 400
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
    }
  }
});
export const selectIsEditing = (state) => state.appSettings.isEditing;
export const selectDarkMode = (state) => state.appSettings.darkMode;
export const selectShowNumericThresholds = (state) => state.appSettings.showNumericThresholds;
export const selectPanelHeight = (state) => state.appSettings.panelHeight;


const { actions, reducer } = appSettingsSlice;

export const {
  setIsEditing,
  setDarkMode,
  setShowNumericThresholds,
  setPanelHeight
} = actions;

export default reducer;
