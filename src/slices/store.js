import { configureStore } from '@reduxjs/toolkit';
import padConfigReducer from './padConfig';
import padValuesReducer from './padValues';
import appSettingsReducer from './appSettings';

const store = configureStore({
  reducer: {
    padConfig: padConfigReducer,
    padValues: padValuesReducer,
    appSettings: appSettingsReducer
  }
});

export default store;
