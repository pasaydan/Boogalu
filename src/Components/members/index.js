import React, { useEffect, useState } from 'react';
import { useStoreConsumer } from '../../Providers/StateProvider';
import { enableLoading, disableLoading } from "../../Actions/Loader";
import ProfileImage from "../ProfileImage";
import { getAllUser, updateFollowUnfollow } from "../../Services/User.service";
import { useHistory } from "react-router-dom";
import { getUniqueArrayOfObject } from '../../helpers';

// import { getUserById, updateUser, updateFollowUnfollow } from "../../Services/User.service";


function ViewAllMembers() {
    const history = useHistory();
    // eslint-disable-next-line no-unused-vars
    const [followButtonText, setFollowButtonText] = useState('Follow');
    const [userList, setUserList] = useState([]);
    const { state, dispatch } = useStoreConsumer();
    const loggedInUser = state.loggedInUser;

    useEffect(() => {
        if (loggedInUser && loggedInUser.key) {
            setUserList([]);
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
                let updatedUserList = [];
                if (users && users.length) {
                    users.forEach(user => {
                        let currentuser = user;
                        if (currentuser.notification) {
                            if (currentuser.notification.followRequestedBy && currentuser.notification.followRequestedBy.length > 0) {
                                currentuser.notification.followRequestedBy.forEach((requestId) => {
                                    if (requestId === loggedInUser.key) {
                                        currentuser = {...currentuser, 'iRequestedFollow': true, actionBtnText: 'Requested'}
                                        updatedUserList.push(currentuser);
                                        // userList = {...userList, currentuser};
                                    }
                                });
                            }
                            if (currentuser.notification.followedBy && currentuser.notification.followedBy.length > 0) {
                                currentuser.notification.followedBy.forEach((requestId) => {
                                    if (requestId === loggedInUser.key) {
                                        currentuser = {...currentuser, 'imFollowing': true, actionBtnText: 'Following'}
                                        updatedUserList.push(currentuser);
                                    }
                                });
                            }
                        } else {
                            currentuser = {...currentuser, actionBtnText: 'Follow'}
                            updatedUserList.push(currentuser);
                        }
                    });
                    const updatedUniqueList = getUniqueArrayOfObject(updatedUserList, 'key');
                    setUserList(updatedUniqueList);
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
        const action = event?.currentTarget?.dataset?.action?.toLowerCase();
        console.log("action ", action);

        dispatch(enableLoading());
        updateFollowUnfollow(toFollow, followBy, action).subscribe((response) => {
            if (response) {
                const { name, email } = response;
                console.log('Name: ', name);
                console.log('Email: ', email);
                setUserList([]);
                getAllUserList(loggedInUser.key);
            }
            dispatch(disableLoading());
        });
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
                            <button 
                                onClick={(event) => handleFollowBtnClick(event, user.key, loggedInUser.key)} 
                                className="btn primary-light followBtn" 
                                data-action={user.actionBtnText}>
                                    {user.actionBtnText}
                            </button>
                        </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default ViewAllMembers;