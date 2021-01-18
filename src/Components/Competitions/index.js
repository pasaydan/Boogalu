import React, { useState } from 'react'
import boogaluLogo from '../../Images/Boogalu-logo.svg';
import CompetitionsDetails from "../CompetitionsDetails/index";
function Competitions() {
    const competitionsList = [
        { name: 'Hip Hop', img: boogaluLogo, desc: "Lessons for all users from our expert faculty members. From Hip-Hop to Bharatnatyam. You'll get all learning videos at one place.", type: 'running' },
        { name: 'HEELS', img: boogaluLogo, desc: "Lessons for all users from our expert faculty members. From Hip-Hop to Bharatnatyam. You'll get all learning videos at one place.", type: 'running' },
        { name: 'HOUSE', img: boogaluLogo, desc: "Lessons for all users from our expert faculty members. From Hip-Hop to Bharatnatyam. You'll get all learning videos at one place.", type: 'running' },
        // { name: 'JAZZ FUNK', img: boogaluLogo, desc: "Lessons for all users from our expert faculty members. From Hip-Hop to Bharatnatyam. You'll get all learning videos at one place.", type: 'running' },
        // { name: 'POPPING', img: boogaluLogo, desc: "Lessons for all users from our expert faculty members. From Hip-Hop to Bharatnatyam. You'll get all learning videos at one place.", type: 'running' },
        // { name: 'WHACKING', img: boogaluLogo, desc: "Lessons for all users from our expert faculty members. From Hip-Hop to Bharatnatyam. You'll get all learning videos at one place.", type: 'running' },
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
            <div >
                <div className="">
                    <h1>Competitions running now!</h1>
                    <div className="competition-desc">Learn moves, skills, and full routines in a range of popular styles.</div>
                </div>
            </div>
            <ul className="competition-list" >
                {competitionsList && competitionsList.map((competition) => {
                    return <li onClick={() => openDetailsModal(competition)}>
                        <div>
                            <img src={competition.img} alt={competition.name} />
                        </div>
                        <h2>{competition.name}</h2>
                    </li>
                })}
            </ul>

            <CompetitionsDetails competitionDetails={activeCompetition} open={isOpenDetailsModal} handleClose={() => handleClose()} />
        </div>
    )
}

export default Competitions
