import React, { useState, useEffect } from 'react';
import UseWindowDimensions from '../WindowDimensionHook';
import "../../../node_modules/react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';

const ImageCarousel = () => {
    const { viewportWidth, viewportHeight } = UseWindowDimensions();

    return (
        <div className="carouselWrap">
            <Carousel
                autoPlay={true}
                interval={3500}
                infiniteLoop={true}
                showThumbs={false}
            >
                <div className="imageContentWrap">
                    {
                        viewportWidth <= 640  ? 
                            <img src="https://i.imgur.com/Mf66SeA.jpeg" alt="image-1" />
                        :
                            <img src="https://i.imgur.com/7dzYFKS.jpg" alt="image-1" />
                    }
                    {/* <p className="legend">Solo Dance Competition</p> */}
                </div>
                <div className="imageContentWrap">
                    {
                        viewportWidth <= 640  ? 
                            <img src="https://i.imgur.com/nFQgzwS.jpeg" alt="image-2" />
                        :
                         <img src="https://i.imgur.com/zOHB88w.jpeg" alt="image-2" />
                    }
                    {/* <p className="legend">Dance Contest</p> */}
                </div>
            </Carousel>
        </div>
    );
}

export default ImageCarousel;