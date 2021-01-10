import React, {useState, useEffect} from "react";
import { useStoreConsumer } from '../../Providers/StateProvider';
import bgImg from '../../Images/hip-hop.png';
import { useHistory } from "react-router-dom";

export default function Homepage() {
    const history = useHistory();
    const { state, dispatch } = useStoreConsumer();
    let loggedInUser = state.loggedInUser;
    const [danceImageVisibleClass, activeDanceImage] = useState('');

    useEffect(() => {
        setTimeout(() => {
            activeDanceImage('show'); 
        }, 800);
    }, []);

    return (
        <div className="homepage charcoal-bg clearfix">
            <div className="homepage-wrap clearfix">
                <div className="banner_vdo">
                    <div className="vdo_wrap rounded-dark-box">
                        <iframe width="100%" src="https://www.youtube.com/embed/i3yMXpeLPuU" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" noScaling={true} allowFullScreen></iframe>
                    </div>
                    <div className="vdo_wrap rounded-dark-box">
                        <iframe width="100%" src="https://www.youtube.com/embed/dM1ghaspLyc" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" noScaling={true} allowFullScreen></iframe>
                    </div>
                    <div className="vdo_wrap rounded-dark-box">
                        <iframe width="100%" src="https://www.youtube.com/embed/U7NaFiqSeVE" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" noScaling={true} allowFullScreen></iframe>
                    </div>
                </div>
                <div className="banner_img">
                    <h1>Dance Classes for Everyone</h1>
                    <div className="get-started-wrap">
                        <h4>The world’s best dance learning tools – at your fingertips. Start free for 7 days.</h4>
                        <button className="btn primary-light get_started" onClick={() => {
                            loggedInUser ? history.push('/lessons') : history.push('/login');
                        }}>Get Started</button>
                    </div>
                </div>
            </div>
            <div className={`home-img-wrap ${danceImageVisibleClass}`}>
                <img src={bgImg} alt="" />
            </div>
            <div className="homepage-display-1 charcoal-bg-dark">
                <div className="learn_choreo" id="Lessons">
                    <div className="heading-wrap">
                        <h2>
                            Learn Choreography To <br /> Your Favorite Songs
                        </h2>
                        <div className="line1">Dance to the music that makes YOU want to move at any skill level.</div>
                    </div>
                    <div className="flex-container vdo-wrap" >
                        <div className="flex-basis-3 rounded-dark-box">
                            <iframe className="iframe" src="//www.youtube.com/embed/i3yMXpeLPuU?wmode=transparent&amp;autoplay=0&amp;theme=dark&amp;controls=0&amp;autohide=0&amp;loop=0&amp;showinfo=0&amp;rel=0&amp;playlist=false&amp;enablejsapi=0" scrolling="no" noScaling={true} title="Vimeo embed" frameBorder="0" allow="autoplay; fullscreen" allowFullScreen={false}>
                            </iframe>
                        </div>
                        <div className="flex-basis-3 rounded-dark-box">
                            <iframe className="iframe" src="//cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fplayer.vimeo.com%2Fvideo%2F453549133%3Fapp_id%3D122963&amp;dntp=1&amp;display_name=Vimeo&amp;url=https%3A%2F%2Fvimeo.com%2F453549133%3Flazy%3D1&amp;image=https%3A%2F%2Fi.vimeocdn.com%2Fvideo%2F951136340_1280.jpg&amp;key=96f1f04c5f4143bcb0f2e68c87d65feb&amp;type=text%2Fhtml&amp;schema=vimeo" scrolling="no" title="Vimeo embed" frameBorder="0" noScaling={true} allow="autoplay; fullscreen" allowFullScreen={false}>
                            </iframe>
                        </div>
                        <div className="flex-basis-3 rounded-dark-box">
                            <iframe className="iframe" src="//cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fplayer.vimeo.com%2Fvideo%2F453549133%3Fapp_id%3D122963&amp;dntp=1&amp;display_name=Vimeo&amp;url=https%3A%2F%2Fvimeo.com%2F453549133%3Flazy%3D1&amp;image=https%3A%2F%2Fi.vimeocdn.com%2Fvideo%2F951136340_1280.jpg&amp;key=96f1f04c5f4143bcb0f2e68c87d65feb&amp;type=text%2Fhtml&amp;schema=vimeo" scrolling="no" title="Vimeo embed" frameBorder="0" noScaling={true} allow="autoplay; fullscreen" allowFullScreen={false}>
                            </iframe>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}