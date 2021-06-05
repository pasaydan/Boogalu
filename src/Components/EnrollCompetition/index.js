import React, { useState, useEffect } from 'react'
import ArrowRightSharpIcon from '@material-ui/icons/ArrowRightSharp';
import Button from '@material-ui/core/Button';
import { useHistory } from "react-router-dom";
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { THUMBNAIL_URL } from '../../Constants';
import { useStoreConsumer } from '../../Providers/StateProvider';
import { updateVideo } from '../../Services/UploadedVideo.service';
import { saveCompetition, updateCompetition } from "../../Services/EnrollCompetition.service";
import { enableLoginFlow } from "../../Actions/LoginFlow";
import { setActiveCompetition } from "../../Actions/Competition";
import { enableLoading, disableLoading } from "../../Actions/Loader";
import { NOTIFICATION_ERROR, ADMIN_EMAIL_STAGING } from "../../Constants";
import { displayNotification } from "../../Actions/Notification";
import { sendEmail } from "../../Services/Email.service";
import { formatDate, formatTime } from "../../Services/Utils";

function EnrollCompetition({ handleClose, changeSelectedVdo }) {

    const history = useHistory();
    const { state, dispatch } = useStoreConsumer();
    const loggedInUser = state.loggedInUser;
    const competitionDetails = state.activeCompetition;
    const SelectedVdo = competitionDetails.selectedVideo;
    const [IsUserSubscribed, setIsUserSubscribed] = useState(null);

    useEffect(() => {
        if (loggedInUser.subscribed) {
            setIsUserSubscribed(true);
        } else {
            setIsUserSubscribed(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const onAgeGroupChange = (groupValue) => {
        let compData = { ...competitionDetails };
        compData.ageGroup = groupValue;
        dispatch(setActiveCompetition(compData));
    }

    const sendEmailToAdmin = () => {
        let emailBody = `<div>
            <h6 style="font-size: 17px;margin-bottom: 26px;">New Video Uploaded for competition ${competitionDetails.name}</h6>
            <h4>User details -</h4>
            <h6>${loggedInUser.name}</h6>
            <h6>${loggedInUser.email}</h6>
            <h6>${loggedInUser.phone}</h6>
            <a href=${competitionDetails.selectedVideo.url} >Clik here to check uploaded video</a>
            </div>`;
        let payload = {
            mailTo: ADMIN_EMAIL_STAGING,
            title: 'New video submited for competition',
            content: emailBody
        }
        sendEmail(payload).subscribe((res) => {
            if (!('error' in res)) {
                console.log('Admin Email Send Successfully.');
            } else console.log('Admin Email Send Failed.');
        })
    }

    const sendEmailToUser = () => {
        let vdoUploadUpto = new Date(competitionDetails.startAt);
        new Date(vdoUploadUpto.setDate(vdoUploadUpto.getDate() + 30));
        let displayDate = formatDate(vdoUploadUpto, 3) + " " + formatTime(vdoUploadUpto);

        let emailBody = `<div>
        <p>Hi ${loggedInUser.name} you have enrolled in our  ${competitionDetails.name}, now you can upload/change videos till ${displayDate}. </p>
        <h4> Upload your best performance video and be ready for exciting prizes</h4>
        <a href=${competitionDetails.selectedVideo.url} >Clik here to check uploaded video</a>
            </div>`;
        let payload = {
            mailTo: loggedInUser.email,
            title: 'Your video submited for competition',
            content: emailBody
        }
        sendEmail(payload).subscribe((res) => {
            if (!('error' in res)) {
                console.log('User Email Send Successfully.');
            } else console.log('User Email Send Failed.');
        })
    }

    const submitForCompetition = () => {
        dispatch(enableLoading());
        const competitionObj = {
            compId: competitionDetails.key,
            compName: competitionDetails.name,
            compImg: competitionDetails.img,
            userId: loggedInUser.key,
            vdo: {
                key: competitionDetails.selectedVideo.key,
                title: competitionDetails.selectedVideo.title,
                thumbnail: competitionDetails.selectedVideo.thumbnail,
                url: competitionDetails.selectedVideo.url,
                desc: competitionDetails.selectedVideo.desc,
            },
            ageGroup: competitionDetails?.ageGroup || competitionDetails?.userSubmitedDetails?.ageGroup,
            status: 'Submited'
        }
        console.log(competitionObj);
        if (competitionDetails.isUserEnrolled) {
            if (competitionDetails?.userSubmitedDetails?.vdo?.key) {
                const previousObj = Object.assign({}, competitionDetails.userSubmitedDetails.vdo);
                previousObj.enrolledCompetition = null;
                previousObj.userId = competitionDetails.userSubmitedDetails.userId;
                try {
                    updateVideo(previousObj.key, previousObj).subscribe(resp => {
                        try {
                            updateCompetition(competitionDetails.userSubmitedDetails.key, competitionObj).subscribe((response) => {
                                dispatch(disableLoading());
                                console.log('vdo updated for competition suceess');
                                history.push('/profile');
                            })
                        } catch(e) {
                            dispatch(disableLoading());
                            console.log('Error updating competition: ', e);
                        }
                    });
                } catch(e) {
                    dispatch(disableLoading());
                    console.log('update previous video error: ', e);
                }
            }
        } else {
            try {
                saveCompetition(competitionObj).subscribe((response) => {
                    dispatch(disableLoading());
                    sendEmailToAdmin();
                    sendEmailToUser();
                    console.log('vdo uploaded for competition suceess');
                    history.push('/profile');
                })
            } catch(e) {
                dispatch(disableLoading());
                console.log('Error saving competition: ', e);
            }
        }

        // handleClose();
    }

    const proceedForSubscription = () => {
        if (competitionDetails?.ageGroup || competitionDetails?.userSubmitedDetails?.ageGroup) {
            handleClose();
            dispatch(enableLoginFlow('competition-subscription'));
            history.push({
                pathname: '/subscription',
                state: null
            })
        } else {
            dispatch(displayNotification({
                msg: "Please select the age group!",
                type: NOTIFICATION_ERROR,
                time: 3000
            }))
        }
    }

    return (
        <div className="final-enrollment-wrap">
            {/* <img src={competitionDetails.img} alt={competitionDetails.name} style={{ width: '20%' }} /> */}
            {/* <p id="description">{competitionDetails.desc}</p> */}
            <h2 id="title">Basic Details for Enrollment</h2>
            <div className="detailsWrapOuter">
                <div className="basicDetailsWrapper">
                    <div className="userdata">
                        <div className="user-info"><label>Name:</label><span>{loggedInUser.name}</span></div>
                        <div className="user-info"><label>Phone:</label><span>{loggedInUser.phone}</span></div>
                        <div className="user-info"><label>Email:</label><span>{loggedInUser.email}</span></div>
                        <div className="user-info"><label>Gender:</label><span>{loggedInUser.gender}</span></div>
                    </div>
                    {!competitionDetails?.isUserEnrolled ? <div className="age-group-dropdown">
                        <FormControl variant="outlined" className="input-field">
                            <InputLabel id="select-outlined-label">Select Age Group</InputLabel>
                            <Select
                                labelId="select-outlined-label"
                                id="select-outlined"
                                value={competitionDetails.ageGroup}
                                onChange={(e) => onAgeGroupChange(e.target.value)}
                                label="Select Age Group"
                            >
                                <MenuItem value="Age 4 to 13 years">Age 4 to 13 years</MenuItem>
                                <MenuItem value="Age 14 to 17 years">Age 14 to 17 years</MenuItem>
                                <MenuItem value="Age 18 and above">Age 18 and above</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                        :
                        <div>Submited age group - {competitionDetails.userSubmitedDetails.ageGroup}</div>
                    }
                </div>
                {SelectedVdo && <div className="selected-vdo">
                    {/* <div className="sub-title">Video you have selected</div> */}
                    <div className="vdo-wrap">
                        <div className="videoTitle">Video Title: <span>{SelectedVdo.title}</span></div>
                        <div className="imgWrap">
                            <img src={SelectedVdo.thumbnail ? SelectedVdo.thumbnail : THUMBNAIL_URL} alt={SelectedVdo.title} />
                        </div>
                    </div>
                    <div className="change-link" onClick={() => changeSelectedVdo()}>Change</div>
                </div>}
            </div>
            {/* check for user subscribed or not */}
            {IsUserSubscribed ?
                <div className="continueButtonWrap">
                    {!competitionDetails?.isUserEnrolled ? 
                        <Button variant="contained" color="primary" onClick={() => submitForCompetition()}>Complete Enrollment <ArrowRightSharpIcon /></Button>
                        : <Button variant="contained" color="primary" onClick={() => submitForCompetition()}>Update Competition<ArrowRightSharpIcon /></Button>
                    }
                </div> :
                <div className="continueButtonWrap">
                    {/* <div>To upload video you need to subscribe</div> */}
                    <Button variant="contained" color="primary" onClick={() => proceedForSubscription()}>Continue</Button>
                </div>
            }
        </div>
    )
}

export default EnrollCompetition
