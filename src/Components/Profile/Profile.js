import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { useStoreConsumer } from "../../Providers/StateProvider";
import AccountCircleOutlinedIcon from "@material-ui/icons/AccountCircleOutlined";
import LoyaltyOutlinedIcon from "@material-ui/icons/LoyaltyOutlined";
import CollectionsOutlinedIcon from "@material-ui/icons/CollectionsOutlined";
import PropTypes from "prop-types";
import { useTheme } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
// eslint-disable-next-line no-unused-vars
import firstPrizeBadge from "../../Images/1st-prize-badge.png";
// eslint-disable-next-line no-unused-vars
import secondPrizeBadge from "../../Images/2nd-prize-badge.png";
// eslint-disable-next-line no-unused-vars
import thirdPrizeBadge from "../../Images/3rd-prize-badge.png";
import * as $ from "jquery";
import {
  getUploadedVideosByUserId,
  updateVideoLikes,
  updateVideoComments,
  deleteUploadedVideoByVideoKey,
} from "../../Services/UploadedVideo.service";
import { getCompetitionByUserId } from "../../Services/EnrollCompetition.service";
import CompetitionsDetails from "../CompetitionsDetails";
import { getCompetitionsList } from "../../Services/Competition.service";
import { setActiveCompetition } from "../../Actions/Competition";
// eslint-disable-next-line no-unused-vars
import { getUploadedVideosByUser } from "../../Actions/User";
import VideoPlayer from "../Vedio/Video";
import { enableLoading, disableLoading } from "../../Actions/Loader";
import { removeDataRefetchModuleName } from "../../Actions/Utility";
import FavoriteBorder from "@material-ui/icons/FavoriteBorder";
import Favorite from "@material-ui/icons/Favorite";
import CommentOutlined from "@material-ui/icons/CommentOutlined";
import VideoDetails from "../VideoDetails";
import {
  getAllUser,
  getUserByEmail,
  updateUser,
  getUserPublicProfile,
} from "../../Services/User.service";
import { updateFollowUnfollow } from "../../Services/Friendship.service";
import { sendEmail } from "../../Services/Email.service";
import { getUploadedVideosList } from "../../Services/UploadedVideo.service";
import { FaBars } from "react-icons/fa";
import { disableLoginFlow, enableLoginFlow } from "../../Actions/LoginFlow";
import { setActiveVideoForCompetition } from "../../Actions/Competition";
import { loginUser } from "../../Actions/User";
import GenericInfoModal from "../genericInfoModal";
import { deleteImage, deleteVideo } from "../../Services/Upload.service";
import FollowButton from "../FollowButton";
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}

function Profile() {
  const { REACT_APP_URL } = process.env;
  const history = useHistory();
  const theme = useTheme();
  const { state, dispatch } = useStoreConsumer();
  const [value, setValue] = useState(0);
  const loggedInUser = state.loggedInUser;
  const [UserUploadedVideoList, setUserUploadedVideoList] = useState([]);
  const [UserCompetitionsList, setUserCompetitionsList] = useState([]);
  const [UserLikedVideoList, setUserLikedVideoList] = useState([]);
  const [
    openUserEnrolledCompDetailsModal,
    setOpenUserEnrolledCompDetailsModal,
  ] = useState(false);
  const [initialStep, setInitialStep] = useState(1);
  const [activeVideoObj, setActiveVideoObj] = useState({});
  const [commentModal, setCommentModal] = useState(false);
  const [userList, setUserList] = useState([]);
  const [showProfileTab, setShowProfileTab] = useState(false);
  const [openUploadCompModalFor, setOpenUploadCompModalFor] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [followRequestUser, setFollowRequestUser] = useState({});
  // eslint-disable-next-line no-unused-vars
  const [userProfileData, setUserProfileData] = useState({});
  const [selfProfile, setSelfProfile] = useState(false);
  const [userData, setUserData] = useState({});
  const [followButtonText, setFollowButtonText] = useState("Follow");
  const [openInformationModal, toggleInfoModal] = useState(false);
  const [infoModalMessage, setInfoModalMessage] = useState("");
  const [infoModalStatus, setInfoModalStatus] = useState("");
  const [genericInforModalAction, setInfoModalAction] = useState(false);
  const [userDeleteVideoSelection, setUserVideoSelectionForRemove] =
    useState(null);
  const [followStatus, setFollowStatus] = useState("");

  const profileOuterRef = useRef();
  const userTabsRef = useRef();
  const ref = useRef();
  const headerWrapRef = useRef();

  function shouldCloseInfoModal(navigationValue) {
    setUserVideoSelectionForRemove({});
    setInfoModalMessage("");
    setInfoModalStatus("");
    setInfoModalAction(false);
    toggleInfoModal(false);
  }

  const fetchUserDetailsByEmail = (email, responseType) => {
    let loggedUser = loggedInUser;
    getUserByEmail(email).subscribe((response) => {
      if (response && response.length > 0) {
        const userResponse = response[0];
        if (userResponse.key === loggedUser.key)
          dispatch(loginUser(response[0]));
        if (responseType) {
          setFollowRequestUser(userResponse);
          const userId = userResponse.key;
          const ifUserExist = loggedUser.followRequestedBy.filter(
            (followRequest) => followRequest === userId
          );
          if (ifUserExist && ifUserExist.length > 0) {
            let followRequestedBy = loggedUser.followRequestedBy;
            followRequestedBy = followRequestedBy.splice(1, userId);
            loggedUser.followRequestedBy = followRequestedBy;
            if (responseType === "accept") {
              if (loggedUser && !loggedUser.followedBy) {
                loggedUser = { ...loggedUser, followedBy: [userId] };
              } else {
                loggedUser.followedBy.push(userId);
              }
              updateUserOnAcceptRejectFollowRequest(loggedUser, userResponse);
            }
            if (responseType === "reject") {
              updateUserOnAcceptRejectFollowRequest(loggedUser);
            }
          }
        }
      }
    });
  };
  const updateUserOnAcceptRejectFollowRequest = (
    userObj,
    requestRaisedByUser
  ) => {
    let data = {};
    updateUser(userObj.key, userObj).subscribe((response) => {
      if (response.updated) {
        if (requestRaisedByUser) {
          if (!requestRaisedByUser.following) {
            data = { ...requestRaisedByUser, following: [loggedInUser.key] };
          } else {
            requestRaisedByUser.following.push(loggedInUser.key);
          }
          updateUser(data.key, data).subscribe(
            (requestRaisedByUserUpdateResponse) => {
              if (requestRaisedByUserUpdateResponse.updated) {
                console.log("Follow Request raised by user updated");
                // send email to user about accepted follow request
              }
            }
          );
        }
      }
    });
  };

  useOnClickOutside(ref, () => {
    setShowProfileTab(false);
    setOpenUploadCompModalFor(null);
  });

  useEffect(() => {
    if (!loggedInUser || !loggedInUser.email) history.push("/login");
    if (loggedInUser && loggedInUser.email) {
      fetchUserDetailsByEmail(loggedInUser.email);

      const loggedInUserName = loggedInUser.email.split("@")[0];
      if (history.location && history.location.pathname) {
        const userNameFromPath =
          history.location.pathname.split("/profile/")[1];
        const emailFromPath =
          userNameFromPath && userNameFromPath.length > 0
            ? window.atob(userNameFromPath)
            : null;
        if (
          userNameFromPath &&
          loggedInUserName !== userNameFromPath.split("@")[0]
        ) {
          if (
            emailFromPath &&
            emailFromPath.length &&
            emailFromPath.includes("@")
          ) {
            getUserPublicProfile(emailFromPath).subscribe((response) => {
              if (response && response.length > 0) {
                const tempProfileData = response[0];
                setUserProfileData(tempProfileData);
                setUserData(tempProfileData);
                setSelfProfile(false);
              } else {
                // setUserData(loggedInUser);
                // history.push("/profile");
              }
            });
          } else {
            setSelfProfile(true);
            setUserData(loggedInUser);
            history.push("/profile");
          }
        } else {
          setUserData(loggedInUser);
        }
      }
    }
    $("html,body").animate(
      {
        scrollTop: 0,
      },
      500
    );

    if (state.currentLoginFlow === "profile-competition") {
      setValue(1);
      dispatch(disableLoginFlow());
      dispatch(setActiveVideoForCompetition());
    }

    document.addEventListener("scroll", onWindowScroll);
    dispatch(enableLoading());
    if (history.location && history.location.search) {
      const searchObj = Object.fromEntries(
        new URLSearchParams(history.location.search)
      );
      if (searchObj) {
        const { followrequest, requestBy } = searchObj;
        fetchUserDetailsByEmail(requestBy, followrequest);
      }
    }
    // getCompetitionByUserId(loggedInUser.key).subscribe((list) => UserLikedVideoList(list));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAllUserList = () => {
    return new Promise((res, rej) => {
      getAllUser().subscribe((users) => {
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

  useEffect(() => {
    // if (selfProfile)
    const profileUser = !selfProfile ? userData : loggedInUser;
    if (profileUser && Object.keys(profileUser).length > 0) {
      getUploadedVideosByUserId(profileUser.key).subscribe((list) => {
        setUserUploadedVideoList(list);
        if (list.length !== 0) {
          getAllUserList().then((data) => {
            setUserList(data);
            let userList = data;
            let userVdoCopy = [...list];
            userVdoCopy.forEach((vdoObj) => {
              let userData = userList.filter(
                (userObj) => userObj.key === profileUser.key
              );
              if (vdoObj.likes && vdoObj.likes.length) {
                vdoObj.likes.forEach((likeObj) => {
                  let userData = userList.filter(
                    (userObj) => userObj?.key === likeObj.userId
                  );
                  if (userData.length !== 0) {
                    likeObj.username = userData && userData[0]?.username;
                    likeObj.profileImage =
                      userData && userData[0]?.profileImage;
                  }
                });
              }
              if (vdoObj.comments && vdoObj.comments.length) {
                vdoObj.comments.forEach((commentObj) => {
                  let userData = userList.filter(
                    (userObj) => userObj.key === commentObj.userId
                  );
                  if (userData.length !== 0) {
                    commentObj.username = userData[0]?.username;
                    commentObj.profileImage = userData[0]?.profileImage;
                  }
                });
              }
              if (userData && userData.length > 0) {
                vdoObj.username = userData[0]?.name;
                vdoObj.userEmail = userData[0]?.email;
                vdoObj.privacy = userData[0]?.privacy || "Public";
              }
              let user = userData && userData[0];
              if (user?.followedBy && user?.followedBy.length > 0) {
                const checkIfUserFollowingVideoCreator =
                  user?.followedBy.filter(
                    (followedByUserId) => followedByUserId === loggedInUser.key
                  );
                console.log(
                  "checkIfUserFollowingVideoCreator",
                  checkIfUserFollowingVideoCreator
                );
                if (
                  checkIfUserFollowingVideoCreator &&
                  checkIfUserFollowingVideoCreator.length > 0
                ) {
                  vdoObj.following = true;
                  setFollowStatus("following");
                } else {
                  vdoObj.following = false;
                  setFollowStatus("");
                }
              }
              if (
                user?.followRequestedBy &&
                user?.followRequestedBy.length > 0
              ) {
                const checkIfUserRequestedToFollowVideoCreator =
                  user?.followRequestedBy.filter(
                    (followRequestedByUserId) =>
                      followRequestedByUserId === loggedInUser.key
                  );
                console.log(
                  "checkIfUserRequestedToFollowVideoCreator",
                  checkIfUserRequestedToFollowVideoCreator
                );
                if (
                  checkIfUserRequestedToFollowVideoCreator &&
                  checkIfUserRequestedToFollowVideoCreator.length > 0
                ) {
                  vdoObj.requested = true;
                  setFollowStatus("requested");
                } else {
                  vdoObj.requested = false;
                  setFollowStatus("");
                }
              }
            });
            dispatch(disableLoading());
            console.log("userVdoCopy", userVdoCopy);
            setUserUploadedVideoList(userVdoCopy);
          });
        } else {
          let user = profileUser;
          if (user?.followedBy && user?.followedBy.length > 0) {
            const checkIfUserFollowingVideoCreator = user?.followedBy.filter(
              (followedByUserId) => followedByUserId === loggedInUser.key
            );
            console.log(
              "checkIfUserFollowingVideoCreator",
              checkIfUserFollowingVideoCreator
            );
            if (
              checkIfUserFollowingVideoCreator &&
              checkIfUserFollowingVideoCreator.length > 0
            ) {
              setFollowStatus("following");
            } else {
              setFollowStatus("");
            }
          }
          if (user?.followRequestedBy && user?.followRequestedBy.length > 0) {
            const checkIfUserRequestedToFollowVideoCreator =
              user?.followRequestedBy.filter(
                (followRequestedByUserId) =>
                  followRequestedByUserId === loggedInUser.key
              );
            console.log(
              "checkIfUserRequestedToFollowVideoCreator",
              checkIfUserRequestedToFollowVideoCreator
            );
            if (
              checkIfUserRequestedToFollowVideoCreator &&
              checkIfUserRequestedToFollowVideoCreator.length > 0
            ) {
              setFollowStatus("requested");
            } else {
              setFollowStatus("");
            }
          }
          dispatch(disableLoading());
        }
        getCompetitionByUserId(profileUser.key).subscribe( resp => {
          dispatch(disableLoading());
          if (resp.length && list.length) {
            list.forEach( item => {
              resp.forEach( item2 => {
                if (item2.compId === item?.enrolledCompetition) {
                  item['compName'] = item2.compName;
                }
              });
            });
            setUserUploadedVideoList(list);
          }  
          setUserCompetitionsList(resp);
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  useEffect(() => {
    const profileUser =
      userData && Object.keys(userData).length > 0 ? userData : loggedInUser;
    if (state.refetchDataModule === "user-uploaded-video") {
      getUploadedVideosByUserId(profileUser.key).subscribe((list) => {
        dispatch(removeDataRefetchModuleName());
        setUserUploadedVideoList(list);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function fetchUserUpdatedVideoList() {
    dispatch(enableLoading());
    const profileUser =
      userData && Object.keys(userData).length > 0 ? userData : loggedInUser;
    try {
      getUploadedVideosByUserId(profileUser.key).subscribe((list) => {
        dispatch(disableLoading());
        setUserUploadedVideoList(list);
        dispatch(getUploadedVideosByUser(list));
      });
    } catch (e) {
      dispatch(disableLoading());
      console.log("video fetch error: ", e);
    }
  }

  function onWindowScroll(event) {
    if (window.outerWidth > 1023) {
      if (window.scrollY >= 240) {
        toggleStickyHeader("add");
      } else {
        toggleStickyHeader("remove");
      }
    } else {
      if (window.scrollY >= 310) {
        toggleStickyHeader("add");
      } else {
        toggleStickyHeader("remove");
      }
    }
  }

  function toggleStickyHeader(toggleValue) {
    if (toggleValue === "add") {
      if (userTabsRef.current) {
        userTabsRef.current.classList.add("sticky");
      }
      if (headerWrapRef.current) {
        headerWrapRef.current.classList.add("sticky");
      }
      if (profileOuterRef.current) {
        profileOuterRef.current.classList.add("sticky");
      }
    } else {
      if (userTabsRef.current) {
        userTabsRef.current.classList.remove("sticky");
      }
      if (headerWrapRef.current) {
        headerWrapRef.current.classList.remove("sticky");
      }
      if (profileOuterRef.current) {
        profileOuterRef.current.classList.remove("sticky");
      }
    }
  }

  const handleChange = (event, newValue) => {
    setValue(newValue);
    if (newValue === 1 && UserLikedVideoList.length === 0) {
      dispatch(enableLoading());
      getAllUploadedVideos().then((feeds) => {
        if (feeds) {
          let userLikedVdos = [];
          feeds.forEach((feed) => {
            if (feed.likes && feed.likes.length) {
              let isAvail = feed.likes.filter(
                (data) => data.userId === loggedInUser.key
              );
              if (isAvail.length !== 0) userLikedVdos.push(feed);
            }
          });
          dispatch(disableLoading());
          setUserLikedVideoList(userLikedVdos);
        } else dispatch(disableLoading());
      });
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleChangeIndex = (index) => {
    setValue(index);
  };

  const openCompetitionDetailsModal = (competition) => {
    const profileUser =
      userData && Object.keys(userData).length > 0 ? userData : loggedInUser;
    if (profileUser.key === loggedInUser.key) {
      getCompetitionsList().subscribe((allCompList) => {
        let isUserEnrolled = allCompList.filter(
          (data) => data.key === competition.compId
        );
        if (isUserEnrolled.length) {
          isUserEnrolled[0].isUserEnrolled = true;
          isUserEnrolled[0].userSubmitedDetails = competition;
          setInitialStep(2);
          dispatch(setActiveCompetition(isUserEnrolled[0]));
          setOpenUserEnrolledCompDetailsModal(true);
        }
      });
    }
  };

  const addUserDetailsToFeed = (feed, allUser) => {
    if (feed.likes && feed.likes.length) {
      feed.likes.forEach((likeObj) => {
        let userData = allUser.filter(
          (userObj) => userObj.key === likeObj.userId
        );
        if (userData.length !== 0) {
          likeObj.username = userData[0].username;
          likeObj.profileImage = userData[0].profileImage;
        }
      });
    }
    if (feed.comments && feed.comments.length) {
      feed.comments.forEach((commentObj) => {
        let userData = allUser.filter(
          (userObj) => userObj.key === commentObj.userId
        );
        if (userData.length !== 0) {
          commentObj.username = userData[0].username;
          commentObj.profileImage = userData[0].profileImage;
        }
      });
    }
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
      let feedListCopy = [...UserUploadedVideoList];
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
      setUserUploadedVideoList(feedListCopy);
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
      let feedListCopy = [...UserUploadedVideoList];
      feedListCopy.forEach((feed) => {
        if (feed.key === videoObj.key) {
          feed.comments = videoObj.comments;
        }
        addUserDetailsToFeed(feed, userList);
      });
      setUserUploadedVideoList(feedListCopy);
    });
  };

  const handleCommentClick = (video) => {
    setFollowButtonText(video.following ? "Following" : "Follow");
    setCommentModal(true);
    setActiveVideoObj(video);
  };

  const redirectToCompetition = (event, videoObj) => {
    event.stopPropagation();
    
    if (videoObj && videoObj?.enrolledCompetition) {
      // NOTE: below commented code is for showing Modal message if comp present 
      // setInfoModalMessage(
      //   "This video you have already submitted for a Competition, please select another video!"
      //   );
      //   setInfoModalStatus("info");
      //   setInfoModalAction(false);
      //   toggleInfoModal(true);
        if (UserCompetitionsList && UserCompetitionsList.length) {
          let compData = null;
          UserCompetitionsList.forEach( comp => {
            if (videoObj.enrolledCompetition === comp.compId) {
              compData = comp;
            }
          });
          if (compData) {
            openCompetitionDetailsModal(compData);
          } else {
            triggerCompetitionRedirection();
          }
        } else {
          triggerCompetitionRedirection();
        }
      } else {
        triggerCompetitionRedirection();
      }
    };
    
    function triggerCompetitionRedirection() {
      // dispatch(setActiveVideoForCompetition(openUploadCompModalFor));
      dispatch(enableLoginFlow({ type: "profile-competition" }));
      history.push("/competitions");
      setShowProfileTab(false);
    }

  function deleteSelectedVideo(event, videoToDelete) {
    event.stopPropagation();
    if (videoToDelete && videoToDelete?.enrolledCompetition) {
      setInfoModalMessage(
        "This video is submitted for a Competition, to delete this you have to use another video for that competition!"
      );
      setInfoModalStatus("info");
      setInfoModalAction(false);
      toggleInfoModal(true);
    } else {
      setUserVideoSelectionForRemove(videoToDelete);
      setInfoModalMessage("Are you sure you want to delete this Video?");
      setInfoModalStatus("info");
      setInfoModalAction(true);
      toggleInfoModal(true);
    }
  }

  function confirmUserActionSelected(action) {
    if (action) {
      dispatch(enableLoading());
      // Delete Video Thumbnail
      try {
        deleteImage(userDeleteVideoSelection.thumbnail).subscribe(
          (response) => {
            if (response && (response.deleted || response.success)) {
              // Delete Video
              try {
                deleteVideo(userDeleteVideoSelection.url).subscribe(
                  (response) => {
                    console.log("response", response);
                    if (response && response.deleted) {
                      // Delete Video record from `uploadedVideos` collection
                      try {
                        deleteUploadedVideoByVideoKey(
                          userDeleteVideoSelection.key
                        ).subscribe((response) => {
                          dispatch(disableLoading());
                          if (response && response.deleted) {
                            setInfoModalMessage(
                              "The video has been deleted successfully!"
                            );
                            setInfoModalStatus("success");
                            setInfoModalAction(false);
                            toggleInfoModal(true);
                            fetchUserUpdatedVideoList();
                          }
                        });
                      } catch (e) {
                        dispatch(disableLoading());
                        console.log("error deleting video data: ", e);
                      }
                    }
                  }
                );
              } catch (e) {
                dispatch(disableLoading());
                console.log("error deleting video: ", e);
              }
            }
          }
        );
      } catch (e) {
        dispatch(disableLoading());
        console.log("thumbnail delete error: ", e);
      }
    }
  }

  // Hook
  function useOnClickOutside(ref, handler) {
    useEffect(() => {
      const listener = (event) => {
        if (!ref.current || ref.current.contains(event.target)) {
          return;
        }

        handler(event);
      };
      document.addEventListener("mousedown", listener);
      document.addEventListener("touchstart", listener);
      return () => {
        document.removeEventListener("mousedown", listener);
        document.removeEventListener("touchstart", listener);
      };
    }, [ref, handler]);
  }

  const handleFollowBtnClick = (action, toFollow, followBy) => {
    dispatch(enableLoading());
    updateFollowUnfollow(action, toFollow, followBy).subscribe((response) => {
      if (response) {
        // eslint-disable-next-line no-unused-vars
        const { name, email } = response;
        if (response.followed) {
          setFollowButtonText("Following");
          // eslint-disable-next-line no-unused-vars
          const message = `${loggedInUser.name} started following`;
          // eslint-disable-next-line no-unused-vars
          const subject = `${loggedInUser.name} started following`;
          // sendFollowNotificationEmail(name, email, subject, message);
        }
        if (response.requested) {
          setFollowButtonText("Requested");
          const acceptLink = `${REACT_APP_URL}profile?followrequest=accept&requestBy=${encodeURIComponent(
            loggedInUser.email
          )}`;
          const declineLink = `${REACT_APP_URL}profile?followrequest=decline&requestBy=${encodeURIComponent(
            loggedInUser.email
          )}`;
          // eslint-disable-next-line no-unused-vars
          const message = `${loggedInUser.name} requested to follow you.<br /><br />You can <a href="${acceptLink}">Accept</a> or <a href="${declineLink}">Decline</a>`;
          // eslint-disable-next-line no-unused-vars
          const subject = `${loggedInUser.name} requested to follow you`;
          // sendFollowNotificationEmail(name, email, subject, message);
        }
        dispatch(disableLoading());
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
    sendEmail(payload).subscribe((res) => {
      if (!("error" in res)) {
        console.log("Follow request Send Successfully.");
        dispatch(disableLoading());
      } else {
        dispatch(disableLoading());
        console.log("User Email Send Failed.");
      }
      // fetchUsersVideoDetails(null, userKey);
    });
  };
  return (
    <div className="profile-outer" ref={profileOuterRef}>
      <div className="profile-details-wrap clearfix">
        <div className="profile-img">
          {userData.profileImage ? (
            <img src={userData.profileImage} alt={userData.name} />
          ) : (
            <AccountCircleOutlinedIcon />
          )}
        </div>
        <div className="profile-details clearfix">
          <div className="username-wrap clearfix">
            <div className="username">{userData.username}</div>
            {userData && loggedInUser && userData.key === loggedInUser.key ? (
              <div
                className="edit-profile"
                onClick={() => history.push("/profile/edit")}
              >
                Edit Profile
              </div>
            ) : (
              <FollowButton
                status={followStatus}
                onClickHandler={handleFollowBtnClick}
                user={userData}
                loggedInUser={loggedInUser}
              />
            )}
          </div>
          <div className="followers-wrap clearfix">
            <div className="posts">
              <div className="followInfo">
                <h5>Posts : {UserUploadedVideoList.length}</h5>
                {/* {userData.followedBy && userData.followedBy.length && ( */}
                <h5>
                  Followers :{" "}
                  {userData.followedBy && userData.followedBy.length
                    ? userData.followedBy.length
                    : 0}
                </h5>
                {/* )} */}
                {/* {userData.following && userData.following.length && ( */}
                <h5>
                  Following :{" "}
                  {userData.following && userData.following.length
                    ? userData.following.length
                    : 0}
                </h5>
                {/* )} */}
              </div>
            </div>
            {/* <div className="followers">
                            <span>999</span> Followers
                        </div>
                        <div className="following">
                            <span>999</span> Followings
                        </div> */}
          </div>
          <div className="bio-wrap">
            <div className="fullname">{userData.name}</div>
            {userData.bio ? (
              <div className="bio">{userData.bio}</div>
            ) : ''}
          </div>
        </div>
      </div>
      <div className="profile-content-wrap">
        <div className="headers-wrap" ref={headerWrapRef}>
          <div className="user-tabs-wrap" ref={userTabsRef}>
            <Tabs
              value={value}
              onChange={handleChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
              aria-label="full width tabs example"
            >
              <Tab
                label="Posts"
                icon={<CollectionsOutlinedIcon />}
                {...a11yProps(0)}
              />
              <Tab
                label="My Competitions"
                icon={<LoyaltyOutlinedIcon />}
                {...a11yProps(1)}
              />
            </Tabs>
          </div>
          <div className="profileTabBoxContent">
            <TabPanel value={value} index={0} dir={theme.direction}>
              <div className="flex-container">
                {UserUploadedVideoList.length !== 0 ? (
                  <div className="feed-wrap">
                    {UserUploadedVideoList &&
                      UserUploadedVideoList.map((vdo) => {
                        return (
                          <div key={vdo.key} className="profile-vdo-wrap">
                            {/* TODO: This badges code block will be dynamic once we have
                                                        winners data and on the basis of their rank the respective 
                                                        badge will apper on that video
                                                    */}
                            {/* {
                                                        index === 0 ? 
                                                        <div className="winners-badges">
                                                            <img src={firstPrizeBadge} alt="first prize" />
                                                        </div>: ''
                                                    }

                                                    {
                                                        index === 2 ?
                                                        <div className="winners-badges">
                                                            <img src={secondPrizeBadge} alt="Second prize" />
                                                        </div>: ''
                                                    }

    {
                                                        index === 3 ?
                                                        <div className="winners-badges">
                                                            <img src={thirdPrizeBadge} alt="Third prize" />
                                                        </div>: ''
                                                    } */}
                            {userData &&
                              loggedInUser &&
                              userData.key === loggedInUser.key && (
                                <div
                                  className="menu"
                                  onClick={() => {
                                    setOpenUploadCompModalFor(vdo.key);
                                    setShowProfileTab(true);
                                  }}
                                >
                                  <i>
                                    <FaBars />
                                  </i>
                                </div>
                              )}
                            {showProfileTab &&
                              openUploadCompModalFor === vdo.key && (
                                <div className="videoUploadToolTip" ref={ref}>
                                  <div
                                    className="profileItem"
                                    title="Submit video for competition"
                                    onClick={(e) =>
                                      redirectToCompetition(e, vdo)
                                    }
                                  >
                                    {vdo?.enrolledCompetition
                                      ? "Choose another video"
                                      : "Upload for competition"}
                                  </div>
                                  <div
                                    className="profileItem"
                                    title="Delete the video"
                                    onClick={(e) => deleteSelectedVideo(e, vdo)}
                                  >
                                    Delete this video
                                  </div>
                                </div>
                              )}
                            {
                              vdo?.compName ?
                              <p className="compLabel">
                                <span>{vdo?.compName}</span>
                                <label
                                  title="Upload another video"
                                  onClick={(e) =>
                                    redirectToCompetition(e, vdo)
                                  }
                                >Change video</label>
                              </p> : ''
                            }
                            <div className="vdo-card">
                              <div className="videoCardInner">
                                <VideoPlayer vdoObj={vdo} />
                              </div>
                              <div className="video-title-like-wrap profile-mode">
                                <div className="title">{vdo.title}</div>
                                <div className="like-comment">
                                  {vdo.likes && vdo.likes.length > 0 && (
                                    <div className="likes-count">
                                      {vdo.likes.length}{" "}
                                      {vdo.likes.length > 1 ? "Likes" : "Like"}
                                    </div>
                                  )}
                                  {/* {!vdo.isLiked && (
                                    <FavoriteBorder
                                      title="Unlike"
                                      onClick={() => handleLikes(vdo, "liked")}
                                    />
                                  )}
                                  {vdo.isLiked && (
                                    <Favorite
                                      title="Like"
                                      onClick={() =>
                                        handleLikes(vdo, "unliked")
                                      }
                                    />
                                  )}
                                  <CommentOutlined
                                    title="comment"
                                    onClick={() => handleCommentClick(vdo)}
                                  /> */}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div>No video posted yet !</div>
                )}
              </div>
            </TabPanel>
            {/* <TabPanel value={value} index={1} dir={theme.direction}>
                                <div className="flex-container" >
                                    {UserLikedVideoList.length !== 0 ? UserLikedVideoList.map((vdoObj) => {
                                        return <div className="flex-basis-3 like-tab" key={vdoObj.key}>
                                            <div>
                                                <VideoPlayer vdoObj={vdoObj} />
                                            </div>
                                            <div className="video-title-like-wrap">
                                                <div className="title">{vdoObj.title}</div>
                                                <div className="like-comment">
                                                    {vdoObj.likes && vdoObj.likes.length > 0 && <div className="likes-count">{vdoObj.likes.length} Likes</div>}
                                                </div>
                                            </div>
                                        </div>
                                    }) :
                                        <div>No video liked yet !</div>}
                                </div>
                            </TabPanel> */}
            <TabPanel value={value} index={1} dir={theme.direction}>
              <div className="flex-container">
                {UserCompetitionsList.length !== 0 ? (
                  UserCompetitionsList.map((competition) => {
                    return (
                      <div
                        className="competition-tab"
                        key={competition.key}
                        onClick={() => openCompetitionDetailsModal(competition)}
                      >
                        <div className="compTitle">
                          {competition.compName}
                          <span>(Click to change video)</span>
                        </div>
                        <div className="imgWrap">
                          <img
                            src={competition.compImg}
                            alt={competition.compName}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div>You haven't enrolled in any competition yet!</div>
                )}
              </div>
            </TabPanel>
          </div>
        </div>
      </div>
      {commentModal && (
        <VideoDetails
          handleClose={() => setCommentModal(false)}
          videoObj={activeVideoObj}
          handleLikes={handleLikes}
          handleComments={handleComments}
          loggedInUser={loggedInUser}
          followToggle={handleFollowBtnClick}
          BtnText={followButtonText}
        />
      )}
      {openUserEnrolledCompDetailsModal && (
        <CompetitionsDetails
          open={openUserEnrolledCompDetailsModal}
          handleClose={() => setOpenUserEnrolledCompDetailsModal(false)}
          initialStep={initialStep}
        />
      )}
      {openInformationModal ? (
        <GenericInfoModal
          message={infoModalMessage}
          status={infoModalStatus}
          shouldHaveAction={genericInforModalAction}
          confirmUserAction={confirmUserActionSelected}
          closeInfoModal={shouldCloseInfoModal}
        />
      ) : (
        ""
      )}
    </div>
  );
}

export default Profile;
