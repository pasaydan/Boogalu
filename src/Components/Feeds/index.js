import React, { useEffect, useState } from 'react'
import { getUploadedVideosList } from "../../Services/UploadedVideo.service";
import { getAllUser } from "../../Services/User.service";
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';
import CommentOutlined from '@material-ui/icons/CommentOutlined';

import Vedio from "../Vedio/Video";

function Feeds() {

    const [feedList, setFeedList] = useState([])
    const [userList, setUserList] = useState([])

    useEffect(() => {
        getUploadedVideosList().subscribe((videos) => setFeedList(videos));
        getAllUser().subscribe((users) => setUserList(users));
    }, [])

    return (
        <div className="feed-wrap">
            {feedList && feedList.map((feed) => {
                return <div className="feed-card">
                    <div className="fullname"> <AccountCircleOutlinedIcon /> Shubham Panwar</div>
                    <div>
                        <Vedio vdoObj={feed} />
                    </div>
                    <div>
                        <FavoriteBorder />
                        <CommentOutlined />
                    </div>
                    <div>{feed.title}</div>
                </div>
            })}
            {feedList && feedList.map((feed) => {
                return <div className="feed-card">
                    <div className="fullname"> <AccountCircleOutlinedIcon /> Shubham Panwar</div>
                    <div>
                        <Vedio vdoObj={feed} />
                    </div>
                    <div>
                        <FavoriteBorder />
                        <CommentOutlined />
                    </div>
                    <div>{feed.title}</div>
                </div>
            })}
            {feedList && feedList.map((feed) => {
                return <div className="feed-card">
                    <div className="fullname"> <AccountCircleOutlinedIcon /> Shubham Panwar</div>
                    <div>
                        <Vedio vdoObj={feed} />
                    </div>
                    <div>
                        <FavoriteBorder />
                        <CommentOutlined />
                    </div>
                    <div>{feed.title}</div>
                </div>
            })}
            {feedList && feedList.map((feed) => {
                return <div className="feed-card">
                    <div className="fullname"> <AccountCircleOutlinedIcon /> Shubham Panwar</div>
                    <div>
                        <Vedio vdoObj={feed} />
                    </div>
                    <div>
                        <FavoriteBorder />
                        <CommentOutlined />
                    </div>
                    <div>{feed.title}</div>
                </div>
            })}
        </div>
    )
}

export default Feeds
