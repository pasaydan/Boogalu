import React, { useState } from 'react'
import CompetitionsDetails from "../CompetitionsDetails/index";
function Competitions() {
    const competitionsList = [
        { 
            name: 'Free style', 
            img: 'https://i.imgur.com/EUVZ1Rg.jpg', 
            desc: "Lessons for all users from our expert faculty members. From Hip-Hop to Bharatnatyam. You'll get all learning videos at one place.", 
            type: 'running' 
        },
        { 
            name: 'Beatboxing', 
            img: 'https://i.imgur.com/GU7eOFR.jpg', 
            desc: "Lessons for all users from our expert faculty members. From Hip-Hop to Bharatnatyam. You'll get all learning videos at one place.", 
            type: 'running' 
        },
        { 
            name: 'Body art', 
            img: 'https://i.imgur.com/Pppi3VA.jpg', 
            desc: "Lessons for all users from our expert faculty members. From Hip-Hop to Bharatnatyam. You'll get all learning videos at one place.", 
            type: 'running' 
        }
    ]
    const [isOpenDetailsModal, setIsOpenDetailsModal] = useState(false);
    const [activeCompetition, setActiveCompetition] = useState(false);
    const handleClose = () => {
        setIsOpenDetailsModal(false);
    }
    const openDetailsModal = (competition) => {
        setActiveCompetition(competition);
        setIsOpenDetailsModal(true);
    }
    return (
        <div className="competition-wrap">
            <div className="competition-inner">
                <div className="title-wrap">
                    <h1>Our Active Competition !</h1>
                    <div className="competition-desc">Participate in different competitions &amp; win exciting prizes.</div>
                </div>
                <ul className="competition-list" >
                    {competitionsList && competitionsList.map((competition) => {
                        return <li key={competition.name + '-id'} onClick={() => openDetailsModal(competition)}>
                            <img src={competition.img} alt={competition.name} />
                            <h2>{competition.name}</h2>
                        </li>
                    })}
                </ul>

                <CompetitionsDetails competitionDetails={activeCompetition} open={isOpenDetailsModal} handleClose={() => handleClose()} />
            </div>
        </div>
    )
}

export default Competitions
