import React, { useRef, useState, useEffect } from 'react'
import Button from '@material-ui/core/Button';
import { useStoreConsumer } from '../../Providers/StateProvider';
import { useHistory } from "react-router-dom";
import { formatDate } from "../../Services/Utils";
import { SUBSCRIPTION_ACTIVE_STATUS, SUBSCRIPTION_ENDED_STATUS } from "../../Constants";
// modal imports
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';

export default function BuySubsription({ handleClose, activeStep }) {
    const history = useHistory();
    const { state, dispatch } = useStoreConsumer();
    const loggedInUser = state.loggedInUser;
    const [openDetailsModal, setOpenDetailsModal] = useState(true);
    const subscriptionDetails = state.activeSubscription;
    const [subsciptionValidity, setsubsciptionValidity] = useState(null);

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

    useEffect(() => {
        let validUpto = new Date();
        new Date(validUpto.setDate(validUpto.getDate() + 30));
        let displayDate = formatDate(validUpto, 3);
        setsubsciptionValidity(displayDate);
    }, [subscriptionDetails])

    const handleModalClose = () => {
        setOpenDetailsModal(false);
        handleClose();
    }

    const submitForSubscription = () => {
        const finalSubscriptionDetails = {
            subscribedAt: new Date(),
            subsId: subscriptionDetails.key,
            status: SUBSCRIPTION_ACTIVE_STATUS, // current subscription status Active or Ended
            paymentId: ''
        }
        console.log(finalSubscriptionDetails)
    }

    const proceedForPayment = () => {
        var params = "?phone=" + loggedInUser.phone + "&orderId=" + subscriptionDetails.key + "&amount=" + subscriptionDetails.amount + "&uId=" + loggedInUser.uId + "&email=" + loggedInUser.email;
        window.open('http://localhost:5001/boogalusite/us-central1/payment' + params, '_self');
    }

    return (
        <div>
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                className='competition-modal-box'
                open={openDetailsModal}
                onClose={() => handleModalClose(false)}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Fade in={openDetailsModal}>
                    <div className={classes.paper}>
                        <IconButton onClick={() => handleModalClose(false)}>
                            <CloseIcon />
                        </IconButton>
                        {activeStep == 1 && <div>
                            <div className="subs-details-wrap">
                                <div>{subscriptionDetails.name}</div>
                                <div>{subscriptionDetails.desc}</div>
                                <div>{subscriptionDetails.amount} / {subscriptionDetails.plans}</div>
                                <div>Valid Upto- {subsciptionValidity}</div>
                            </div>
                            <Button variant="contained" color="secondary" onClick={(e) => proceedForPayment(e)}>Subscribe</Button>
                        </div>}
                        {activeStep == 2 && <div>
                            <div>payment success</div>
                            <Button variant="contained" color="secondary" onClick={(e) => history.push('/competitions')}>Continue to competition</Button>
                        </div>}
                        {activeStep == 3 && <div>
                            <div>payment fail</div>
                            <Button variant="contained" color="secondary" onClick={(e) => proceedForPayment(e)}>Retry</Button>
                        </div>}
                    </div>
                </Fade>
            </Modal>
        </div>
    )
}