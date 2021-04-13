import React from 'react';
import ReactPlayer from 'react-player';

const Video = ({ vdoObj }) => {
    const vdoUrl = vdoObj.url;
    return (
        <div className="vdo-outer">
            <div className="vdo-wrap">
                <ReactPlayer
                    className='react-player' 
                    url={vdoUrl}
                    controls={true}
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

export default Video
