import React, { useEffect, useState } from "react";
import { getUploadedVideosList } from "../../Services/UploadedVideo.service";
import {
  updateVideoLikes,
  updateVideoComments,
} from "../../Services/UploadedVideo.service";
import {
  getLimitedUser,
  getUserPublicProfile,
} from "../../Services/User.service";
import FavoriteBorder from "@material-ui/icons/FavoriteBorder";
import Favorite from "@material-ui/icons/Favorite";
import CommentOutlined from "@material-ui/icons/CommentOutlined";
import { useStoreConsumer } from "../../Providers/StateProvider";
import VideoDetails from "../VideoDetails";
import ProfileImage from "../ProfileImage";
import VideoPlayer from "../Vedio/Video";
import { getUserById } from "../../Services/User.service";
import { sendEmail } from "../../Services/Email.service";
import { Link } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { logAnalyticsEvent } from "../../Services/analytics.service";
import Loader from "../Loader";
import {
  displayNotification,
  removeNotification,
} from "../../Actions/Notification";
import { NOTIFICATION_ERROR } from "../../Constants";
function Feeds() {
  const history = useHistory();
  // eslint-disable-next-line no-unused-vars
  const { REACT_APP_URL } = process.env;
  // eslint-disable-next-line no-unused-vars
  const [followButtonText, setFollowButtonText] = useState("Follow");
  const [feedList, setFeedList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [activeVideoObj, setActiveVideoObj] = useState({});
  const [clickedUserDetails, setClickedUserDetails] = useState(null);
  const [commentModal, setCommentModal] = useState(false);
  const [isLoaderActive, toggleLoading] = useState(false);
  const { state, dispatch } = useStoreConsumer();
  const loggedInUser = state.loggedInUser;


  useEffect(() => {
    logAnalyticsEvent('page_view', {
      page_location: window.location.href,
      page_path: 'feeds',
      page_title: `HomePage-${window.location.href}`
    });
  }, [])

  const getAllUserList = () => {
    return new Promise((res, rej) => {
      getLimitedUser(loggedInUser.key).subscribe((users) => {
        setUserList(users);
        res(users);
      });
    });
  };

  const getAllUploadedVideos = () => {
    return new Promise((res, rej) => {
      getUploadedVideosList().subscribe((videos) => {
        res(videos);
      });
    });
  };

  const handleLikes = (video, status) => {
    let videoObj = { ...video };
    if (status === "liked") {
      if (videoObj.likes) {
        videoObj.likes.push({ value: 1, userId: loggedInUser.key });
      } else {
        videoObj.likes = [{ value: 1, userId: loggedInUser.key }];
      }
    } else {
      let likes = videoObj.likes.filter(
        (data) => data.userId !== loggedInUser.key
      );
      videoObj.likes = likes;
    }
    videoObj.likes.forEach((likeObj) => {
      delete likeObj.profileImage;
      delete likeObj.username;
    });
    updateVideoLikes(videoObj.key, videoObj).subscribe(() => {
      let feedListCopy = [...feedList];
      feedListCopy.forEach((feed) => {
        if (feed.key === videoObj.key) {
          feed.likes = videoObj.likes;
        }

        if (feed.likes && feed.likes.length) {
          let isAvail = feed.likes.filter(
            (data) => data.userId === loggedInUser.key
          );
          isAvail.length > 0 ? (feed.isLiked = true) : (feed.isLiked = false);
        } else {
          feed.isLiked = false;
        }
        addUserDetailsToFeed(feed, userList);
      });
      setFeedList(feedListCopy);
    });
  };

  const handleComments = (commentString) => {
    let videoObj = { ...activeVideoObj };
    if (videoObj.comments) {
      videoObj.comments.push({
        value: commentString,
        userId: loggedInUser.key,
      });
    } else {
      videoObj.comments = [{ value: commentString, userId: loggedInUser.key }];
    }

    videoObj.comments.forEach((commentObj) => {
      delete commentObj.profileImage;
      delete commentObj.username;
    });
    updateVideoComments(videoObj.key, videoObj).subscribe(() => {
      let feedListCopy = [...feedList];
      feedListCopy.forEach((feed) => {
        if (feed.key === videoObj.key) {
          feed.comments = videoObj.comments;
        }
        addUserDetailsToFeed(feed, userList);
      });
      setFeedList(feedListCopy);
    });
  };

  const handleCommentClick = (video) => {
    getUserById(video.userId).subscribe((userData) => {
      setClickedUserDetails(userData);
      setCommentModal(true);
      setActiveVideoObj(video);
    });
  };

  const addUserDetailsToFeed = (feed, allUser) => {
    if (feed.likes && feed.likes.length) {
      feed.likes.forEach((likeObj) => {
        let userData = allUser.filter(
          (userObj) => userObj.key === likeObj.userId
        );
        if (userData.length !== 0) {
          likeObj.username = userData[0]?.username;
          likeObj.profileImage = userData[0]?.profileImage;
        }
      });
    }
    if (feed.comments && feed.comments.length) {
      feed.comments.forEach((commentObj) => {
        let userData = allUser.filter(
          (userObj) => userObj.key === commentObj.userId
        );
        if (userData.length !== 0) {
          commentObj.username = userData[0]?.username;
          commentObj.profileImage = userData[0]?.profileImage;
        }
      });
    }
  };

  useEffect(() => {
    toggleLoading(true);
    try {
      Promise.all([getAllUserList(), getAllUploadedVideos()]).then((data) => {
        toggleLoading(false);
        let tempUserList = data[0];
        let tempFeedList = data[1];

        tempUserList.forEach((user) => {
          tempFeedList.forEach((feed) => {
            if (user.key === feed.userId) {
              feed.userEmail = user.email;
              feed.username = user.name;
              feed.profileImage = user.profileImage;
              feed.privacy = user.privacy || "Public";
              user.isAnyVideoSubmitted = true;
              if (user.followRequestedBy && user.followRequestedBy.length > 0) {
                user.followRequestedBy.forEach((requestId) => {
                  if (requestId === loggedInUser.key) {
                    user = {
                      ...user,
                      iRequestedFollow: true,
                      actionBtnText: "requested",
                    };
                  }
                });
              }
              if (user.followedBy && user.followedBy.length > 0) {
                user.followedBy.forEach((requestId) => {
                  if (requestId === loggedInUser.key) {
                    user = {
                      ...user,
                      imFollowing: true,
                      actionBtnText: "following",
                    };
                  }
                });
              }
            }
            if (feed.likes && feed.likes.length) {
              let isAvail = feed.likes.filter(
                (data) => data.userId === loggedInUser.key
              );
              isAvail.length > 0
                ? (feed.isLiked = true)
                : (feed.isLiked = false);
            } else {
              feed.isLiked = false;
            }
            addUserDetailsToFeed(feed, tempUserList);
          });
        });
        setFeedList(tempFeedList);
        setUserList(tempUserList);
      });
    } catch (e) {
      console.log("video user loading erro: ", e);
      toggleLoading(false);
      dispatch(
        displayNotification({
          msg: "Something went wrong! Please reload and try again!",
          type: NOTIFICATION_ERROR,
          time: 5000,
        })
      );
      setTimeout(() => {
        dispatch(
          removeNotification({
            msg: "",
            type: NOTIFICATION_ERROR,
            time: 0,
          })
        );
      }, 5000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function redirectViewAllUsers() {
    history.push("/members");
  }

  function openUserStory(user) {
    let currentuser = user;
    currentuser = { ...currentuser, actionBtnText: "Follow" };
    if (currentuser) {
      if (
        currentuser.followRequestedBy &&
        currentuser.followRequestedBy.length > 0
      ) {
        currentuser.followRequestedBy.forEach((requestId) => {
          if (requestId === loggedInUser.key) {
            currentuser = {
              ...currentuser,
              iRequestedFollow: true,
              actionBtnText: "requested",
            };
          }
        });
      }
      if (currentuser.followedBy && currentuser.followedBy.length > 0) {
        currentuser.followedBy.forEach((requestId) => {
          if (requestId === loggedInUser.key) {
            currentuser = {
              ...currentuser,
              imFollowing: true,
              actionBtnText: "following",
            };
          }
        });
      }
    }
    let userVdos = feedList.filter((feed) => currentuser.key === feed.userId);
    setActiveVideoObj({});
    if (userVdos.length) {
      setActiveVideoObj(userVdos[0]);
    }
    setClickedUserDetails(currentuser);
    setCommentModal(true);
  }

  const getUserData = (user) => {
    getUserPublicProfile(user.email).subscribe((response) => {
      if (response && response.length > 0) {
        const tempProfileData = response[0];
        setClickedUserDetails(tempProfileData);
        toggleLoading(false);
        toggleLoading(false);
      }
    });
  };

  // eslint-disable-next-line no-unused-vars
  const sendFollowNotificationEmail = (name, email, subject, message) => {
    let emailBody = `<div>
        <p>Hi ${name}, ${message}</p>. 
        </div>`;
    let payload = {
      mailTo: email,
      title: subject,
      content: emailBody,
    };
    toggleLoading(true);
    try {
      sendEmail(payload).subscribe((res) => {
        toggleLoading(false);
        if (!("error" in res)) {
          console.log("Follow request Send Successfully.");
        } else {
          console.log("User Email Send Failed.");
        }
        // fetchUsersVideoDetails(null, userKey);
      });
    } catch (e) {
      console.log("email sent error: ", e);
      toggleLoading(false);
      dispatch(
        displayNotification({
          msg: "Something went wrong! Please reload and try again!",
          type: NOTIFICATION_ERROR,
          time: 5000,
        })
      );
      setTimeout(() => {
        dispatch(
          removeNotification({
            msg: "",
            type: NOTIFICATION_ERROR,
            time: 0,
          })
        );
      }, 5000);
    }
  };
  return (
    <div className="userDashBoardAfterLogin paddingTop90">
      <Loader value={isLoaderActive} />
      <div className="user-dashboard-wrap">
        {userList && userList.length ? (
          <div className="suggestViewAllWrap">
            <span>Members of Boogaluu family</span>&nbsp;
            <Link
              onClick={() => redirectViewAllUsers()}
              className="viewAllLink"
            >
              View all
            </Link>
          </div>
        ) : (
          ""
        )}
        {userList && userList.length ? (
          <div className="user-list-wrap">
            {userList.map((user) => {
              return (
                <div
                  key={user.key}
                  className="user-icon-wrap"
                  title={`View ${user.username}`}
                  onClick={() => openUserStory(user)}
                >
                  <ProfileImage src={user.profileImage} size="medium" />
                  <div className="userName">{user.username}</div>
                </div>
              );
            })}
          </div>
        ) : (
          ""
        )}
        <div className="feed-dashboard-wrap">
          {/* <div className="loggedin-user">
                        <div>
                            <ProfileImage src={loggedInUser.profileImage} />
                            <div>
                                <div>{loggedInUser.username}</div>
                                <div className="username">{loggedInUser.name}</div>
                            </div>
                        </div>
                    </div> */}
          <div className="feed-wrap">
            {feedList && feedList.length
              ? feedList.map((feed) => {
                return (
                  <div key={feed.key} className="feed-card">
                    <div>
                      <VideoPlayer vdoObj={feed} />
                    </div>
                    <div className="username">
                      <ProfileImage src={feed.profileImage} />
                      <span className="name">{feed.username}</span>
                    </div>
                    <div className="video-title-like-wrap">
                      <div className="title">{feed.title}</div>
                      <div className="like-comment">
                        {feed.likes && feed.likes.length > 0 && (
                          <div className="likes-count">
                            {feed.likes.length}{" "}
                            {feed.likes.length > 1 ? "Likes" : "Like"}
                          </div>
                        )}
                        {!feed.isLiked && (
                          <FavoriteBorder
                            title="Unlike"
                            onClick={() => handleLikes(feed, "liked")}
                          />
                        )}
                        {feed.isLiked && (
                          <Favorite
                            title="Like"
                            onClick={() => handleLikes(feed, "unliked")}
                          />
                        )}
                        <CommentOutlined
                          title="comment"
                          onClick={() => handleCommentClick(feed)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
              : ""}
          </div>
        </div>
      </div>
      {commentModal && (
        <VideoDetails
          handleClose={() => setCommentModal(false)}
          handleLikes={handleLikes}
          handleComments={handleComments}
          videoObj={activeVideoObj}
          loggedInUser={loggedInUser}
          callbackHandler={getUserData}
          BtnText={followButtonText}
          clickedUser={clickedUserDetails}
        />
      )}
    </div>
  );
}

export default Feeds;
