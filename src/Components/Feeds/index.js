import React, { useEffect, useState } from 'react'
import { getUploadedVideosList } from "../../Services/UploadedVideo.service";
import { updateVideoLikes, updateVideoComments } from "../../Services/UploadedVideo.service";
import { getAllUser } from "../../Services/User.service";
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';
import Favorite from '@material-ui/icons/Favorite';
import CommentOutlined from '@material-ui/icons/CommentOutlined';
import { useStoreConsumer } from '../../Providers/StateProvider';
import VideoDetails from '../VideoDetails'
import ProfileImage from "../ProfileImage";
import Vedio from "../Vedio/Video";
import { enableLoading, disableLoading } from "../../Actions/Loader";
import { getUserById, updateUser, updateFollowUnfollow } from "../../Services/User.service";
import { sendEmail } from "../../Services/Email.service";

function Feeds() {
    const {REACT_APP_URL} = process.env;
    const [followButtonText, setFollowButtonText] = useState('Follow');
    const [feedList, setFeedList] = useState([])
    const [userList, setUserList] = useState([])
    const [activeVideoObj, setActiveVideoObj] = useState({})
    const [commentModal, setCommentModal] = useState(false)
    const { state, dispatch } = useStoreConsumer();
    const loggedInUser = state.loggedInUser;

    const getAllUserList = () => {
        return new Promise((res, rej) => {
            getAllUser().subscribe((users) => {
                setUserList(users);
                res(users);
            });
        })
    }

    const getAllUploadedVideos = () => {
        return new Promise((res, rej) => {
            getUploadedVideosList().subscribe((videos) => {
                res(videos);
            });
        })
    }

    const handleLikes = (video, status) => {
        let videoObj = { ...video }
        if (status == 'liked') {
            if (videoObj.likes) {
                videoObj.likes.push({ value: 1, userId: loggedInUser.key })
            } else {
                videoObj.likes = [{ value: 1, userId: loggedInUser.key }]
            }
        } else {
            let likes = videoObj.likes.filter(data => data.userId != loggedInUser.key)
            videoObj.likes = likes
        }
        videoObj.likes.map((likeObj) => { delete likeObj.profileImage; delete likeObj.username; })
        updateVideoLikes(videoObj.key, videoObj).subscribe(() => {
            let feedListCopy = [...feedList]
            feedListCopy.map((feed) => {
                if (feed.key == videoObj.key) {
                    feed.likes = videoObj.likes
                }

                if (feed.likes && feed.likes.length) {
                    let isAvail = feed.likes.filter(data => data.userId == loggedInUser.key)
                    isAvail.length > 0 ? feed.isLiked = true : feed.isLiked = false
                } else {
                    feed.isLiked = false
                }
                addUserDetailsToFeed(feed, userList);
            })
            setFeedList(feedListCopy)
        })
    }

    const handleComments = (commentString) => {
        let videoObj = { ...activeVideoObj }
        if (videoObj.comments) {
            videoObj.comments.push({ value: commentString, userId: loggedInUser.key })
        } else {
            videoObj.comments = [{ value: commentString, userId: loggedInUser.key }]
        }

        videoObj.comments.map((commentObj) => { delete commentObj.profileImage; delete commentObj.username; })
        updateVideoComments(videoObj.key, videoObj).subscribe(() => {
            let feedListCopy = [...feedList]
            feedListCopy.map((feed) => {
                if (feed.key == videoObj.key) {
                    feed.comments = videoObj.comments
                }
                addUserDetailsToFeed(feed, userList);
            })
            setFeedList(feedListCopy)
        })
    }

    const handleCommentClick = (video) => {
        setCommentModal(true);
        setActiveVideoObj(video)
    }

    const addUserDetailsToFeed = (feed, allUser) => {
        if (feed.likes && feed.likes.length) {
            feed.likes.map((likeObj) => {
                let userData = allUser.filter(userObj => userObj.key == likeObj.userId);
                if (userData.length != 0) {
                    likeObj.username = userData[0].username;
                    likeObj.profileImage = userData[0].profileImage;
                }
            })
        }
        if (feed.comments && feed.comments.length) {
            feed.comments.map((commentObj) => {
                let userData = allUser.filter(userObj => userObj.key == commentObj.userId);
                if (userData.length != 0) {
                    commentObj.username = userData[0].username;
                    commentObj.profileImage = userData[0].profileImage;
                }
            })
        }
    }

    useEffect(() => {
        dispatch(enableLoading());
        Promise.all([getAllUserList(), getAllUploadedVideos()]).then((data) => {
            dispatch(disableLoading());
            let tempUserList = data[0]
            let tempFeedList = data[1]

            tempUserList.map((user) => {
                tempFeedList.map((feed) => {
                    if (user.key == feed.userId) {
                        feed.username = user.name;
                        feed.profileImage = user.profileImage;
                        feed.privacy = user.privacy || "Public";
                        user.isAnyVideoSubmitted = true;
                    }
                    if (feed.likes && feed.likes.length) {
                        let isAvail = feed.likes.filter(data => data.userId == loggedInUser.key)
                        isAvail.length > 0 ? feed.isLiked = true : feed.isLiked = false
                    } else {
                        feed.isLiked = false
                    }
                    // if (user.folloe)
                    addUserDetailsToFeed(feed, tempUserList);
                })
            })
            setFeedList(tempFeedList)
            setUserList(tempUserList);
        })
    }, [followButtonText])

    const openUserStory = (user) => {
        let userVdos = feedList.filter((feed) => user.key == feed.userId);
        if (userVdos.length) {
            setActiveVideoObj(userVdos[0]);
            setCommentModal(true);
        };
    }

    const handleFollowToggle = (toFollow, followBy, action) => {
        dispatch(enableLoading());
        updateFollowUnfollow(toFollow, followBy, action).subscribe((response) => {
            if (response) {
                const { name, email } = response;
                if (response.followed) {
                    setFollowButtonText('Following');
                    const message = `${loggedInUser.name} started following`;
                    const subject = `${loggedInUser.name} started following`;
                    sendFollowNotificationEmail(name, email, subject, message);
                }
                if (response.requested) {
                    setFollowButtonText('Requested');
                    const acceptLink = `${REACT_APP_URL}profile?followrequest=accept&requestBy=${encodeURIComponent(loggedInUser.email)}`
                    const declineLink = `${REACT_APP_URL}profile?followrequest=decline&requestBy=${encodeURIComponent(loggedInUser.email)}`
                    const message = `${loggedInUser.name} requested to follow you.<br /><br />You can <a href="${acceptLink}">Accept</a> or <a href="${declineLink}">Decline</a>`;
                    const subject = `${loggedInUser.name} requested to follow you`;
                    sendFollowNotificationEmail(name, email, subject, message);
                }
                dispatch(disableLoading());
            }
        })
    }

    const sendFollowNotificationEmail = (name, email, subject, message) => {
        let emailBody = `<div>
        <p>Hi ${name}, ${message}</p>. 
        </div>`;
        let payload = {
            mailTo: email,
            title: subject,
            content: emailBody
        }
        sendEmail(payload).subscribe((res) => {
            if (!('error' in res)) {
                console.log('Follow request Send Successfully.');
                dispatch(disableLoading());
            } else {
                dispatch(disableLoading());
                console.log('User Email Send Failed.');
            }
            // fetchUsersVideoDetails(null, userKey);
        })
    }

    return (
        <div className="userDashBoardAfterLogin">
            <div className="user-dashboard-wrap">
                <div className="user-list-wrap">
                    {userList && userList.map((user) => {
                        return (user.isAnyVideoSubmitted ? 
                        <div key={user.key} className="user-icon-wrap" title={`View ${user.username}`} onClick={() => openUserStory(user)}>
                            <ProfileImage src={user.profileImage} size="medium" />
                            <div className="userName">{user.username}</div>
                        </div> : null)
                    })}
                </div>
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
                        {feedList && feedList.map((feed) => {
                            return <div key={feed.key} className="feed-card">
                                <div>
                                    <Vedio vdoObj={feed} />
                                </div>
                                <div className="username">
                                    <ProfileImage src={feed.profileImage} />
                                    <span className="name">{feed.username}</span>
                                </div>
                                <div className="video-title-like-wrap">
                                    <div className="title">{feed.title}</div>
                                    <div className="like-comment">
                                        {feed.likes && feed.likes.length > 0 && <div className="likes-count">{feed.likes.length} Likes</div>}
                                        {!feed.isLiked && <FavoriteBorder title="Unlike" onClick={() => handleLikes(feed, 'liked')} />}
                                        {feed.isLiked && <Favorite title="Like" onClick={() => handleLikes(feed, 'unliked')} />}
                                        <CommentOutlined title="comment" onClick={() => handleCommentClick(feed)} />
                                    </div>

                                </div>
                            </div>
                        })}
                    </div>
                </div>
            </div>
            {commentModal && <VideoDetails handleClose={() => setCommentModal(false)} handleLikes={handleLikes} handleComments={handleComments} videoObj={activeVideoObj} loggedInUser={loggedInUser} followToggle={handleFollowToggle} BtnText={followButtonText} />}
        </div>
    )
}

export default Feeds
