import React, { useState } from 'react';
import ReactPlayer from 'react-player';

const VideoPlayer = ({ vdoObj }) => {
    const vdoUrl = vdoObj.url;
    const [videoPlayClass, toggleVideoPlayClass] = useState('');

    function videoPlayed() {
        toggleVideoPlayClass('played');
    }
    
    function videoPaused() {
        toggleVideoPlayClass('');
    }

    return (
        <div className="vdo-outer">
            <div className={`vdo-wrap ${videoPlayClass}`}>
                <ReactPlayer
                    className="react-player" 
                    url={vdoUrl}
                    controls={true}
                    width='100%'
                    config={{ file: { attributes: { controlsList: 'nodownload' } } }}
                    onContextMenu={e => e.preventDefault()}
                    onPlay={() => videoPlayed()}
                    onPause={() => videoPaused()}
                    style={{
                        'position': 'relative',
                        'min-width': '100%',
                        'min-height': '100%',
                        'background': 'var(--ternary-dark-grey)',
                        'border-radius': '5px',
                        'margin': '0 auto'
                    }}
                />
            </div>
        </div>
    )
}

export default VideoPlayer;
