import React, { useEffect, useState } from "react";
import { useStoreConsumer } from "../../Providers/StateProvider";
import ProfileImage from "../ProfileImage";
import { getAllUser } from "../../Services/User.service";
import { useHistory } from "react-router-dom";
import FollowButton from "../FollowButton";
import Loader from "../Loader";
import { logAnalyticsEvent } from "../../Services/analytics.service";
// import { getUserById, updateUser, updateFollowUnfollow } from "../../Services/User.service";

function ViewAllMembers() {
  const history = useHistory();
  // eslint-disable-next-line no-unused-vars
  const [followButtonText, setFollowButtonText] = useState("Follow");
  // const [followStatus, setFollowStatus] = useState("");
  const [userList, setUserList] = useState([]);
  const { state } = useStoreConsumer();
  const loggedInUser = state.loggedInUser;
  const [isLoaderActive, toggleLoading] = useState(false);

  useEffect(() => {
    logAnalyticsEvent('page_view', {
      page_location: window.location.href,
      page_path: 'view-members',
      page_title: 'HomePage' + '-' + window.location.href
    });
  }, [])

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
    toggleLoading(true);
    try {
      getAllUser(userKey).subscribe((users) => {
        setUserList([]);
        let updatedUserList = [];
        toggleLoading(false);
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
                      followButtonStatus: "following",
                    };
                    // setFollowStatus("following");
                  } else {
                    updatedUserList[index] = {
                      ...updatedUserList[index],
                      followButtonStatus: "",
                    };
                    // setFollowStatus("");
                  }
                } else {
                  updatedUserList[index] = {
                    ...updatedUserList[index],
                    followButtonStatus: "",
                  };
                  // setFollowStatus("");
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
                        followButtonStatus: "requested",
                      };
                      // setFollowStatus("requested");
                    } else {
                      updatedUserList[index] = {
                        ...updatedUserList[index],
                        followButtonStatus: "",
                      };
                      // setFollowStatus("");
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
                        followButtonStatus: "following",
                      };
                      // setFollowStatus("following");
                    } else {
                      updatedUserList[index] = {
                        ...updatedUserList[index],
                        followButtonStatus: "",
                      };
                      // setFollowStatus("");
                    }
                  } else {
                    updatedUserList[index] = {
                      ...updatedUserList[index],
                      followButtonStatus: "",
                    };
                    // setFollowStatus("");
                  }
                } else {
                  updatedUserList[index] = {
                    ...updatedUserList[index],
                    followButtonStatus: "",
                  };
                  // setFollowStatus("");
                }
              } else {
                updatedUserList[index] = {
                  ...updatedUserList[index],
                  followButtonStatus: "",
                };
                // setFollowStatus("");
              }
            }
          }
          setUserList(updatedUserList);
        }
      });
      toggleLoading(false);
    } catch (e) {
      toggleLoading(false);
      console.log("Users fetch error: ", e);
    }
  }

  const callbackHandler = () => {
    setUserList([]);
    getAllUserList(loggedInUser.key);
  };

  const redirectToUserProfile = (event, user) => {
    history.push(`/profile/${window.btoa(user.email)}`);
  };

  return (
    <div className="userDashBoardAfterLogin viewAllMemberDashBoard paddingTop90">
      <Loader value={isLoaderActive} />
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
                  <ProfileImage
                    src={user.profileImage}
                    size="medium"
                    onClick={(e) => redirectToUserProfile(e, user)}
                  />
                  <div
                    className="userNameWrap"
                    onClick={(e) => redirectToUserProfile(e, user)}
                  >
                    <span className="userName">{user.username}</span>
                    <span className="userFullName">{user.name}</span>
                    {/* This will be dynamic data */}
                    <span className="followsInfo">
                      Follows you / followed by text
                    </span>
                  </div>

                  <FollowButton
                    status={user.followButtonStatus}
                    onClickHandler={callbackHandler}
                    user={user}
                    loggedInUser={loggedInUser}
                  />
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default ViewAllMembers;
