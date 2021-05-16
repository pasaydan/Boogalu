import React, { useState, useRef, useEffect } from 'react';
import LessonsCategories from '../../Data/LessonsCategory';
import Video from "../Vedio/Video";
import FilterListIcon from '@material-ui/icons/FilterList';
import ArrowDropDownOutlinedIcon from '@material-ui/icons/ArrowDropDownOutlined';
import Button from '@material-ui/core/Button';
import SortByAlphaIcon from '@material-ui/icons/SortByAlpha';
function Lessons() {
    const [activeCategory, setActiveCategory] = useState(LessonsCategories[0]);
    // eslint-disable-next-line no-unused-vars
    const [LessonsCategoriesList, setLessonsCategoriesList] = useState(LessonsCategories)
    const [showCatDropDown, setShowCatDropDown] = useState(false);
    const [showFilterDropDown, setShowFilterDropDown] = useState(false);
    const [showSortingDropDown, setShowSortingDropDown] = useState(false);
    const catRef = useRef();
    const filterRef = useRef();
    const sortingRef = useRef();
    useOnClickOutside(catRef, () => setShowCatDropDown(false));
    useOnClickOutside(filterRef, () => setShowFilterDropDown(false));
    useOnClickOutside(sortingRef, () => setShowSortingDropDown(false));

    function useOnClickOutside(ref, handler) {
        useEffect(
            () => {
                const listener = event => {
                    if (!ref.current || ref.current.contains(event.target)) {
                        return;
                    }
                    handler(event);
                };
                document.addEventListener('mousedown', listener);
                document.addEventListener('touchstart', listener);
                return () => {
                    document.removeEventListener('mousedown', listener);
                    document.removeEventListener('touchstart', listener);
                };
            },
            [ref, handler]
        );
    }
    return (
        <div className="lessons lessons-wrap" id="lessons">
            <div className="lessons-heading-wrap">
                <div className="lessons-title-wrap clearfix">
                    <div className="title">Lessons</div>
                    <div className="category-dropdown-wrap" ref={catRef}>
                        <div className="category-dropdown" onClick={() => setShowCatDropDown(true)}>
                            <div>{activeCategory.title}</div>
                            <ArrowDropDownOutlinedIcon />
                        </div>
                        {showCatDropDown && <div className="dropdown-list-wrap">
                            {LessonsCategoriesList.forEach((item, i) => {
                                if (item.title !== activeCategory.title) {
                                    return <div className="category-item" key={i} onClick={() => { setActiveCategory(item); setShowCatDropDown(false) }}>{item.title}</div>
                                }
                            })}
                        </div>}
                    </div>
                    <div className="filter-wrap clearfix">
                        <div className="filters filters-dropdown-outer" ref={filterRef}>
                            <div className="filters-content">
                                <FilterListIcon onClick={() => setShowFilterDropDown(true)} />
                            </div>
                            {showFilterDropDown && <div className="filters-dropdown-wrap">
                                <div className="heading">Level</div>
                                <div className="level-list clearfix">
                                    <div className="filter-item">Beginner</div>
                                    <div className="filter-item">Intermediate</div>
                                    <div className="filter-item">Advanced</div>
                                </div>
                                <div className="heading">Class Length</div>
                                <div className="level-list length-list clearfix">
                                    <div className="filter-item">20 min or less</div>
                                    <div className="filter-item">20 to 50 min</div>
                                    <div className="filter-item">50 to 1.5 hr</div>
                                    <div className="filter-item">1.5 hr to more</div>
                                </div>
                                <div className="heading">Instructor</div>
                                <div className="level-list instructor-list clearfix">
                                    <div className="filter-item">A HURRIKANE LAUTURE</div>
                                    <div className="filter-item">A HURRIKANE LAUTURE</div>
                                    <div className="filter-item">A HURRIKANE LAUTURE</div>
                                    <div className="filter-item">A HURRIKANE LAUTURE</div>
                                    <div className="filter-item">A HURRIKANE LAUTURE</div>
                                    <div className="filter-item">A HURRIKANE LAUTURE</div>
                                </div>
                                <div className="filters-buttons">
                                    <Button variant="contained" color="primary" onClick={() => setShowFilterDropDown(false)}>Reset</Button>
                                    <Button variant="contained" color="primary" onClick={() => setShowFilterDropDown(false)}>Save</Button>
                                </div>
                            </div>}
                        </div>
                        <div className="sortings sortings-dropdown-outer">
                            <div className="sortings-content" ref={sortingRef}>
                                <SortByAlphaIcon onClick={() => setShowSortingDropDown(true)} />
                            </div>
                            {showSortingDropDown && <div className="sortings-dropdown-wrap">
                                <div className="sortings-dropdown">
                                    <div className="heading">Sort By</div>
                                    <div className="sorting-filter-list">
                                        <div className="filter-item" onClick={() => setShowSortingDropDown(false)}>Shortest</div>
                                        <div className="filter-item" onClick={() => setShowSortingDropDown(false)}>Longest</div>
                                        <div className="filter-item" onClick={() => setShowSortingDropDown(false)}>Newest</div>
                                        <div className="filter-item" onClick={() => setShowSortingDropDown(false)}>Oldest</div>
                                        <div className="filter-item" onClick={() => setShowSortingDropDown(false)}>A to Z</div>
                                        <div className="filter-item" onClick={() => setShowSortingDropDown(false)}>Z to A</div>
                                    </div>
                                </div>
                            </div>}
                        </div>
                    </div>
                </div>
                <div className="category-description">
                    {activeCategory.desc}
                </div>
            </div>
            <div className="lessons-vdo-wrap">
                {activeCategory.vedios.map((item) => {
                    return <Video vdoObj={item}></Video>
                })}
            </div>
        </div>
    )
}

export default Lessons
