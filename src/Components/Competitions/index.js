import React, { useState, useEffect } from 'react'
import CompetitionsDetails from "../CompetitionsDetails";
import { getCompetitionsList } from "../../Services/Competition.service";
import { useStoreConsumer } from '../../Providers/StateProvider';
import { setActiveCompetition } from "../../Actions/Competition";
import { disableLoginFlow } from "../../Actions/LoginFlow";

function Competitions() {
    const { state, dispatch } = useStoreConsumer();
    const [isOpenDetailsModal, setIsOpenDetailsModal] = useState(state.currentLoginFlow ? true : false);
    const [CompletitionList, setCompletitionList] = useState(null);

    var initialStep = state.currentLoginFlow == 'competiotion' ? 3 : 1;

    useEffect(() => {
        getCompetitionsList().subscribe(list => setCompletitionList(list));
        if (state.currentLoginFlow == 'competiotion') {
            dispatch(disableLoginFlow());
        }
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
