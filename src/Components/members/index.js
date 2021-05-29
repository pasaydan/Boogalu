import React, { useEffect, useState } from "react";
import { useStoreConsumer } from "../../Providers/StateProvider";
import { enableLoading, disableLoading } from "../../Actions/Loader";
import ProfileImage from "../ProfileImage";
import { getAllUser } from "../../Services/User.service";
import { updateFollowUnfollow } from "../../Services/Friendship.service";
import { updateNotification } from "../../Services/Notifications.service";
import { useHistory } from "react-router-dom";
// import { getUserById, updateUser, updateFollowUnfollow } from "../../Services/User.service";

function ViewAllMembers() {
  const history = useHistory();
  // eslint-disable-next-line no-unused-vars
  const [followButtonText, setFollowButtonText] = useState("Follow");
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
    history.push("/login");
  }

  function getAllUserList(userKey) {
    dispatch(enableLoading());
    try {
      getAllUser(userKey).subscribe((users) => {
        setUserList([]);
        let updatedUserList = [];
        dispatch(disableLoading());
        if (users && users.length) {
          users.forEach((user, userIndex) => {
            let currentuser = user;
            if (currentuser && !currentuser.privacy) {
              currentuser = { ...currentuser, privacy: "public" };
            }
            updatedUserList.push(currentuser);
          });
          if (updatedUserList.length) {
            for (let index = 0; index < updatedUserList.length; index++) {
              let userItem = updatedUserList[index];
              if (userItem.privacy.toLowerCase() === "public") {
                if (userItem.followedBy && userItem.followedBy.length > 0) {
                  const amIFollowing = userItem.followedBy.filter(
                    (requestId) => requestId === loggedInUser.key
                  );
                  if (amIFollowing && amIFollowing.length > 0) {
                    updatedUserList[index] = {
                      ...updatedUserList[index],
                      imFollowing: true,
                      actionBtnText: "Following",
                    };
                  } else {
                    updatedUserList[index] = {
                      ...updatedUserList[index],
                      actionBtnText: "Follow",
                    };
                  }
                } else {
                  updatedUserList[index] = {
                    ...updatedUserList[index],
                    actionBtnText: "Follow",
                  };
                }
              } else if (userItem.privacy.toLowerCase() === "private") {
                if (userItem) {
                  if (
                    userItem.followRequestedBy &&
                    userItem.followRequestedBy.length > 0
                  ) {
                    const amIFollowing = userItem.followRequestedBy.filter(
                      (requestId) => requestId === loggedInUser.key
                    );
                    if (amIFollowing && amIFollowing.length > 0) {
                      updatedUserList[index] = {
                        ...updatedUserList[index],
                        iRequestedFollow: true,
                        actionBtnText: "Requested",
                      };
                    } else {
                      updatedUserList[index] = {
                        ...updatedUserList[index],
                        actionBtnText: "Follow",
                      };
                    }
                  } else if (
                    userItem.followedBy &&
                    userItem.followedBy.length > 0
                  ) {
                    const amIFollowing = userItem.followedBy.filter(
                      (requestId) => requestId === loggedInUser.key
                    );
                    if (amIFollowing && amIFollowing.length > 0) {
                      updatedUserList[index] = {
                        ...updatedUserList[index],
                        imFollowing: true,
                        actionBtnText: "Following",
                      };
                    } else {
                      updatedUserList[index] = {
                        ...updatedUserList[index],
                        actionBtnText: "Follow",
                      };
                    }
                  } else {
                    updatedUserList[index] = {
                      ...updatedUserList[index],
                      actionBtnText: "Follow",
                    };
                  }
                } else {
                  updatedUserList[index] = {
                    ...updatedUserList[index],
                    actionBtnText: "Follow",
                  };
                }
              } else {
                updatedUserList[index] = {
                  ...updatedUserList[index],
                  actionBtnText: "Follow",
                };
              }
            }
          }
          setUserList(updatedUserList);
        }
      });
    } catch (e) {
      dispatch(disableLoading());
      console.log("Users fetch error: ", e);
    }
  }

  function handleFollowBtnClick(event, toFollowUser, followByUser) {
    event.preventDefault();
    // eslint-disable-next-line no-unused-vars
    const action = event?.currentTarget?.dataset?.action?.toLowerCase();
    console.log("action ", action);

    dispatch(enableLoading());
    updateFollowUnfollow(toFollowUser, followByUser, action).subscribe(
      (response) => {
        if (response) {
          const { name, email } = response;
          console.log("Name: ", name);
          console.log("Email: ", email);
          if (response) {
            let notificationData = {};
            if (response.followed || response.requested) {
              notificationData = {
                notify: toFollowUser,
                action: response.followed ? "following" : "requested",
                user: followByUser,
                createdAt: new Date(),
              };
            }
            if (notificationData && Object.keys(notificationData).length > 0) {
              updateNotification(notificationData).subscribe((reponse) => {
                console.log("reponse", reponse);
              });
            }
          }
          //   updateNotification(toFollowUser);
          setUserList([]);
          getAllUserList(loggedInUser.key);
        }
        dispatch(disableLoading());
      }
    );
  }

  return (
    <div className="userDashBoardAfterLogin viewAllMemberDashBoard">
      <div className="user-dashboard-wrap">
        <h2>Our members</h2>
        <div className="user-list-wrap">
          {userList &&
            userList.map((user) => {
              return (
                <div
                  key={user.key}
                  className="user-icon-wrap userMemberListing"
                  title={`View ${user.username}`}
                >
                  <ProfileImage src={user.profileImage} size="medium" />
                  <div className="userNameWrap">
                    <span className="userName">{user.username}</span>
                    <span className="userFullName">{user.name}</span>
                    {/* This will be dynamic data */}
                    <span className="followsInfo">
                      Follows you / followed by text
                    </span>
                  </div>
                  <button
                    onClick={(event) =>
                      handleFollowBtnClick(event, user, loggedInUser)
                    }
                    className="btn primary-light followBtn"
                    data-action={user.actionBtnText}
                  >
                    {user.actionBtnText}
                  </button>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default ViewAllMembers;
