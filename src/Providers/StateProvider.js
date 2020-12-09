import React, { createContext, useReducer, useContext } from 'react';
import storeReducer from '../Reducers';

const initialState = {};
const store = createContext(initialState);
const { Provider } = store;

const useStoreConsumer = () => useContext(store);

const StateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(storeReducer, initialState);

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { store, StateProvider, useStoreConsumer }