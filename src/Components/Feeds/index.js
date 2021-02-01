import React, { useEffect, useState } from 'react'
import { getUploadedVideosList } from "../../Services/UploadedVideo.service";
import { updateVideo } from "../../Services/UploadedVideo.service";
import { getAllUser } from "../../Services/User.service";
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';
import Favorite from '@material-ui/icons/Favorite';
import CommentOutlined from '@material-ui/icons/CommentOutlined';
import { useStoreConsumer } from '../../Providers/StateProvider';

import Vedio from "../Vedio/Video";

function Feeds() {

    const [feedList, setFeedList] = useState([])
    const [userList, setUserList] = useState([])
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
        if(status == 'liked'){
            if(videoObj.likes){
                videoObj.likes.push({ value: 1, userId: loggedInUser.key })
            }else{
                videoObj.likes = [{ value: 1, userId: loggedInUser.key }]
            }
        }else{
            let likes = videoObj.likes.filter(data => data.userId != loggedInUser.key)
            videoObj.likes = likes
        }
        updateVideo(videoObj.key, videoObj).subscribe(() => {
            let feedListCopy = [...feedList]
            feedListCopy.map((feed)=>{
                if(feed.key == videoObj.key){
                    feed.likes = videoObj.likes
                }

                if (feed.likes && feed.likes.length) {
                    let isAvail = feed.likes.filter(data => data.userId == loggedInUser.key)
                    isAvail.length > 0 ? feed.isLiked = true : feed.isLiked = false
                } else {
                    feed.isLiked = false
                }
            })
            setFeedList(feedListCopy)
        })
    }



    useEffect(() => {
        Promise.all([getAllUserList(), getAllUploadedVideos()]).then((data) => {
            let tempUserList = data[0]
            let tempFeedList = data[1]

            tempUserList.map((user) => {
                tempFeedList.map((feed) => {
                    if (user.key == feed.userId) {
                        feed.username = user.name
                    }
                    if (feed.likes && feed.likes.length) {
                        let isAvail = feed.likes.filter(data => data.userId == loggedInUser.key)
                        isAvail.length > 0 ? feed.isLiked = true : feed.isLiked = false
                    } else {
                        feed.isLiked = false
                    }

                })
            })

            setFeedList(tempFeedList)
        })
    }, [])

    return (
        <div className="user-dashboard-wrap">
            <div className="user-list-wrap">
                {userList && userList.map((user) => {
                    return <div key={user.key} className="user-icon-wrap">
                        <AccountCircleOutlinedIcon />
                        <div>{user.username}</div>
                    </div>
                })}
            </div>
            <div className="feed-dashboard-wrap">
                <div className="loggedin-user">
                    <div>
                        <AccountCircleOutlinedIcon />
                        <div>
                            <div>{loggedInUser.username}</div>
                            <div className="username">{loggedInUser.name}</div>
                        </div>
                    </div>
                </div>
                <div className="feed-wrap">
                    {feedList && feedList.map((feed) => {
                        return <div key={feed.key} className="feed-card">
                            <div className="username">
                                <AccountCircleOutlinedIcon />
                                <span>{feed.username}</span>
                            </div>
                            <div>
                                <Vedio vdoObj={feed} />
                            </div>
                            <div className="video-title-like-wrap">
                                <div className="title">{feed.title}</div>
                                <div className="like-comment">
                                    {feed.likes && feed.likes.length > 0 && <div className="likes-count">{feed.likes.length} Likes</div>}
                                    {!feed.isLiked && <FavoriteBorder onClick={() => handleLikes(feed,'liked')} />}
                                    {feed.isLiked && <Favorite onClick={() => handleLikes(feed,'unliked')} />}
                                    <CommentOutlined />
                                </div>

                            </div>
                        </div>
                    })}
                </div>
            </div>
        </div>
    )
}

export default Feeds
