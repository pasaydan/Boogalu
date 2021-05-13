import React, { useEffect, useState } from 'react';
import { useStoreConsumer } from '../../Providers/StateProvider';
import { enableLoading, disableLoading } from "../../Actions/Loader";
import ProfileImage from "../ProfileImage";
import { getAllUser } from "../../Services/User.service";
// eslint-disable-next-line no-unused-vars
import { sendEmail } from "../../Services/Email.service";
import { useHistory } from "react-router-dom";
import { Link } from '@material-ui/core';

function ViewAllMembers() {
    const history = useHistory();
    // eslint-disable-next-line no-unused-vars
    const [followButtonText, setFollowButtonText] = useState('Follow');
    const [userList, setUserList] = useState([]);
    const { state, dispatch } = useStoreConsumer();
    const loggedInUser = state.loggedInUser;

    useEffect(() => {
        if (loggedInUser && loggedInUser.key) {
            getAllUserList(loggedInUser.key);
        } else {
            redirectToLogin();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function redirectToLogin() {
        history.push('/login');
    }

    function getAllUserList(userKey) {
        dispatch(enableLoading());
        try {
            getAllUser(userKey).subscribe((users) => {
                dispatch(disableLoading());
                if (users && users.length) {
                    setUserList(users);
                }
            });
        } catch(e) {
            dispatch(disableLoading());
            console.log('Users fetch error: ', e);
        }
    }

    function handleFollowBtnClick(event, toFollow, followBy) {
        event.preventDefault();
        // eslint-disable-next-line no-unused-vars
        const action = event.currentTarget.dataset.action.toLowerCase();
    }

    return (
        <div className="userDashBoardAfterLogin viewAllMemberDashBoard">
            <div className="user-dashboard-wrap">
                <h2>Our members</h2>
                <div className="user-list-wrap">
                    {userList && userList.map((user) => {
                        return (
                        <div 
                            key={user.key} 
                            className="user-icon-wrap userMemberListing" 
                            title={`View ${user.username}`}>
                            <ProfileImage src={user.profileImage} size="medium" />
                            <div className="userNameWrap">
                                <span className="userName">
                                    {user.username}
                                </span>
                                <span className="userFullName">
                                    {user.name}
                                </span>
                                {/* This will be dynamic data */}
                                <span className="followsInfo">Follows you / followed by text</span>
                            </div>
                            <Link 
                            onClick={(event) => handleFollowBtnClick(event, user.key, loggedInUser.key)} 
                            className="btn primary-light followBtn" 
                            data-action={followButtonText}>{followButtonText}</Link>
                        </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default ViewAllMembers;