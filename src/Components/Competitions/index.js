import React, { useState, useEffect } from 'react'
import CompetitionsDetails from "../CompetitionsDetails";
import { getCompetitionsList } from "../../Services/Competition.service";
import { useStoreConsumer } from '../../Providers/StateProvider';
import { setActiveCompetition } from "../../Actions/Competition";
import { disableLoginFlow } from "../../Actions/LoginFlow";
import { getCompetitionByUserId } from "../../Services/EnrollCompetition.service";

function Competitions() {
    const { state, dispatch } = useStoreConsumer();
    const [isOpenDetailsModal, setIsOpenDetailsModal] = useState(state.currentLoginFlow == 'competition' ? true : false);
    const [CompletitionList, setCompletitionList] = useState(null);
    const [initialStep, setInitialStep] = useState(state.currentLoginFlow == 'competition' ? 3 : 1);
    const loggedInUser = state.loggedInUser;

    const prepareUserCompData = (allCompList) => {
        return new Promise((res, rej) => {
            getCompetitionByUserId(loggedInUser.key).subscribe((userCompList) => {
                if (userCompList.length) {
                    allCompList.map((compDetails) => {
                        let isUserEnrolled = userCompList.filter((userCompData) => userCompData.compId == compDetails.key);
                        if (isUserEnrolled.length) {
                            compDetails.isUserEnrolled = true;
                            compDetails.userSubmitedDetails = isUserEnrolled[0];
                        }
                    })
                    res(allCompList);
                } else res(allCompList);
            });
        })
    }

    useEffect(() => {
        getCompetitionsList().subscribe(allCompList => {
            if (allCompList.length && loggedInUser.email && loggedInUser.phone) {
                // get user submitted competition details
                prepareUserCompData(allCompList).then((compListWithUserData) => {
                    setCompletitionList(compListWithUserData);
                    console.log(compListWithUserData)
                })
            } else setCompletitionList(allCompList);
        });
        if (state.currentLoginFlow == 'competition') {
            dispatch(disableLoginFlow());
        }
    }, [])

    const openDetailsModal = (competition) => {
        if (competition.isUserEnrolled) setInitialStep(2);
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
                            <h2>{competition.name}  {competition.isUserEnrolled && <span>- Video submitted</span>}</h2>
                        </li>
                    })}
                </ul>

                {isOpenDetailsModal && <CompetitionsDetails open={isOpenDetailsModal} handleClose={() => setIsOpenDetailsModal(false)} initialStep={initialStep} />}
            </div>
        </div>
    )
}

export default Competitions
