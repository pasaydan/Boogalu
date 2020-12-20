import React from 'react'
import './Lessons.css'

function Lessons() {
    return (
        <div className="lessons">
            <div className="learn_choreo" id="Lessons">
                <div className="heading-wrap">
                    <h1>
                        Learn Choreography To <br /> Your Favorite Songs
                </h1>
                    <div className="line1">Dance to the music that makes YOU want to move at any skill level.</div>
                </div>
                <div className="flex-container" >
                    <div className="flex-basis-3">
                        <iframe className="iframe" src="//www.youtube.com/embed/i3yMXpeLPuU?wmode=transparent&amp;autoplay=0&amp;theme=dark&amp;controls=0&amp;autohide=0&amp;loop=0&amp;showinfo=0&amp;rel=0&amp;playlist=false&amp;enablejsapi=0" scrolling="no" title="Vimeo embed" frameborder="0" allow="autoplay; fullscreen" allowfullscreen="false">
                        </iframe>
                    </div>
                    <div className="flex-basis-3">
                        <iframe className="iframe" src="//cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fplayer.vimeo.com%2Fvideo%2F453549133%3Fapp_id%3D122963&amp;dntp=1&amp;display_name=Vimeo&amp;url=https%3A%2F%2Fvimeo.com%2F453549133%3Flazy%3D1&amp;image=https%3A%2F%2Fi.vimeocdn.com%2Fvideo%2F951136340_1280.jpg&amp;key=96f1f04c5f4143bcb0f2e68c87d65feb&amp;type=text%2Fhtml&amp;schema=vimeo" scrolling="no" title="Vimeo embed" frameborder="0" allow="autoplay; fullscreen" allowfullscreen="false">
                        </iframe>
                    </div>
                    <div className="flex-basis-3">
                        <iframe className="iframe" src="//cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fplayer.vimeo.com%2Fvideo%2F453549133%3Fapp_id%3D122963&amp;dntp=1&amp;display_name=Vimeo&amp;url=https%3A%2F%2Fvimeo.com%2F453549133%3Flazy%3D1&amp;image=https%3A%2F%2Fi.vimeocdn.com%2Fvideo%2F951136340_1280.jpg&amp;key=96f1f04c5f4143bcb0f2e68c87d65feb&amp;type=text%2Fhtml&amp;schema=vimeo" scrolling="no" title="Vimeo embed" frameborder="0" allow="autoplay; fullscreen" allowfullscreen="false">
                        </iframe>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default Lessons
