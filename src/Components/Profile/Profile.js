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
import * as $ from 'jquery';
import { getUploadedVideosByUserId } from "../../Services/UploadedVideo.service";
import { getCompetitionByUserId } from "../../Services/EnrollCompetition.service";
import CompetitionsDetails from "../CompetitionsDetails";
import { getCompetitionsList } from "../../Services/Competition.service";
import { setActiveCompetition } from "../../Actions/Competition";
import Vedio from "../Vedio/Video";
import { enableLoading, disableLoading } from "../../Actions/Loader";
import { removeDataRefetchModuleName } from "../../Actions/Utility";

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
    const profileOuterRef = useRef();
    const userTabsRef = useRef();

    useEffect(() => {
        if (!loggedInUser || !loggedInUser.email) history.push('/login')
        $('html,body').animate({
            scrollTop: 0
        }, 500);

        document.addEventListener('scroll', onWindowScroll);
        dispatch(enableLoading());
        getUploadedVideosByUserId(loggedInUser.key).subscribe((list) => { dispatch(disableLoading()); setUserUploadedVideoList(list) });
        getCompetitionByUserId(loggedInUser.key).subscribe((list) => { dispatch(disableLoading()); setUserCompetitionsList(list) });
        // getCompetitionByUserId(loggedInUser.key).subscribe((list) => UserLikedVideoList(list));
    }, []);

    useEffect(() => {
        if (state.refetchDataModule == 'user-uploaded-video') {
            getUploadedVideosByUserId(loggedInUser.key).subscribe((list) => { dispatch(removeDataRefetchModuleName()); setUserUploadedVideoList(list) });
        }
    }, [state])

    function onWindowScroll(event) {
        if (window.outerWidth > 1023) {
            if (window.scrollY >= 302) {
                toggleStickyHeader('add');
            } else {
                toggleStickyHeader('remove');
            }
        } else {
            if (window.scrollY >= 294) {
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
            if (profileOuterRef.current) {
                profileOuterRef.current.classList.add('sticky');
            }
        } else {
            if (userTabsRef.current) {
                userTabsRef.current.classList.remove('sticky');
            }
            if (profileOuterRef.current) {
                profileOuterRef.current.classList.remove('sticky');
            }
        }
    }

    const handleChange = (event, newValue) => {
        setValue(newValue);
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

    return (
        <div className="profile-outer" ref={profileOuterRef}>
            <div className="profile-details-wrap clearfix">
                <div className="profile-img">
                    {
                        loggedInUser.profileImage ?
                        <img src={loggedInUser.profileImage}/>
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
                            <span>999</span> Posts
                        </div>
                        <div className="followers">
                            <span>999</span> Followers
                        </div>
                        <div className="following">
                            <span>999</span> Followings
                        </div>
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
                <div className="headers-wrap">
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
                            <Tab label="Liked" icon={<FavoriteBorderOutlinedIcon />}{...a11yProps(1)} />
                            <Tab label="Competitions" icon={<LoyaltyOutlinedIcon />} {...a11yProps(2)} />
                        </Tabs>
                    </div>
                    <SwipeableViews
                        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                        index={value}
                        onChangeIndex={handleChangeIndex}>
                        <TabPanel value={value} index={0} dir={theme.direction}>
                            <div className="flex-container" >
                                {UserUploadedVideoList.length !== 0 ? UserUploadedVideoList.map((vdoObj) => {
                                    return <div className="flex-basis-3" style={{ marginRight: '30px' }} key={vdoObj.key}>
                                        <Vedio vdoObj={vdoObj} />
                                    </div>
                                }) :
                                    <div>No video posted yet !</div>}
                            </div>
                        </TabPanel>
                        <TabPanel value={value} index={1} dir={theme.direction}>
                            <div className="flex-container" >
                                {UserLikedVideoList.length !== 0 ? UserLikedVideoList.map((vdoObj) => {
                                    return <div className="flex-basis-3" style={{ marginRight: '30px' }} key={vdoObj.key}>
                                        <Vedio vdoObj={vdoObj} />
                                    </div>
                                }) :
                                    <div>No video liked yet !</div>}
                            </div>
                        </TabPanel>
                        <TabPanel value={value} index={2} dir={theme.direction}>
                            <div className="flex-container" >
                                {UserCompetitionsList.length !== 0 ? UserCompetitionsList.map((competition) => {
                                    return <div className="flex-basis-3" style={{ marginRight: '30px' }} key={competition.key} onClick={() => openCompetitionDetailsModal(competition)}>
                                        <div>{competition.compName}</div>
                                        <img src={competition.compImg} />
                                    </div>
                                }) :
                                    <div>No competition enrolled yet !</div>}
                            </div>
                        </TabPanel>
                    </SwipeableViews>
                </div>
            </div>
            {openUserEnrolledCompDetailsModal && <CompetitionsDetails open={openUserEnrolledCompDetailsModal} handleClose={() => setOpenUserEnrolledCompDetailsModal(false)} initialStep={initialStep} />}
        </div>
    )
}

export default Profile
