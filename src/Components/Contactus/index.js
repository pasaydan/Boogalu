import React from 'react';

function ContactUs () {
    return (
        <div className="contact-us-wrap charcoal-bg" id="contactUsPage">
            <div className="inner-page">
                <h1>Reach us with your queries or concerns, &amp; we'll help you with that.</h1>
                <form className="contact-form">
                    <div className='control-group'>
                        <input type="text" required id="name" name="fullname" placeholder="Full name*" />
                    </div>
                    <div className='control-group'>
                        <input type="email" required id="email" name="emailid" placeholder="Valid email id*" />
                    </div>
                    <div className='control-group'>
                        <input type="text" required id="phone" name="phone" placeholder="Valid phone number*" />
                    </div>
                    <div className='control-group'>
                        <input type="text" id="address" name="address" placeholder="Your address" />
                    </div>
                    <div className='control-group'>
                        <input type="text" required id="subject" name="subject" placeholder="Subject*" />
                    </div>
                    <div className='control-group'>
                        <textarea id="message" name="message" required placeholder="Query/Message/Concerns*"></textarea>
                    </div>
                    <div className="control-group action-group">
                        <button className="btn reset-btn">Clear</button>
                        <button className="btn primary-light">Send</button>
                    </div>
                </form>
                <div className="address-block">
                    +91-9920518931 /  9619828307 / 9884588775<br/>
                    Mahaprgya Hights No. 49 Sector - 20, kharghar, Navi Mumbai Opposite Metro Bridge, Reliance fresh road   
                </div>
            </div>
        </div>
    )
}

export default ContactUs;
