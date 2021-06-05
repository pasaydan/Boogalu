import React from 'react';
import UseWindowDimensions from '../WindowDimensionHook';
import "../../../node_modules/react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';

const ImageCarousel = (props) => {
    const { carouselData } = props;
    const { viewportWidth } = UseWindowDimensions();

    function eventDataTrigger(event, data) {
        event.stopPropagation();
        props.imgClickCallback(data);
    }

    return (
        <div className="carouselWrap">
            {
                carouselData && carouselData.length ?
                <Carousel
                    autoPlay={false}
                    interval={3500}
                    infiniteLoop={true}
                    showThumbs={false}
                >
                    {
                        carouselData.map( item => {
                            return (
                                <div 
                                    className="imageContentWrap" key={item.id}
                                    aria-label={`${item.name} aria label`}
                                    onClick={(e) => eventDataTrigger(e, item)}
                                >
                                    {
                                        viewportWidth <= 640  ? 
                                            <img src={item?.imgUrlMobile} alt={`${item.id}-mobile`} />
                                        :
                                            <img src={item?.imgUrl} alt={`${item.id}-desktop`} />
                                    }
                                    {
                                        item?.fees ?
                                        <button className="evetnRegisterBtn btn primary-light">Register now</button> : ''
                                    }
                                    {/* <p className="legend">Solo Dance Competition</p> */}
                                </div>
                            )
                        })
                    }
                </Carousel> : ''
            }
        </div>
    );
}

export default ImageCarousel;