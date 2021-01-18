import React, { useState } from 'react'
import boogaluLogo from '../../Images/Boogalu-logo.svg';
import CompetitionsDetails from "../CompetitionsDetails/index";
function Competitions() {
    const competitionsList = [
        { name: 'Hip Hop', img: boogaluLogo, desc: "Lessons for all users from our expert faculty members. From Hip-Hop to Bharatnatyam. You'll get all learning videos at one place.", type: 'running' },
        { name: 'HEELS', img: boogaluLogo, desc: "Lessons for all users from our expert faculty members. From Hip-Hop to Bharatnatyam. You'll get all learning videos at one place.", type: 'running' },
        { name: 'HOUSE', img: boogaluLogo, desc: "Lessons for all users from our expert faculty members. From Hip-Hop to Bharatnatyam. You'll get all learning videos at one place.", type: 'running' },
        { name: 'JAZZ FUNK', img: boogaluLogo, desc: "Lessons for all users from our expert faculty members. From Hip-Hop to Bharatnatyam. You'll get all learning videos at one place.", type: 'running' },
        { name: 'POPPING', img: boogaluLogo, desc: "Lessons for all users from our expert faculty members. From Hip-Hop to Bharatnatyam. You'll get all learning videos at one place.", type: 'running' },
        { name: 'WHACKING', img: boogaluLogo, desc: "Lessons for all users from our expert faculty members. From Hip-Hop to Bharatnatyam. You'll get all learning videos at one place.", type: 'running' },
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
        <div className="competitions master_styles">
            <div id="Competitions">
                <div className="heading-wrap">
                    <h1>
                        Master A Variety Of Styles
                </h1>
                    <div className="line1">Learn moves, skills, and full routines in a range of popular styles.</div>
                </div>
            </div>
            <div className="flex-container-wrap" >
                {competitionsList && competitionsList.map((competition) => {
                    return <div className="flex-basis-3">
                        <div className="comp-img" onClick={() => openDetailsModal(competition)}>
                            <img src={competition.img} alt={competition.name} />
                            <h2 className="style-name">{competition.name}</h2>
                        </div>
                    </div>
                })}
            </div>

            <CompetitionsDetails competitionDetails={activeCompetition} open={isOpenDetailsModal} handleClose={() => handleClose()} />
        </div>
    )
}

export default Competitions
