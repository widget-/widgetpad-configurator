import { createSlice } from '@reduxjs/toolkit';
import { getPadConfig } from './padConfig';

const settingsDialogSlice = createSlice({
  name: 'settingsDialog',
  initialState: {},
  reducers: {
    setInitialSettings(state, action) {
      state.formSettings = getPadConfig();
    }
  }
});


// Extract the action creators object and the reducer
const { actions, reducer } = settingsDialogSlice;
// Extract and export each action creator by name
// export const { getPadConfig } = actions;
// Export the reducer, either as a default or named export
export default reducer;
