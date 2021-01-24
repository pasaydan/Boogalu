import React, { useState } from 'react'
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import ArrowRightSharpIcon from '@material-ui/icons/ArrowRightSharp';
import Button from '@material-ui/core/Button';
import { useHistory } from "react-router-dom";
import { useStoreConsumer } from '../../Providers/StateProvider';

function CompetitionsDetails({ competitionDetails, open, handleClose }) {

    const { state, dispatch } = useStoreConsumer();
    const history = useHistory();
    const loggedInUser = state.loggedInUser;
    const enrollCompetition = () => {
        // if user already login then redirect to home
        if (loggedInUser.name && loggedInUser.phone && loggedInUser.username) {

        } else {
            history.push({
                pathname: '/register',
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
                    <div className='inner-modal-wrap'>
                        <a className="close-modal-icon dark" onClick={handleClose}></a>
                        <h2 id="transition-modal-title">{competitionDetails.name}</h2>
                        <img src={competitionDetails.img} alt={competitionDetails.name} />
                        <p id="transition-modal-description">{competitionDetails.desc}</p>
                        <Button variant="contained" type="submit" color="primary" onClick={() => enrollCompetition()}>Enroll
                         <ArrowRightSharpIcon />
                        </Button>
                    </div>
                </Fade>
            </Modal>
        </div>
    )
}

export default CompetitionsDetails
