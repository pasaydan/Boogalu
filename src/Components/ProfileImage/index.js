import React from 'react'
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';

export default function ProfileImage({ src, type }) {
    return (
        <div className={type == 'large' ? 'profile-image-wrap large-image' : 'profile-image-wrap small-image'}>
            {src ? <img src={src} alt="user profile" /> : <AccountCircleOutlinedIcon />}
        </div>
    )
}