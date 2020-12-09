import React, { useState, useReducer, createContext } from "react";
import userReducer from "../Reducers/UserReducer";

export const UserContext = createContext();

const initialState = {
    name: "",
    email: "",
    phone: "",
    address: "",
    dob: "",
    password: ""
}

export default (props) => {
    const [user, dispatch] = useReducer(userReducer, initialState);
    return (
        <UserContext.Provider value={{ user, dispatch }}>{props.children}</UserContext.Provider>
    )
}