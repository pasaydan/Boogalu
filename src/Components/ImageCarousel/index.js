import React from 'react';
import UseWindowDimensions from '../WindowDimensionHook';
import "../../../node_modules/react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';

const ImageCarousel = () => {
    const { viewportWidth } = UseWindowDimensions();

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
                            <img src="https://i.imgur.com/Mf66SeA.jpeg" alt="banner-1" />
                        :
                            <img src="https://i.imgur.com/7dzYFKS.jpg" alt="banner-1-dekstop" />
                    }
                    {/* <p className="legend">Solo Dance Competition</p> */}
                </div>
                <div className="imageContentWrap">
                    {
                        viewportWidth <= 640  ? 
                            <img src="https://i.imgur.com/nFQgzwS.jpeg" alt="banner-2" />
                        :
                         <img src="https://i.imgur.com/zOHB88w.jpeg" alt="banner-2-dekstop" />
                    }
                    {/* <p className="legend">Dance Contest</p> */}
                </div>
            </Carousel>
        </div>
    );
}

export default ImageCarousel;