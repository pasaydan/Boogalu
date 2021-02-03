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
import { saveCompetition, updateCompetition } from "../../Services/EnrollCompetition.service";
import { enableLoginFlow } from "../../Actions/LoginFlow";
import { setActiveCompetition } from "../../Actions/Competition";
import { enableLoading, disableLoading } from "../../Actions/Loader";
import { NOTIFICATION_ERROR } from "../../Constants";
import { displayNotification } from "../../Actions/Notification";

function EnrollCompetition({ handleClose, changeSelectedVdo }) {

    const history = useHistory();
    const { state, dispatch } = useStoreConsumer();
    const loggedInUser = state.loggedInUser;
    const competitionDetails = state.activeCompetition;
    const SelectedVdo = competitionDetails.selectedVideo;
    const [IsUserSubscribed, setIsUserSubscribed] = useState(null);

    useEffect(() => {
        if (loggedInUser.subscriptions) {
            let isSubscribed = loggedInUser.subscriptions.filter((data) => data.type === 'competition-enrollment');
            if (isSubscribed.length) setIsUserSubscribed(true);
            else setIsUserSubscribed(false);
        } else setIsUserSubscribed(false);
    }, [])

    const onAgeGroupChange = (groupValue) => {
        let compData = { ...competitionDetails };
        compData.ageGroup = groupValue;
        dispatch(setActiveCompetition(compData));
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
            ageGroup: competitionDetails.ageGroup,
            status: 'Submited'
        }
        console.log(competitionObj)
        if (competitionDetails.isUserEnrolled) {
            updateCompetition(competitionDetails.userSubmitedDetails.key, competitionObj).subscribe((response) => {
                dispatch(disableLoading());
                console.log('vdo updated for competition suceess');
                history.push('/profile');
            })
        } else {
            saveCompetition(competitionObj).subscribe((response) => {
                dispatch(disableLoading());
                console.log('vdo uploaded for competition suceess');
                history.push('/profile');
            })
        }

        // handleClose();
    }

    const proceedForSubscription = () => {
        if(competitionDetails.ageGroup){
            handleClose();
            dispatch(enableLoginFlow('competition-subscription'));
            history.push({
                pathname: '/subscription',
                state: null
            })
        }else{
            dispatch(displayNotification({
                msg: "Please the age group!",
                type: NOTIFICATION_ERROR,
                time: 3000
            }))
        }
    }

    return (
        <div className="final-enrollment-wrap">
            <h2 id="title">Basic Details for Enrollment</h2>
            {/* <img src={competitionDetails.img} alt={competitionDetails.name} style={{ width: '20%' }} /> */}
            {/* <p id="description">{competitionDetails.desc}</p> */}
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
            {SelectedVdo && <div className="selected-vdo">
                <div className="sub-title">Selected video for competition</div>
                <div className="change-link" onClick={() => changeSelectedVdo()}>Change</div>
                <div className="vdo-wrap" >
                    <img src={SelectedVdo.thumbnail ? SelectedVdo.thumbnail : THUMBNAIL_URL} style={{ width: "50%" }} />
                    <div>{SelectedVdo.title}</div>
                </div>
            </div>}
            {/* check for user subscribed or not */}
            {IsUserSubscribed ?
                <div>
                    {!competitionDetails?.isUserEnrolled ? <Button variant="contained" color="primary" onClick={() => submitForCompetition()}>Complete Enrollment <ArrowRightSharpIcon /></Button>
                        : <Button variant="contained" color="primary" onClick={() => submitForCompetition()}>Update Competition<ArrowRightSharpIcon /></Button>
                    }
                </div> :
                <div>
                    {/* <div>To upload video you need to subscribe</div> */}
                    <Button variant="contained" color="primary" onClick={() => proceedForSubscription()}>Continue</Button>
                </div>
            }
        </div>
    )
}

export default EnrollCompetition
