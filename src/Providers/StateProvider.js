import React, { createContext, useReducer, useContext } from 'react';
import storeReducer from '../Reducers';
import LocalstorageCache from '../Services/LocalstorageCache';

const initialState = localStorage.getItem("Choreoculture") ? JSON.parse(localStorage.getItem("Choreoculture"))
  : {
    loggedInUser: {},
    isLoading: null,
    currentLoginFlow: null,
    notification: {
      msg: "",
      type: "",
      time: 3000
    }
  };
const store = createContext(initialState);
const { Provider } = store;

const useStoreConsumer = () => useContext(store);

const StateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(LocalstorageCache(storeReducer), initialState);

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { store, StateProvider, useStoreConsumer }