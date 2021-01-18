import React, { useState } from 'react'
import boogaluLogo from '../../Images/Boogalu-logo.svg';
import CompetitionsDetails from "../CompetitionsDetails";
import EnrollCompetition from "../EnrollCompetition";
function Competitions() {
    const competitionsList = [
        { name: 'Free Style', img: boogaluLogo, startAt: "10-1-2021", endAt: "10-2-2021", fee: 250, desc: "Lessons for all users from our expert faculty members. From Hip-Hop to Bharatnatyam. You'll get all learning videos at one place.", priceDesc: ["First prize 6000 worth shoes", "Second prize 3000 worth shoes", "Third prize 1500 worth shoes"], type: 'running' },
        { name: 'HEELS', img: boogaluLogo, startAt: "10-1-2021", endAt: "10-2-2021", fee: 250, desc: "Lessons for all users from our expert faculty members. From Hip-Hop to Bharatnatyam. You'll get all learning videos at one place.", priceDesc: ["First prize 6000 worth shoes", "Second prize 3000 worth shoes", "Third prize 1500 worth shoes"], type: 'running' },
        { name: 'HOUSE', img: boogaluLogo, startAt: "10-1-2021", endAt: "10-2-2021", fee: 250, desc: "Lessons for all users from our expert faculty members. From Hip-Hop to Bharatnatyam. You'll get all learning videos at one place.", priceDesc: ["First prize 6000 worth shoes", "Second prize 3000 worth shoes", "Third prize 1500 worth shoes"], type: 'running' },
        { name: 'JAZZ FUNK', img: boogaluLogo, startAt: "10-1-2021", endAt: "10-2-2021", fee: 250, desc: "Lessons for all users from our expert faculty members. From Hip-Hop to Bharatnatyam. You'll get all learning videos at one place.", priceDesc: ["First prize 6000 worth shoes", "Second prize 3000 worth shoes", "Third prize 1500 worth shoes"], type: 'running' },
        { name: 'POPPING', img: boogaluLogo, startAt: "10-1-2021", endAt: "10-2-2021", fee: 250, desc: "Lessons for all users from our expert faculty members. From Hip-Hop to Bharatnatyam. You'll get all learning videos at one place.", priceDesc: ["First prize 6000 worth shoes", "Second prize 3000 worth shoes", "Third prize 1500 worth shoes"], type: 'running' },
        { name: 'WHACKING', img: boogaluLogo, startAt: "10-1-2021", endAt: "10-2-2021", fee: 250, desc: "Lessons for all users from our expert faculty members. From Hip-Hop to Bharatnatyam. You'll get all learning videos at one place.", priceDesc: ["First prize 6000 worth shoes", "Second prize 3000 worth shoes", "Third prize 1500 worth shoes"], type: 'running' },
    ]
    const [isOpenDetailsModal, setIsOpenDetailsModal] = useState(false);
    const [activeCompetition, setActiveCompetition] = useState(false);
    const [EnrollForCompetiotion, setEnrollForCompetiotion] = useState(false);
    const handleClose = (status) => {
        setIsOpenDetailsModal(false);
        if (status == 'enroll-for-competition') {
            setEnrollForCompetiotion(true);
        }
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
            {!EnrollForCompetiotion && isOpenDetailsModal && <CompetitionsDetails competitionDetails={activeCompetition} open={isOpenDetailsModal} handleClose={(e) => handleClose(e)} />}
            {EnrollForCompetiotion && !isOpenDetailsModal && <EnrollCompetition competitionDetails={activeCompetition} open={isOpenDetailsModal} handleClose={(e) => handleClose(e)} from={"competitionDetails"} />}
        </div>
    )
}

export default Competitions
