import React, { createContext, useReducer, useContext } from 'react';
import storeReducer from '../Reducers';
import LocalstorageCache from '../Services/LocalstorageCache';

const loggedInUserState = {
  name: '',
  username: '',
  email: '',
  phone: '',
  dob: '2017-05-24',
  gender: '',
  country: '',
  state: '',
  password: '',
  confirmPassword: '',
  bio: '',
  tnc: true,
  profileImage: '',
  source: ''
}



const initialState = localStorage.getItem("Choreoculture") ? JSON.parse(localStorage.getItem("Choreoculture"))
  : {
    loggedInUser: loggedInUserState,
    competitionLogginFlow: false
  };
const store = createContext(initialState);
const { Provider } = store;

const useStoreConsumer = () => useContext(store);

const StateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(LocalstorageCache(storeReducer), initialState);

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { store, StateProvider, useStoreConsumer }