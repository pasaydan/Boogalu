import React from 'react'
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';

export default function ProfileImage({ src, size }) {
    return (
        <div className={`profile-image-wrap ${size}`}>
            {src ? <img src={src} alt="user profile" /> : <AccountCircleOutlinedIcon />}
        </div>
    )
}