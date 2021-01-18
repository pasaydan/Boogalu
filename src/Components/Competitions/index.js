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
            {!EnrollForCompetiotion && isOpenDetailsModal && <CompetitionsDetails competitionDetails={activeCompetition} open={isOpenDetailsModal} handleClose={(e) => handleClose(e)} />}
            {EnrollForCompetiotion && !isOpenDetailsModal && <EnrollCompetition competitionDetails={activeCompetition} open={isOpenDetailsModal} handleClose={(e) => handleClose(e)} from={"competitionDetails"} />}
        </div>
    )
}

export default Competitions
