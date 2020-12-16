const LocalStorageCache = reducer => {
  return (state, action) => {
    const newState = reducer(state, action);
    localStorage.setItem("Choreoculture", JSON.stringify(newState));
    return newState;
  }
};
export default LocalStorageCache;