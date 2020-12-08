import React, { useEffect, useContext, useState } from 'react';
// import './Login.css'
import { UserContext } from '../../Providers/UserProvider';
import { Redirect } from 'react-router-dom';
import {GoogleLogin,GoogleLogout} from 'react-google-login';

export default function Login() {
    const user = useContext(UserContext)
    const [redirect, setredirect] = useState(null)

    useEffect(() => {
        if (user) {
            setredirect('/dashboard')
        }
    }, [user])
    if (redirect) {
        <Redirect to={redirect} />
    }
    const responseGoogle = (response) => {
        console.log(response);
        var res = response.profileObj;
        console.log(res);
        setredirect('/dashboard')
        // Name: res.profileObj.name,
        // email: res.profileObj.email,
        // token: res.googleId,
        // Image: res.profileObj.imageUrl,
        // ProviderId: 'Google'
        // this.signup(response);
    }
    const logout = () => {
        console.log('logout success')
    }
    return (
        <div className="login-buttons">
            <GoogleLogin
                clientId="417866547364-mesv7a9cn6bj4n3ge45s8b6hhl1vdam0.apps.googleusercontent.com"
                buttonText="Login"
                onSuccess={responseGoogle}
                onFailure={responseGoogle} >
            </GoogleLogin>
{/* 
            <GoogleLogout
                clientId="417866547364-mesv7a9cn6bj4n3ge45s8b6hhl1vdam0.apps.googleusercontent.com"
                buttonText="Logout"
                onLogoutSuccess={logout}>
            </GoogleLogout> */}
        </div>
    );
}