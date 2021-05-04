import React, { useState, useEffect } from 'react';
import "../../../node_modules/react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';

function ImageCarousel() {
    return (
        <div className="carouselWrap">
            <Carousel
                autoPlay={true}
                interval={3500}
                infiniteLoop={true}
                showThumbs={false}
            >
                <div className="imageContentWrap">
                    <img src="https://i.imgur.com/7dzYFKS.jpg" alt="image-1" />
                    <p className="legend">Solo Dance Competition</p>
                </div>
                <div className="imageContentWrap">
                    <img src="https://i.imgur.com/zOHB88w.jpeg" alt="image-2" />
                    <p className="legend">Dance Contest</p>
                </div>
                <div className="imageContentWrap">
                    <img src="https://i.imgur.com/GsuIFUY.jpg" alt="image-3" />
                    <p className="legend">Battle of gods</p>
                </div>
            </Carousel>
        </div>
    );
}

export default ImageCarousel;