const LocalStorageCache = reducer => {
  return (state, action) => {
    const newState = reducer(state, action);
    localStorage.setItem("Boogalu", JSON.stringify(newState));
    return newState;
  }
};
export default LocalStorageCache;