import React, { useState, useEffect, useRef } from 'react'
import { useHistory } from "react-router-dom";
import { useStoreConsumer } from '../../Providers/StateProvider';
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import LoyaltyOutlinedIcon from '@material-ui/icons/LoyaltyOutlined';
import FavoriteBorderOutlinedIcon from '@material-ui/icons/FavoriteBorderOutlined';
import CollectionsOutlinedIcon from '@material-ui/icons/CollectionsOutlined';
import PropTypes from 'prop-types';
import { useTheme } from '@material-ui/core/styles';
import SwipeableViews from 'react-swipeable-views';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import firstPrizeBadge from '../../Images/1st-prize-badge.png';
import secondPrizeBadge from '../../Images/2nd-prize-badge.png';
import thirdPrizeBadge from '../../Images/3rd-prize-badge.png';
import * as $ from 'jquery';
import { getUploadedVideosByUserId } from "../../Services/UploadedVideo.service";
import { getCompetitionByUserId } from "../../Services/EnrollCompetition.service";
import CompetitionsDetails from "../CompetitionsDetails";
import { getCompetitionsList } from "../../Services/Competition.service";
import { setActiveCompetition } from "../../Actions/Competition";
import Vedio from "../Vedio/Video";
import { enableLoading, disableLoading } from "../../Actions/Loader";
import { removeDataRefetchModuleName } from "../../Actions/Utility";
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';
import Favorite from '@material-ui/icons/Favorite';
import CommentOutlined from '@material-ui/icons/CommentOutlined';
import { updateVideoLikes, updateVideoComments } from "../../Services/UploadedVideo.service";
import VideoDetails from '../VideoDetails'
import { getAllUser } from "../../Services/User.service";
import { getUploadedVideosList } from "../../Services/UploadedVideo.service";
import { FaBars } from 'react-icons/fa';
import { disableLoginFlow, enableLoginFlow } from "../../Actions/LoginFlow";
import { setActiveVideoForCompetition } from "../../Actions/Competition";
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
        'aria-controls': `full-width-tabpanel-${index}`,
    };
}
function Profile() {
    const history = useHistory();
    const theme = useTheme();
    const { state, dispatch } = useStoreConsumer();
    const [value, setValue] = useState(0);
    const loggedInUser = state.loggedInUser;
    const [UserUploadedVideoList, setUserUploadedVideoList] = useState([]);
    const [UserCompetitionsList, setUserCompetitionsList] = useState([]);
    const [UserLikedVideoList, setUserLikedVideoList] = useState([]);
    const [openUserEnrolledCompDetailsModal, setOpenUserEnrolledCompDetailsModal] = useState(false);
    const [initialStep, setInitialStep] = useState(1);
    const [activeVideoObj, setActiveVideoObj] = useState({})
    const [commentModal, setCommentModal] = useState(false)
    const [userList, setUserList] = useState([])
    const [showProfileTab, setShowProfileTab] = useState(false);
    const [openUploadCompModalFor, setOpenUploadCompModalFor] = useState(null)
    
    const profileOuterRef = useRef();
    const userTabsRef = useRef();
    const ref = useRef();
    const headerWrapRef = useRef();
    
    useOnClickOutside(ref, () => { setShowProfileTab(false); setOpenUploadCompModalFor(null) });

    useEffect(() => {
        if (!loggedInUser || !loggedInUser.email) history.push('/login')
        $('html,body').animate({
            scrollTop: 0
        }, 500);

        if (state.currentLoginFlow == 'profile-competition') {
            setValue(1);
            dispatch(disableLoginFlow());
            dispatch(setActiveVideoForCompetition());
        };

        document.addEventListener('scroll', onWindowScroll);
        dispatch(enableLoading());
        getCompetitionByUserId(loggedInUser.key).subscribe((list) => { dispatch(disableLoading()); setUserCompetitionsList(list) });
        // getCompetitionByUserId(loggedInUser.key).subscribe((list) => UserLikedVideoList(list));
    }, []);

    const getAllUserList = () => {
        return new Promise((res, rej) => {
            getAllUser().subscribe((users) => {
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

    useEffect(() => {
        getUploadedVideosByUserId(loggedInUser.key).subscribe((list) => {
            setUserUploadedVideoList(list);
            if (list.length != 0) {
                getAllUserList().then((data) => {
                    setUserList(data);
                    let userList = data;
                    let userVdoCopy = [...list];
                    userVdoCopy.map((vdoObj) => {
                        if (vdoObj.likes && vdoObj.likes.length) {
                            vdoObj.likes.map((likeObj) => {
                                let userData = userList.filter(userObj => userObj.key == likeObj.userId);
                                if (userData.length != 0) {
                                    likeObj.username = userData[0].username;
                                    likeObj.profileImage = userData[0].profileImage;
                                }
                            })
                        }
                        if (vdoObj.comments && vdoObj.comments.length) {
                            vdoObj.comments.map((commentObj) => {
                                let userData = userList.filter(userObj => userObj.key == commentObj.userId);
                                if (userData.length != 0) {
                                    commentObj.username = userData[0].username;
                                    commentObj.profileImage = userData[0].profileImage;
                                }
                            })
                        }
                    })
                    dispatch(disableLoading());
                    console.log('userVdoCopy', userVdoCopy)
                    setUserUploadedVideoList(userVdoCopy)
                })
            } else dispatch(disableLoading());
        });
    }, [])

    useEffect(() => {
        if (state.refetchDataModule == 'user-uploaded-video') {
            getUploadedVideosByUserId(loggedInUser.key).subscribe((list) => { dispatch(removeDataRefetchModuleName()); setUserUploadedVideoList(list) });
        }
    }, [state])

    function onWindowScroll(event) {
        if (window.outerWidth > 1023) {
            if (window.scrollY >= 240) {
                toggleStickyHeader('add');
            } else {
                toggleStickyHeader('remove');
            }
        } else {
            if (window.scrollY >= 310) {
                toggleStickyHeader('add');
            } else {
                toggleStickyHeader('remove');
            }
        }
    }

    function toggleStickyHeader(toggleValue) {
        if (toggleValue === 'add') {
            if (userTabsRef.current) {
                userTabsRef.current.classList.add('sticky');
            }
            if (headerWrapRef.current) {
                headerWrapRef.current.classList.add('sticky');
            }
            if (profileOuterRef.current) {
                profileOuterRef.current.classList.add('sticky');
            }
        } else {
            if (userTabsRef.current) {
                userTabsRef.current.classList.remove('sticky');
            }
            if (headerWrapRef.current) {
                headerWrapRef.current.classList.remove('sticky');
            }
            if (profileOuterRef.current) {
                profileOuterRef.current.classList.remove('sticky');
            }
        }
    }

    const handleChange = (event, newValue) => {
        setValue(newValue);
        if (newValue == 1 && UserLikedVideoList.length == 0) {
            dispatch(enableLoading());
            getAllUploadedVideos().then((feeds) => {
                if (feeds) {
                    let userLikedVdos = []
                    feeds.map((feed) => {
                        if (feed.likes && feed.likes.length) {
                            let isAvail = feed.likes.filter(data => data.userId == loggedInUser.key)
                            if (isAvail.length != 0) userLikedVdos.push(feed)
                        }
                    })
                    dispatch(disableLoading());
                    setUserLikedVideoList(userLikedVdos);
                } else dispatch(disableLoading());
            })
        }
    };

    const handleChangeIndex = (index) => {
        setValue(index);
    };

    const openCompetitionDetailsModal = (competition) => {
        getCompetitionsList().subscribe(allCompList => {
            let isUserEnrolled = allCompList.filter((data) => data.key == competition.compId);
            if (isUserEnrolled.length) {
                isUserEnrolled[0].isUserEnrolled = true;
                isUserEnrolled[0].userSubmitedDetails = competition;
                setInitialStep(2);
                dispatch(setActiveCompetition(isUserEnrolled[0]));
                setOpenUserEnrolledCompDetailsModal(true);
            }
        });
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
            let feedListCopy = [...UserUploadedVideoList]
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
            setUserUploadedVideoList(feedListCopy)
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
            let feedListCopy = [...UserUploadedVideoList]
            feedListCopy.map((feed) => {
                if (feed.key == videoObj.key) {
                    feed.comments = videoObj.comments
                }
                addUserDetailsToFeed(feed, userList);
            })
            setUserUploadedVideoList(feedListCopy)
        })
    }

    const handleCommentClick = (video) => {
        setCommentModal(true);
        setActiveVideoObj(video)
    }

    const redirectToCompetition = () => {
        dispatch(setActiveVideoForCompetition(openUploadCompModalFor));
        dispatch(enableLoginFlow('profile-competition'));
        history.push('/competitions');
        setShowProfileTab(false);
    }

    // Hook
    function useOnClickOutside(ref, handler) {
        useEffect(
            () => {
                const listener = event => {
                    if (!ref.current || ref.current.contains(event.target)) {
                        return;
                    }

                    handler(event);
                };
                document.addEventListener('mousedown', listener);
                document.addEventListener('touchstart', listener);
                return () => {
                    document.removeEventListener('mousedown', listener);
                    document.removeEventListener('touchstart', listener);
                };
            },
            [ref, handler]
        );
    }


    return (
        <div className="profile-outer" ref={profileOuterRef}>
            <div className="profile-details-wrap clearfix">
                <div className="profile-img">
                    {
                        loggedInUser.profileImage ?
                            <img src={loggedInUser.profileImage} />
                            :
                            <AccountCircleOutlinedIcon />
                    }
                </div>
                <div className="profile-details clearfix">
                    <div className="username-wrap clearfix">
                        <div className="username">
                            {loggedInUser.username}
                        </div>
                        <div className="edit-profile" onClick={() => history.push('/profile/edit')}>
                            Edit Profile
                        </div>
                    </div>
                    <div className="followers-wrap clearfix">
                        <div className="posts">
                            <span>{UserUploadedVideoList.length}</span> Posts
                        </div>
                        {/* <div className="followers">
                            <span>999</span> Followers
                        </div>
                        <div className="following">
                            <span>999</span> Followings
                        </div> */}
                    </div>
                    <div className="bio-wrap">
                        <div className="fullname">
                            {loggedInUser.name}
                        </div>
                        {loggedInUser.bio ? <div className="bio">
                            {loggedInUser.bio}
                        </div> : <div className="bio">
                                Older dancers (especially from the SoCal dance community) – even if you can appreciate and welcome the ways dance has evolved, you’ll still feel pangs of nostalgia when going through this list.
                        </div>}
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
                            <Tab label="Posts" icon={<CollectionsOutlinedIcon />} {...a11yProps(0)} />
                            <Tab label="Competitions" icon={<LoyaltyOutlinedIcon />} {...a11yProps(1)} />
                            {/* <Tab label="Liked" icon={<FavoriteBorderOutlinedIcon />}{...a11yProps(1)} /> */}
                        </Tabs>
                    </div>
                    <div className="profileTabBoxContent">
                        <TabPanel value={value} index={0} dir={theme.direction}>
                                <div className="flex-container" >
                                    {UserUploadedVideoList.length !== 0 ?
                                        <div className="feed-wrap">
                                            {UserUploadedVideoList && UserUploadedVideoList.map((vdo) => {
                                                return <div key={vdo.key} className="profile-vdo-wrap">
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
                                                    <div className="menu" onClick={() => { setOpenUploadCompModalFor(vdo.key); setShowProfileTab(true) }}>
                                                        <i><FaBars /></i>
                                                    </div>
                                                    {showProfileTab && openUploadCompModalFor == vdo.key && <div className="videoUploadToolTip" ref={ref}>
                                                        <div className="profile" onClick={() => redirectToCompetition()}>Upload for competition</div>
                                                    </div>}
                                                    <div className="vdo-card">
                                                        <div>
                                                            <Vedio vdoObj={vdo} />
                                                        </div>
                                                        <div className="video-title-like-wrap profile-mode">
                                                            <div className="title">{vdo.title}</div>
                                                            <div className="like-comment">
                                                                {vdo.likes && vdo.likes.length > 0 && <div className="likes-count">{vdo.likes.length} Likes</div>}
                                                                {!vdo.isLiked && <FavoriteBorder title="Unlike" onClick={() => handleLikes(vdo, 'liked')} />}
                                                                {vdo.isLiked && <Favorite title="Like" onClick={() => handleLikes(vdo, 'unliked')} />}
                                                                <CommentOutlined title="comment" onClick={() => handleCommentClick(vdo)} />
                                                            </div>

                                                        </div>
                                                    </div>
                                                </div>
                                            })}
                                        </div>
                                        :
                                        <div>No video posted yet !</div>}
                                </div>
                            </TabPanel>
                            {/* <TabPanel value={value} index={1} dir={theme.direction}>
                                <div className="flex-container" >
                                    {UserLikedVideoList.length !== 0 ? UserLikedVideoList.map((vdoObj) => {
                                        return <div className="flex-basis-3 like-tab" key={vdoObj.key}>
                                            <div>
                                                <Vedio vdoObj={vdoObj} />
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
                                <div className="flex-container" >
                                    {UserCompetitionsList.length !== 0 ? UserCompetitionsList.map((competition) => {
                                        return <div className="flex-basis-3 competition-tab" key={competition.key} onClick={() => openCompetitionDetailsModal(competition)}>
                                            <div className="compTitle">{competition.compName}</div>
                                            <img src={competition.compImg} />
                                        </div>
                                    }) :
                                        <div>You haven't enrolled in any competition yet!</div>}
                                </div>
                            </TabPanel>
                    </div>
                    {/* <SwipeableViews
                        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                        index={value}
                        onChangeIndex={handleChangeIndex}>
                        <
                    </SwipeableViews> */}
                </div>
            </div>
            {commentModal && <VideoDetails handleClose={() => setCommentModal(false)} handleLikes={handleLikes} handleComments={handleComments} videoObj={activeVideoObj} />}
            {openUserEnrolledCompDetailsModal && <CompetitionsDetails open={openUserEnrolledCompDetailsModal} handleClose={() => setOpenUserEnrolledCompDetailsModal(false)} initialStep={initialStep} />}
        </div>
    )
}

export default Profile
