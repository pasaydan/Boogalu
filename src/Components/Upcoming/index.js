import React, { useState, useRef, useEffect } from "react";
import LessonsVideoContainer from "../LessonVideoComponent";
import Lessons from "../../Data/Dummy";
import { useStoreConsumer } from "../../Providers/StateProvider";
// eslint-disable-next-line no-unused-vars
import {
  getAllLessons,
  getLessonByPlanType,
  getLessonsWithOnlyPreview,
  getLessonByPlanTypeOnlyPreview,
} from "../../Services/Lessons.service";
import { FaFilter } from "react-icons/fa";
import { getParameterByName, isObjectEmpty } from "../../helpers";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import * as $ from "jquery";
import Loader from "../Loader";
import { logAnalyticsEvent } from "../../Services/analytics.service";

const FILTER_BY = require("../../Data/lessonFilters.json");

function Upcoming() {
  const { state } = useStoreConsumer();
  const loggedInUser = state.loggedInUser;
  // eslint-disable-next-line no-unused-vars
  const [activeCategory, setActiveCategory] = useState(Lessons[0]);
  const [lessonsData, setLessonsList] = useState(null);
  const [filterEmptyMessage, setFilterEmptyMessage] = useState("");
  const [lessonsSubHeading, setLessonSubHeading] = useState("");
  const [isDataPresentAndFilterApplied, toggleFilterOptionVisiblity] =
    useState(false);
  const [isOtherFiltersActive, toggleOtherFilterOverlay] = useState(false);
  const [levelFilterValue, setLevelFilter] = useState("");
  const [styleFilterValue, setStyleFilter] = useState("");
  const [planTypeFilterValue, setPlanTypeFilter] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [isFilterEnabled, shouldEnableFilters] = useState(false);
  const [isLoaderActive, toggleLoading] = useState(false);
  const allFilterBtnRef = useRef();
  const proFilterBtnRef = useRef();
  const freeFilterBtnRef = useRef();
  const paidFilterBtnRef = useRef();
  const otherFiltersBtnRef = useRef();
  const premiumFilterBtnRef = useRef();

  useEffect(() => {
    logAnalyticsEvent('page_view', {
      page_location: window.location.href,
      page_path: '/events',
      page_title: 'HomePage' + '-' + window.location.href
    });
  }, [])

  useEffect(() => {
    $("html,body").animate(
      {
        scrollTop: 0,
      },
      700
    );
    let planFilterParam = getParameterByName("pricing", window.location.href);
    let levelFilterParam = getParameterByName("el", window.location.href);
    let styleFilterParam = getParameterByName("ds", window.location.href);
    if (
      (planFilterParam && planFilterParam?.length) ||
      (levelFilterParam && levelFilterParam?.length) ||
      (styleFilterParam && styleFilterParam?.length)
    ) {
      planFilterParam = planFilterParam?.toLocaleLowerCase();
      levelFilterParam = levelFilterParam?.toLocaleLowerCase();
      styleFilterParam = styleFilterParam?.toLocaleLowerCase();
      setPlanTypeFilter(planFilterParam);
      setLevelFilter(levelFilterParam);
      setStyleFilter(styleFilterParam);
      filterLesson(null, planFilterParam);
    } else {
      if (allFilterBtnRef.current) {
        allFilterBtnRef.current.classList.add("active");
      }
      getAllLessonsData();
    }
    document.addEventListener("keyup", escFunction, false);
    return () => document.removeEventListener("keyup", escFunction, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function escFunction(event) {
    if (event && event.keyCode === 27) {
      resetAppliedFilters(event, false);
    }
  }
  function getAllLessonsData(from) {
    try {
      toggleLoading(true);
      if (!isObjectEmpty(loggedInUser)) {
        getAllLessons().subscribe((lessons) => {
          toggleLoading(false);
          setLessonsListData(lessons, from);
        });
      } else {
        getLessonsWithOnlyPreview().subscribe((lessons) => {
          toggleLoading(false);
          setLessonsListData(lessons, from);
        });
      }
    } catch (e) {
      toggleLoading(false);
      console.log("Error: ", e);
    }
  }

  function setLessonsListData(lessons, from) {
    toggleFilterOptionVisiblity(true);
    const filterBtns = document
      .querySelectorAll(".js-filterWrap")[0]
      .querySelectorAll("button");
    if (filterBtns.length) {
      filterBtns.forEach((item) => {
        if (item.classList.contains("active")) {
          item.classList.remove("active");
        }
      });
    }
    if (allFilterBtnRef.current) {
      allFilterBtnRef.current.classList.add("active");
    }

    if (from && from === "filters") {
      window.history.replaceState(null, null, `?pricing=all`);
    }

    if (lessons.length) {
      toggleFilterOptionVisiblity(true);
      setLessonsList(lessons);
      setLessonSubHeading("Learn from the experts and many dance forms!");
    } else {
      toggleFilterOptionVisiblity(false);
      setLessonSubHeading("Lessons video launching soon, stay connected!");
    }
  }

  useEffect(() => {
    if (planTypeFilterValue) {
      filterLesson(null, planTypeFilterValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planTypeFilterValue]);

  function filterLesson(event, filter) {
    if (event) {
      event.stopPropagation();
      setPlanTypeFilter(filter);
    }
    toggleOtherFilterOverlay(false);
    if (filter === "all") {
      getAllLessonsData("filters");
      setPlanTypeFilter(filter);
      setLevelFilter("");
      setStyleFilter("");
    } else {
      try {
        toggleLoading(true);
        if (!isObjectEmpty(loggedInUser)) {
          getLessonByPlanType(
            planTypeFilterValue === "startup" ? "paid" : planTypeFilterValue,
            levelFilterValue,
            styleFilterValue
          ).subscribe((lessons) => {
            toggleLoading(false);
            setLessonsDataByFilter(lessons, event, planTypeFilterValue);
          });
        } else {
          getLessonByPlanTypeOnlyPreview(
            planTypeFilterValue === "startup" ? "paid" : planTypeFilterValue,
            levelFilterValue,
            styleFilterValue
          ).subscribe((lessons) => {
            toggleLoading(false);
            setLessonsDataByFilter(lessons, event, planTypeFilterValue);
          });
        }
      } catch (e) {
        toggleLoading(false);
        console.log("Error: ", e);
      }
    }
  }

  function setLessonsDataByFilter(lessons, event, filter) {
    toggleFilterOptionVisiblity(true);
    const filterBtns = document
      .querySelectorAll(".js-filterWrap")[0]
      .querySelectorAll("button");
    if (filterBtns.length) {
      filterBtns.forEach((item) => {
        if (!(event && event.target.classList.contains("js-otherFilterIcon"))) {
          if (item.classList.contains("active")) {
            item.classList.remove("active");
          }
        }
      });
    }
    if (planTypeFilterValue && levelFilterValue && styleFilterValue) {
      window.history.replaceState(
        null,
        null,
        `?pricing=${planTypeFilterValue}&el=${levelFilterValue}&ds=${styleFilterValue}`
      );
    } else if (planTypeFilterValue && levelFilterValue) {
      window.history.replaceState(
        null,
        null,
        `?pricing=${planTypeFilterValue}&el=${levelFilterValue}`
      );
    } else if (planTypeFilterValue && styleFilterValue) {
      window.history.replaceState(
        null,
        null,
        `?pricing=${planTypeFilterValue}&ds=${styleFilterValue}`
      );
    } else if (levelFilterValue && styleFilterValue) {
      window.history.replaceState(
        null,
        null,
        `?el=${levelFilterValue}&ds=${styleFilterValue}`
      );
    } else if (levelFilterValue) {
      window.history.replaceState(null, null, `?el=${levelFilterValue}`);
    } else if (styleFilterValue) {
      window.history.replaceState(null, null, `?ds=${styleFilterValue}`);
    } else {
      window.history.replaceState(
        null,
        null,
        `?pricing=${planTypeFilterValue}`
      );
    }
    if (event) {
      event.target.classList.add("active");
    } else {
      switch (filter) {
        case "all":
          if (allFilterBtnRef.current) {
            allFilterBtnRef.current.classList.add("active");
          }
          break;

        case "startup":
          if (paidFilterBtnRef.current) {
            paidFilterBtnRef.current.classList.add("active");
          }
          break;

        case "premium":
          if (premiumFilterBtnRef.current) {
            premiumFilterBtnRef.current.classList.add("active");
          }
          break;

        case "free":
          if (freeFilterBtnRef.current) {
            freeFilterBtnRef.current.classList.add("active");
          }
          break;

        case "pro":
          if (proFilterBtnRef.current) {
            proFilterBtnRef.current.classList.add("active");
          }
          break;

        default:
          break;
      }
    }
    if (lessons.length) {
      setLessonsList(lessons);
    } else {
      setLessonsList([]);
      setFilterEmptyMessage(
        "Sorry, no lessons for the filters you have selected. Please try with another filters!"
      );
    }
  }

  function toggleOtherFilters(event, action) {
    event.stopPropagation();
    if (!action) {
      setLevelFilter("");
      setStyleFilter("");
    }
    toggleOtherFilterOverlay(action);
  }

  function resetAppliedFilters(event, action) {
    event.stopPropagation();
    if (!action) {
      setLevelFilter("");
      setStyleFilter("");
    }
    filterLesson(null, "all");
    toggleOtherFilterOverlay(action);
  }

  function handleOtherFilters(event, filterName) {
    event.stopPropagation();
    if (filterName === "expertiseLevel") {
      setLevelFilter(event.target.value);
    } else {
      setStyleFilter(event.target.value);
    }
  }

  return (
    <div
      className={`lessons lessons-wrap ${!isDataPresentAndFilterApplied ? "flexBox" : ""
        }`}
      id="upcomingLessons"
    >
      <Loader value={isLoaderActive} />
      <div className="inner-page">
        <h1>Learn from the Experts</h1>
        {/* <p>
                    Lessons for all users from our expert faculty members.
                    From Hip-Hop to Bharatnatyam. You'll get all learning videos
                    at one place.
                </p>  */}
        {lessonsData && lessonsData.length ? (
          <p className="launching-soon">Our recent lessons!</p>
        ) : (
          <p className="launching-soon">{lessonsSubHeading}</p>
        )}
      </div>

      <div className="lesson-wrap">
        {isDataPresentAndFilterApplied ? (
          <div className="filterWrap js-filterWrap">
            <button
              ref={allFilterBtnRef}
              title="apply all filter"
              className="btn primary-dark active"
              onClick={(e) => filterLesson(e, "all")}
            >
              All
            </button>
            <button
              ref={freeFilterBtnRef}
              title="apply free filter"
              className="btn primary-dark"
              onClick={(e) => filterLesson(e, "free")}
            >
              Free
            </button>
            <button
              ref={paidFilterBtnRef}
              title="apply startup filter"
              className="btn primary-dark"
              onClick={(e) => filterLesson(e, "startup")}
            >
              Startup
            </button>
            {isFilterEnabled ? (
              <button
                ref={proFilterBtnRef}
                title="apply pro filter"
                className="btn primary-dark"
                onClick={(e) => filterLesson(e, "pro")}
              >
                Pro
              </button>
            ) : (
              ""
            )}
            {isFilterEnabled ? (
              <button
                ref={premiumFilterBtnRef}
                title="apply premium filter"
                className="btn primary-dark"
                onClick={(e) => filterLesson(e, "premium")}
              >
                Premium
              </button>
            ) : (
              ""
            )}
            <button
              ref={otherFiltersBtnRef}
              title="apply other filters"
              className="btn primary-dark otherFilterIcon js-otherFilterIcon"
              onClick={(e) => toggleOtherFilters(e, true)}
            >
              <span>
                <FaFilter />
              </span>
            </button>
          </div>
        ) : (
          ""
        )}
        {isOtherFiltersActive ? (
          <div className="otherFiltersWrap">
            <div className="innerBox">
              <p
                className="close-modal-icon dark"
                onClick={(e) => toggleOtherFilters(e, false)}
                title="close filter"
              ></p>
              <h3>Filter by</h3>
              <div className="filterInnerWrap">
                {FILTER_BY && FILTER_BY?.filterBy.length
                  ? FILTER_BY?.filterBy.map((filterItem) => {
                    return (
                      <div className="filterItem" key={filterItem?.id}>
                        <p className="filterTitle">{filterItem?.name}</p>
                        <div className="optionsWrap">
                          <RadioGroup
                            className="radioGroupControls"
                            aria-label={`aria label for ${filterItem?.name}`}
                            name={filterItem?.id}
                            value={
                              filterItem?.id === "expertiseLevel"
                                ? levelFilterValue
                                : styleFilterValue
                            }
                            defaultValue={filterItem?.values[0]?.id}
                            onChange={(e) =>
                              handleOtherFilters(e, filterItem?.id)
                            }
                          >
                            {filterItem?.values && filterItem?.values.length
                              ? filterItem.values.map((option) => {
                                return (
                                  <FormControlLabel
                                    key={option?.id}
                                    value={option?.id}
                                    control={<Radio />}
                                    label={option?.label}
                                  />
                                );
                              })
                              : ""}
                          </RadioGroup>
                        </div>
                      </div>
                    );
                  })
                  : ""}
              </div>
              <div className="filterActionWrap">
                <button
                  className="btn primary-light"
                  onClick={(e) => resetAppliedFilters(e, false)}
                >
                  Reset &amp; cancel
                </button>
                <button
                  className="btn primary-dark"
                  onClick={(e) => filterLesson(e, null)}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        ) : (
          ""
        )}
        <div className="lessons-vdo-wrap">
          {lessonsData && lessonsData.length ? (
            lessonsData.map((videoData, index) => {
              return (
                <LessonsVideoContainer
                  lessonId={videoData.id}
                  lessonKey={videoData.key}
                  title={videoData.name}
                  artist={videoData.teacher}
                  desc={videoData.desc}
                  lessonPlayTime={videoData?.lessonPlayedTimes}
                  videoUserLevel={videoData?.expertiseLevel}
                  artForm={videoData?.artForm}
                  isPaid={videoData.accessbility}
                  uploadedOn={videoData.uploadedTime}
                  thumbNail={videoData.thumbnailImage}
                  activeVideosList={videoData.videoList}
                  videoId={`lessonVideo-${index + 1}`}
                  key={"lesson-" + index}
                />
              );
            })
          ) : filterEmptyMessage && filterEmptyMessage.length ? (
            <p className="emptyLessonsFilterMessage">{filterEmptyMessage}</p>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
}

export default Upcoming;
