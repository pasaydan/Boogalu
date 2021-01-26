import React, { useState, useEffect } from 'react'
import { useHistory } from "react-router-dom";
import { useStoreConsumer } from '../../Providers/StateProvider';
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import LoyaltyOutlinedIcon from '@material-ui/icons/LoyaltyOutlined';
import FavoriteBorderOutlinedIcon from '@material-ui/icons/FavoriteBorderOutlined';
import CollectionsOutlinedIcon from '@material-ui/icons/CollectionsOutlined';
import PropTypes from 'prop-types';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import SwipeableViews from 'react-swipeable-views';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import * as $ from 'jquery';
import { getUploadedVideosByUserId } from "../../Services/UploadedVideo.service";
import Vedio from "../Vedio/Video";
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

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.paper,
        width: 500,
    },
}));

function a11yProps(index) {
    return {
        id: `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`,
    };
}
function Profile() {
    const classes = useStyles();
    const history = useHistory();
    const theme = useTheme();
    const { state, dispatch } = useStoreConsumer();
    const [value, setValue] = useState(0);
    const loggedInUser = state.loggedInUser;
    const [UserUploadedVideoList, setUserUploadedVideoList] = useState([]);

    useEffect(() => {
        $('html,body').animate({
            scrollTop: 0
        }, 500);
        getUploadedVideosByUserId(loggedInUser.key).subscribe((vdoList) => setUserUploadedVideoList(vdoList));
    }, [])

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleChangeIndex = (index) => {
        setValue(index);
    };

    return (
        <div className="profile-outer">
            <div className="profile-details-wrap clearfix">
                <div className="profile-img">
                    <AccountCircleOutlinedIcon />
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
                        <Tab label="Tagged" icon={<LoyaltyOutlinedIcon />} {...a11yProps(2)} />
                    </Tabs>
                    <SwipeableViews
                        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                        index={value}
                        onChangeIndex={handleChangeIndex}>
                        <TabPanel value={value} index={0} dir={theme.direction}>
                            <div className="flex-container" >
                                {UserUploadedVideoList.length !== 0 && UserUploadedVideoList.map((vdoObj) => {
                                    return <div className="flex-basis-3" style={{ marginRight: '30px' }} key={vdoObj.key}>
                                        <Vedio vdoObj={vdoObj} />
                                    </div>
                                })}
                            </div>
                        </TabPanel>
                        <TabPanel value={value} index={1} dir={theme.direction}>
                            <div className="flex-container" >
                                <div className="flex-basis-3" style={{ marginRight: '30px' }}>
                                    <iframe width="281" height="247" src="https://www.youtube.com/embed/p0evLf_humQ" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                                </div>
                                <div className="flex-basis-3" style={{ marginRight: '30px' }}>
                                    <iframe width="286" height="251" src="https://www.youtube.com/embed/3nFAkBYrrJw" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                                </div>
                                <div className="flex-basis-3" style={{ marginRight: '30px' }}>
                                    <iframe width="286" height="251" src="https://www.youtube.com/embed/f9dBgfEoqD4" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                                </div>
                            </div>
                        </TabPanel>
                        <TabPanel value={value} index={2} dir={theme.direction}>
                            <div className="flex-container" >
                                <div className="flex-basis-3" style={{ marginRight: '30px' }}>
                                    <iframe width="281" height="247" src="https://www.youtube.com/embed/p0evLf_humQ" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                                </div>
                                <div className="flex-basis-3" style={{ marginRight: '30px' }}>
                                    <iframe width="286" height="251" src="https://www.youtube.com/embed/3nFAkBYrrJw" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                                </div>
                                <div className="flex-basis-3" style={{ marginRight: '30px' }}>
                                    <iframe width="286" height="251" src="https://www.youtube.com/embed/f9dBgfEoqD4" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                                </div>
                            </div>
                        </TabPanel>
                    </SwipeableViews>
                </div>
            </div>
        </div>
    )
}

export default Profile
