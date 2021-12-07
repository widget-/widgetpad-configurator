import { configureStore } from '@reduxjs/toolkit';
import padConfigReducer from './padConfig';
import settingsDialogReducer from './settingsDialog';

const store = configureStore({
  reducer: {
    padConfig: padConfigReducer,
    settingsDialog: settingsDialogReducer
  }
});

export default store;
