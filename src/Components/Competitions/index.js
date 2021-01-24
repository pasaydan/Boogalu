import React, { useState, useEffect } from 'react'
import boogaluLogo from '../../Images/Boogalu-logo.svg';
import CompetitionsDetails from "../CompetitionsDetails";
import { getCompetitionsList } from "../../Services/Competition";
function Competitions() {
    const competitionsList = [
        { name: 'Free Style', img: boogaluLogo, startAt: "10-1-2021", endAt: "10-2-2021", fee: 250, desc: "Lessons for all users from our expert faculty members. From Hip-Hop to Bharatnatyam. You'll get all learning videos at one place.", priceDesc: ["First prize 6000 worth shoes", "Second prize 3000 worth shoes", "Third prize 1500 worth shoes"], active: true, type: 'running' },
        { name: 'HEELS', img: boogaluLogo, startAt: "10-1-2021", endAt: "10-2-2021", fee: 250, desc: "Lessons for all users from our expert faculty members. From Hip-Hop to Bharatnatyam. You'll get all learning videos at one place.", priceDesc: ["First prize 6000 worth shoes", "Second prize 3000 worth shoes", "Third prize 1500 worth shoes"], active: true, type: 'running' },
        { name: 'HOUSE', img: boogaluLogo, startAt: "10-1-2021", endAt: "10-2-2021", fee: 250, desc: "Lessons for all users from our expert faculty members. From Hip-Hop to Bharatnatyam. You'll get all learning videos at one place.", priceDesc: ["First prize 6000 worth shoes", "Second prize 3000 worth shoes", "Third prize 1500 worth shoes"], active: true, type: 'running' },
        { name: 'JAZZ FUNK', img: boogaluLogo, startAt: "10-1-2021", endAt: "10-2-2021", fee: 250, desc: "Lessons for all users from our expert faculty members. From Hip-Hop to Bharatnatyam. You'll get all learning videos at one place.", priceDesc: ["First prize 6000 worth shoes", "Second prize 3000 worth shoes", "Third prize 1500 worth shoes"], active: true, type: 'running' },
        { name: 'POPPING', img: boogaluLogo, startAt: "10-1-2021", endAt: "10-2-2021", fee: 250, desc: "Lessons for all users from our expert faculty members. From Hip-Hop to Bharatnatyam. You'll get all learning videos at one place.", priceDesc: ["First prize 6000 worth shoes", "Second prize 3000 worth shoes", "Third prize 1500 worth shoes"], active: true, type: 'running' },
        { name: 'WHACKING', img: boogaluLogo, startAt: "10-1-2021", endAt: "10-2-2021", fee: 250, desc: "Lessons for all users from our expert faculty members. From Hip-Hop to Bharatnatyam. You'll get all learning videos at one place.", priceDesc: ["First prize 6000 worth shoes", "Second prize 3000 worth shoes", "Third prize 1500 worth shoes"], active: true, type: 'running' },
    ]
    const [isOpenDetailsModal, setIsOpenDetailsModal] = useState(false);
    const [activeCompetition, setActiveCompetition] = useState(false);
    const [CompletitionList, setCompletitionList] = useState(null);

    useEffect(() => {
        getCompetitionsList().subscribe(list => setCompletitionList(list));
    }, [])

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
                {CompletitionList && CompletitionList.map((competition) => {
                    return <li onClick={() => openDetailsModal(competition)} key={competition.key}>
                        <div>
                            <img src={competition.img} alt={competition.name} style={{ width: '100%' }} />
                        </div>
                        <h2>{competition.name}</h2>
                    </li>
                })}
            </ul>
            { isOpenDetailsModal && <CompetitionsDetails competitionDetails={activeCompetition} open={isOpenDetailsModal} handleClose={(e) => setIsOpenDetailsModal(false)} />}
        </div>
    )
}

export default Competitions
