import React, { useState, useEffect } from 'react'
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { useHistory } from "react-router-dom";
import { useStoreConsumer } from '../../Providers/StateProvider';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import { THUMBNAIL_URL } from '../../Constants';
import "./CompetitionsDetails.scss";
import EnrollCompetition from "../EnrollCompetition";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { setActiveCompetition } from "../../Actions/Competition";
import { enableLoginFlow } from "../../Actions/LoginFlow";
import { getUploadedVideosByUserId } from "../../Services/UploadedVideo.service";

function CompetitionsDetails({ open, handleClose, initialStep }) {

    const { state, dispatch } = useStoreConsumer();
    const history = useHistory();
    const competitionDetails = state.activeCompetition;
    console.log(competitionDetails);
    const loggedInUser = state.loggedInUser;
    const [userUploadedVdos, setUserUploadedVideoList] = useState([]);
    const [TnC, setTnC] = useState(false);
    const [ActiveStep, setActiveStep] = useState(initialStep || 1);
    // const [SelectedVdo, setSelectedVdo] = useState(null);

    useEffect(() => {
        (loggedInUser.email && ActiveStep === 2) && getUploadedVideosByUserId(loggedInUser.key).subscribe((vdoList) => setUserUploadedVideoList(vdoList));
    }, [ActiveStep])

    const useStyles = makeStyles((theme) => ({
        modal: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        paper: {
            backgroundColor: theme.palette.background.paper,
            border: '2px solid #000',
            boxShadow: theme.shadows[5],
            padding: theme.spacing(2, 4, 3),
        },
    }));
    const classes = useStyles();

    const selectVdo = (e, vdo) => {
        e.preventDefault();
        e.stopPropagation();
        let updatedVdos = userUploadedVdos;
        updatedVdos.map((item) => {
            if (item.key == vdo.key) {
                item.isSelected = true;
                let updatedCompetition = competitionDetails;
                updatedCompetition.selectedVideo = item;
                dispatch(setActiveCompetition(updatedCompetition));
            }
            else item.isSelected = false;
        })
        setUserUploadedVideoList([...updatedVdos]);
    }

    const enrollForCompetition = () => {
        if (loggedInUser.name && loggedInUser.phone && loggedInUser.username) {
            setActiveStep(2);
        } else {
            handleClose();
            dispatch(enableLoginFlow('competition'));
            history.push({
                pathname: '/login',
                state: null
            })
        }
    }

    return (
        <div>
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                className='competition-modal-box'
                open={open}
                onClose={handleClose}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Fade in={open}>
                    <div className={classes.paper}>
                        {ActiveStep == 1 && <IconButton onClick={() => { handleClose(); (state.activeCompetition && !state.currentLoginFlow) && dispatch(setActiveCompetition(null)) }}>
                            <CloseIcon />
                        </IconButton>}
                        {(ActiveStep == 2 || ActiveStep == 3) && <IconButton onClick={() => setActiveStep(ActiveStep - 1)}>
                            <ArrowBackIcon />
                        </IconButton>}
                        {ActiveStep == 1 && <div>
                            <h2 id="title">{competitionDetails.name}</h2>
                            <img src={competitionDetails.img} alt={competitionDetails.name} style={{ width: '20%' }} />

                            <div className="">About Competition-</div>
                            <p id="description">{competitionDetails.desc}</p>

                            <div>Age Category-</div>
                            <div >Age 4 to 13 years</div>
                            <div >Age 14 to 17 years</div>
                            <div >Age 18 and above</div>

                            <div id="fees">Fees: {competitionDetails.fee}</div>

                            <div className="start-at">
                                Start At: {competitionDetails.startingDate}
                            </div>
                            <div className="end-at">
                                End At: {competitionDetails.endingDate}
                            </div>

                            <div>Winners -</div>
                            <div>1. Top 3 Winner From Each Category Get Award.</div>
                            <div>2. There will be a three category as mention above.</div>
                            <div>1. Winner will be based on best performance.</div>
                            <div className="prices">
                                <div className="price-details">
                                    First Price : {competitionDetails.prices[0]}
                                </div>
                                <div className="price-details">
                                    Second Price : {competitionDetails.prices[1]}
                                </div>
                                <div className="price-details">
                                    Third Price : {competitionDetails.prices[2]}
                                </div>
                            </div>

                            <div>Submission And Result -</div>
                            <div>1. You Have to submit Your video till 15th June</div>
                            <div>2. Result will be declared on 16th June At 4 Pm On</div>
                            <div>1. Winner will be based on best performance.</div>

                            <h3>Time To Express Your Talent on Our Platform during this Lockdown</h3>

                            <div onClick={() => setTnC((TnC ? false : true))}>Terms & Conditions</div>
                            {TnC && <div>
                                <div>You may not be able to attend the live session if you are late.</div>
                                <div>You may face interruptions during the course of the live stream due to internet connectivity issues.</div>
                                <div>Show details and the artist lineup are subject to change as per the artist’s discretion.</div>
                                <div> No refunds on purchased tickets are possible, even in case of any rescheduling.</div>
                            </div>}
                            <Button variant="contained" color="primary" onClick={() => enrollForCompetition(2)}>Submit Video</Button>
                        </div>}

                        {ActiveStep === 2 && <div>
                            <div className="lessons-vdo-wrap">
                                {userUploadedVdos.length && userUploadedVdos.map((item, index) => {
                                    return <div className={item.isSelected ? 'vdo-outer selected-vdo' : 'vdo-outer'} key={index} onClick={(e) => selectVdo(e, item)}>
                                        <div className="vdo-wrap" >
                                            <img src={item.thumbnail ? item.thumbnail : THUMBNAIL_URL} style={{ width: "50%" }} />
                                            <div>{item.title}</div>
                                        </div>
                                    </div>
                                })}
                            </div>
                            <Button variant="contained" color="primary" onClick={() => setActiveStep(3)}>Submit</Button>
                        </div>}

                        {ActiveStep === 3 && <div>
                            <EnrollCompetition handleClose={(e) => handleClose(e)} changeSelectedVdo={() => setActiveStep(2)} />
                        </div>}
                    </div>
                </Fade>
            </Modal>
        </div>
    )
}


export default CompetitionsDetails
