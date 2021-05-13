import React, { useEffect, useState } from 'react';
import { useStoreConsumer } from '../../Providers/StateProvider';
import { enableLoading, disableLoading } from "../../Actions/Loader";
import ProfileImage from "../ProfileImage";
import { getAllUser, updateFollowUnfollow } from "../../Services/User.service";
import { sendEmail } from "../../Services/Email.service";
import { useHistory } from "react-router-dom";
import { Link } from '@material-ui/core';

// import { getUserById, updateUser, updateFollowUnfollow } from "../../Services/User.service";


function ViewAllMembers() {
    const history = useHistory();
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
                    let userList = users;
                    let updatedUserList = []
                    users.map((user, index) => {
                        let currentuser = user
                        if (currentuser.notification) {
                            if (currentuser.notification.followRequestedBy && currentuser.notification.followRequestedBy.length > 0) {
                                currentuser.notification.followRequestedBy.map((requestId) => {
                                    if (requestId === loggedInUser.key) {
                                        currentuser = {...currentuser, 'iRequestedFollow': true, actionBtnText: 'Requested'}
                                        updatedUserList.push(currentuser);
                                        // userList = {...userList, currentuser};
                                    }
                                });
                            }
                            if (currentuser.notification.followedBy && currentuser.notification.followedBy.length > 0) {
                                currentuser.notification.followedBy.map((requestId) => {
                                    if (requestId === loggedInUser.key) {
                                        currentuser = {...currentuser, 'imFollowing': true, actionBtnText: 'Following'}
                                        updatedUserList.push(currentuser);
                                    }
                                });
                            }
                        } else {
                            updatedUserList.push(currentuser);
                        }
                    });
                    console.log("updatedUserList" ,updatedUserList);
                    setUserList(updatedUserList);
                }
            });
        } catch(e) {
            dispatch(disableLoading());
            console.log('Users fetch error: ', e);
        }
    }

    function handleFollowBtnClick(event, toFollow, followBy) {
        event.preventDefault();
        const action = event.currentTarget.dataset.action.toLowerCase();
        console.log("action ", action);

        dispatch(enableLoading());
        updateFollowUnfollow(toFollow, followBy, action).subscribe((response) => {
            if (response) {
                const { name, email } = response;
                if (response.followed) {
                    setFollowButtonText('Following')
                }
                if (response.requested) {
                    setFollowButtonText('Requested')
                }
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
                            <Link 
                                onClick={(event) => handleFollowBtnClick(event, user.key, loggedInUser.key)} 
                                className="btn primary-light followBtn" 
                                data-action={user.actionBtnText}>{user.actionBtnText || followButtonText}
                            </Link>
                        </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default ViewAllMembers;