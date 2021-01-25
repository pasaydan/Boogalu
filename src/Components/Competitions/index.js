import React, { useState, useEffect } from 'react'
import CompetitionsDetails from "../CompetitionsDetails";
import { getCompetitionsList } from "../../Services/Competition";
import { useStoreConsumer } from '../../Providers/StateProvider';
import { disableLoginFlow, setActiveCompetition } from "../../Actions/Competition";

function Competitions() {
    const { state, dispatch } = useStoreConsumer();
    const [isOpenDetailsModal, setIsOpenDetailsModal] = useState(false);
    const [CompletitionList, setCompletitionList] = useState(null);

    var initialStep = 1;
    if (state.competitionLogginFlow) {
        initialStep = 3;
        dispatch(disableLoginFlow());
        setIsOpenDetailsModal(true);
    }

    useEffect(() => {
        getCompetitionsList().subscribe(list => setCompletitionList(list));
    }, [])

    const openDetailsModal = (competition) => {
        dispatch(setActiveCompetition(competition));
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
                    {CompletitionList && CompletitionList.map((competition) => {
                        return <li key={competition.name + '-id'} onClick={() => openDetailsModal(competition)}>
                            <img src={competition.img} alt={competition.name} />
                            <h2>{competition.name}</h2>
                        </li>
                    })}
                </ul>

                {isOpenDetailsModal && <CompetitionsDetails open={isOpenDetailsModal} handleClose={() => setIsOpenDetailsModal(false)} initialStep={initialStep} />}
            </div>
        </div>
    )
}

export default Competitions
