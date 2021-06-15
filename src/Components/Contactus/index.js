import React, { useState, useEffect } from 'react';
import { useStoreConsumer } from '../../Providers/StateProvider';
import { submitEnquiry } from "../../Services/Other.service";
import Button from '@material-ui/core/Button';
import { useHistory } from "react-router-dom";

// modal imports
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';

function ContactUs() {

    let initialFields = {
        name: '',
        email: '',
        phone: '',
        address: '',
        subject: '',
        message: ''
    }
    const { state } = useStoreConsumer();
    let loggedInUser = state.loggedInUser;
    const history = useHistory();
    const [formFields, setFormFields] = useState(initialFields);
    const [enquirySubmitted, setEnquirySubmitted] = useState(false)
    useEffect(() => {
        if (state.loggedInUser?.username) {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            initialFields = {
                name: loggedInUser.name,
                email: loggedInUser.email,
                phone: loggedInUser.phone,
                address: '',
                subject: '',
                message: ''
            }
            setFormFields(initialFields);
        }
    }, [state])

    const handleChange = (prop) => (event) => {
        setFormFields({ ...formFields, [prop]: event.target.value });
    };

    const clearForm = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setFormFields(initialFields);
    }

    const submitForm = (e) => {
        e.preventDefault();
        e.stopPropagation();
        submitEnquiry(formFields).subscribe(() => {
            setEnquirySubmitted(true);
        })
    }

    const redirectTo = () => {
        history.push('/')
    }

    return (
        !enquirySubmitted ? <div className="contact-us-wrap charcoal-bg paddingTop90" id="contactUsPage">
            <div className="inner-page">
                <h1>Reach us with your queries or concerns, &amp; we'll help you with that.</h1>
                <form className="contact-form" onSubmit={submitForm}>
                    <div className='control-group'>
                        <input value={formFields.name} onChange={handleChange('name')} type="text" required id="name" name="fullname" placeholder="Full name*" />
                    </div>
                    <div className='control-group'>
                        <input value={formFields.email} onChange={handleChange('email')} type="email" required id="email" name="emailid" placeholder="Valid email id*" />
                    </div>
                    <div className='control-group'>
                        <input value={formFields.phone} onChange={handleChange('phone')} type="text" required id="phone" name="phone" placeholder="Valid phone number*" />
                    </div>
                    <div className='control-group'>
                        <input value={formFields.address} onChange={handleChange('address')} type="text" id="address" name="address" placeholder="Your address" />
                    </div>
                    <div className='control-group'>
                        <input value={formFields.subject} onChange={handleChange('subject')} type="text" required id="subject" name="subject" placeholder="Subject*" />
                    </div>
                    <div className='control-group'>
                        <textarea value={formFields.message} onChange={handleChange('message')} id="message" name="message" required placeholder="Query/Message/Concerns*"></textarea>
                    </div>
                    <div className="control-group action-group">
                        <button className="btn reset-btn" onClick={(e) => clearForm(e)}>Clear</button>
                        <button className="btn primary-light" type="submit">Send</button>
                    </div>
                </form>
                <div className="address-block">
                    +91-9920518931 /  9619828307 / 9884588775<br />
                    Mahaprgya Hights No. 49 Sector - 20, kharghar, Navi Mumbai Opposite Metro Bridge, Reliance fresh road
                </div>
            </div>
        </div> :
            <div className="subscription-modal-wrap">
                <Modal
                    aria-labelledby="transition-modal-title"
                    aria-describedby="transition-modal-description"
                    className='subscription-modal-box'
                    open={enquirySubmitted}
                    onClose={() => redirectTo()}
                    closeAfterTransition
                    BackdropComponent={Backdrop}
                    BackdropProps={{
                        timeout: 500,
                    }}
                >
                    <Fade in={enquirySubmitted}>
                        <div className="subscription-inner-modal">
                            <IconButton className="close-modal-btn" onClick={() => redirectTo()}>
                                <CloseIcon />
                            </IconButton>
                            <h3 className="confirmation-heading">Thank you for your enquiry</h3>
                            <div className="confirmation-content">Your message has been sent successfully.</div>
                            <div className="confirmation-content">Thank you for your enquiry. Will be get back to you as soon as possible.</div>
                            <Button variant="contained" color="secondary" onClick={(e) => redirectTo()}>Ok</Button>
                        </div>
                    </Fade>
                </Modal>
            </div >

    )
}

export default ContactUs;
