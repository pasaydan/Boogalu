import React, { useState, useEffect } from 'react'
import boogaluLogo from '../../Images/Boogalu-logo.svg';
import CompetitionsDetails from "../CompetitionsDetails";
import { getCompetitionsList } from "../../Services/Competition";
function Competitions() {
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
            <div className="competition-inner">
                <div className="title-wrap">
                    <h1>Competitions running now!</h1>
                    <div className="competition-desc">Learn moves, skills, and full routines in a range of popular styles.</div>
                </div>
                <ul className="competition-list" >
                    {CompletitionList && CompletitionList.map((competition) => {
                        return <li key={competition.name + '-id'} onClick={() => openDetailsModal(competition)}>
                            <img src={competition.img} alt={competition.name} />
                            <h2>{competition.name}</h2>
                        </li>
                    })}
                </ul>

                {isOpenDetailsModal && <CompetitionsDetails competitionDetails={activeCompetition} open={isOpenDetailsModal} handleClose={() => setIsOpenDetailsModal(false)} />}
            </div>
        </div>
    )
}

export default Competitions
