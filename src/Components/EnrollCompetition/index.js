import React, { useState } from 'react'
import ArrowRightSharpIcon from '@material-ui/icons/ArrowRightSharp';
import Button from '@material-ui/core/Button';
import { useHistory } from "react-router-dom";
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { THUMBNAIL_URL } from '../../Constants';
import { useStoreConsumer } from '../../Providers/StateProvider';

function EnrollCompetition({ handleClose, changeSelectedVdo }) {

    const { state, dispatch } = useStoreConsumer();
    const [AgeGroup, setAgeGroup] = useState('');
    const loggedInUser = state.loggedInUser;
    const competitionDetails = state.activeCompetition;
    const SelectedVdo = competitionDetails.selectedVideo;
    console.log(competitionDetails);
    const onAgeGroupChange = (groupValue) => {
        setAgeGroup(groupValue);
    }

    const submitForCompetition = () => {
        console.log(competitionDetails)
        // handleClose();
    }

    return (
        <div>
            <h2 id="title">Enroll for {competitionDetails.name}</h2>
            <img src={competitionDetails.img} alt={competitionDetails.name} style={{ width: '20%' }} />
            <p id="description">{competitionDetails.desc}</p>
            <div className="userdata">
                <div>Name:<span>{loggedInUser.name}</span></div>
                <div>Phone:<span>{loggedInUser.phone}</span></div>
                <div>Email:<span>{loggedInUser.email}</span></div>
                <div>Gender:<span>{loggedInUser.gender}</span></div>
            </div>
            <div className="age-group-dropdown">
                <FormControl variant="outlined" className="input-field">
                    <InputLabel id="select-outlined-label">Select Age Group</InputLabel>
                    <Select
                        labelId="select-outlined-label"
                        id="select-outlined"
                        value={AgeGroup}
                        onChange={(e) => onAgeGroupChange(e.target.value)}
                        label="Select Age Group"
                    >
                        <MenuItem value="1">Age 4 to 13 years</MenuItem>
                        <MenuItem value="2">Age 14 to 17 years</MenuItem>
                        <MenuItem value="3">Age 18 and above</MenuItem>
                    </Select>
                </FormControl>
            </div>
            {SelectedVdo && <div className="selected-vdo">
                <div>Selected video for competition -</div>
                <div onClick={() => changeSelectedVdo()}>Change</div>
                <div className="vdo-wrap" >
                    <img src={SelectedVdo.thumbnail ? SelectedVdo.thumbnail : THUMBNAIL_URL} style={{ width: "50%" }} />
                    <div>{SelectedVdo.title}</div>
                </div>
            </div>}
            <Button variant="contained" color="primary" onClick={() => submitForCompetition()}>Enroll Competition<ArrowRightSharpIcon /></Button>
        </div>
    )
}

export default EnrollCompetition
