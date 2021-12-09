import { configureStore } from '@reduxjs/toolkit';
import padConfigReducer from './padConfig';
import padValuesReducer from './padValues';

const store = configureStore({
  reducer: {
    padConfig: padConfigReducer,
    padValues: padValuesReducer
  }
});

export default store;
