import React from 'react';
import { useStoreConsumer } from '../../Providers/StateProvider';
import { signupUser } from '../../Actions/User'

export default function Signup() {
    const [state, dispatch] = useStoreConsumer();

    return (
        <div className="logout-wrap">
            <div className="heading">Sign Up</div>
            <div className="input-field">
                <input name="name" value="" placeholder="name" />
            </div>
            <div className="input-field">
                <input name="name" value="" placeholder="name" />
            </div>
            <div className="input-field">
                <input name="name" value="" placeholder="name" />
            </div>
            <div className="input-field">
                <input name="name" value="" placeholder="name" />
            </div>
            <div className="input-field">
                <input name="name" value="" placeholder="name" />
            </div>
            <div className="input-field">
                <input name="name" value="" placeholder="name" />
            </div>
            <div className="input-field">
                <input name="name" value="" placeholder="name" />
            </div>
            <div className="input-field">
                <input name="name" value="" placeholder="name" />
            </div>
            <div className="tnc">
                <span className="checkbox"></span>
                <div className="note">
                    Yes, I agree to the terms and conditions
            </div>
            </div>
            <div className="submit-btn">
                <button>Sign Up</button>
            </div>
            <div className="login-note">
                Already have an account? <span>LOGIN</span>
            </div>
        </div>
    );
}