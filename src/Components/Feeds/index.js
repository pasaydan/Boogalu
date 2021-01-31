import React, { useEffect, useState } from 'react'
import { getUploadedVideosList } from "../../Services/UploadedVideo.service";
import { getAllUser } from "../../Services/User.service";
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';
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

    const getAllUploadedVideos = ()=>{
        return new Promise((res,rej)=>{
            getUploadedVideosList().subscribe((videos) => {
                res(videos);
            });
        })
    }

    useEffect(() => {
        Promise.all([getAllUserList(),getAllUploadedVideos()]).then((data)=>{
            let tempUserList = data[0]
            let tempFeedList = data[1]
            
            tempUserList.map((user)=>{
                tempFeedList.map((feed)=>{
                    if(user.key == feed.userId){
                        feed.username = user.name
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
                    return <div className="user-icon-wrap">
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
                        return <div className="feed-card">
                            <div className="username">
                                <AccountCircleOutlinedIcon />
                                <span>{feed.username}</span>
                            </div>
                            <div>
                                <Vedio vdoObj={feed} />
                            </div>
                            <div className="like-comment">
                                <FavoriteBorder />
                                <CommentOutlined />
                            </div>
                            <div>{feed.title}</div>
                        </div>
                    })}
                </div>
            </div>
        </div>
    )
}

export default Feeds
