import React from 'react';
import { Link } from 'react-router-dom';
import boogaluLogo from '../../Images/Boogaluu-logo.png';
import championIcon from '../../Images/champion-box-icon.png';
import lessonsIcon from '../../Images/lessons-icon.png';
import subscribeIcon from '../../Images/subscribe-icon.png';
import usersIcon from '../../Images/users-icon.png';

export default function AdminPanel() {
    return (
        <div className="adminPanelSection">
            <div className="container">
                <div className="logoWrap">
                    <img src={boogaluLogo} alt="Boogaluu" />
                </div>
                <h1>Welcome to Boogaluu Admin Panel</h1>
                <p className="subHeading">Here you can create Championships, Subscriptions or Lessons for our users</p>

                <div className="optionsWrap">
                    <Link to="/adminpanel/competition" title="create championship" className="panelLink">
                        <span className="iconsWrap championIconWrap">
                            <img src={championIcon} alt="championship" />
                        </span>
                        <span className="title">
                            Create Championship
                        </span>
                    </Link>
                    <Link to="/adminpanel/lessons" title="upload new lessons" className="panelLink">
                        <span className="iconsWrap lessonsIconWrap">
                            <img src={lessonsIcon} alt="lessons" />
                        </span>
                        <span className="title">
                            Upload Lessons
                        </span>
                    </Link>
                    <Link to="/adminpanel/subscription" title="create subscription" className="panelLink">
                        <span className="iconsWrap subscribeIconWrap">
                            <img src={subscribeIcon} alt="subscription" />
                        </span>
                        <span className="title">
                            Create Subscription
                        </span>
                    </Link>
                    <Link to="/adminpanel/users" title="manage users" className="panelLink">
                        <span className="iconsWrap usersIconWrap">
                            <img src={usersIcon} alt="users" />
                        </span>
                        <span className="title">
                            Manage Users
                        </span>
                    </Link>
                </div>
            </div>            
            <div className="footerBox">
                &copy; 2021 Box Puppet Ent. Pvt. Ltd., All rights reserved. 
            </div>
        </div>
    )
}
