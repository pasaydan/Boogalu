import React, { useEffect, useContext, useState } from 'react';
import { UserContext } from '../../Providers/UserProvider';
import { Redirect } from 'react-router-dom';
import { GoogleLogout } from 'react-google-login';

export default function Signup() {
    const user = useContext(UserContext);
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
  
    return (
        <div className="login-section">
            <GoogleLogin
                clientId="417866547364-mesv7a9cn6bj4n3ge45s8b6hhl1vdam0.apps.googleusercontent.com"
                buttonText="Login with google"
                onSuccess={responseGoogle}
                onFailure={responseGoogle} >
            </GoogleLogin>
            <div className="seprator-or">
                <span>OR</span>
            </div>
            <div className="input-login">
                <input placeholder="Enter email or phone" />
                <input placeholder="Enter your password" />
            </div>
            <div className="forgot-password">
                Forgot your password?
            </div>
            <div className="submit">
                <button>Log In</button>
            </div>
            <div className="signup">
                <div>Don't have an account? </div>
                <div>Sign Up</div>
            </div>
        </div>
    );
}