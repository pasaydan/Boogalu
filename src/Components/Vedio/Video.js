import React, { useEffect } from 'react'

const Video = ({ vdoObj }) => {
    const vdoUrl = vdoObj.url + '?wmode=opaque&amp;autoplay=0&amp;theme=dark&amp;controls=0&amp;autohide=0&amp;loop=0&amp;showinfo=0&amp;rel=0&amp;playlist=false&amp;enablejsapi=0';
    useEffect(() => {
    }, [])

    return (
        <div className="vdo-outer">
            <div className="vdo-wrap">
                <iframe className="iframe" src={vdoUrl} scrolling="no" title="Vimeo embed" frameBorder="0" autoPlay={false} allowFullScreen={true}>
                </iframe>
            </div>
        </div>
    )
}

export default Video
