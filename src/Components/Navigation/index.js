import React, { useState, useEffect, useRef } from "react";
import {
  FaHome,
  FaBookReader,
  FaCloudUploadAlt,
  FaTrophy,
  FaUserAlt,
  FaRupeeSign,
} from "react-icons/fa";
import boogaluLogo from "../../Images/Boogaluu-logo.png";
import { useHistory } from "react-router-dom";
import { useStoreConsumer } from "../../Providers/StateProvider";
import { logoutUser } from "../../Actions/User";
import { enableLoginFlow } from "../../Actions/LoginFlow";
import { disableLoginFlow } from "../../Actions/LoginFlow";
import VideoUploader from "../VideoUploader";
import {
  MdNotifications,
  MdNotificationsActive,
  MdAccountCircle,
} from "react-icons/md";
import { NOTIFICATION_SUCCCESS, VIDEO_LIMIT_COUNT } from "../../Constants";
import { displayNotification } from "../../Actions/Notification";
import * as $ from "jquery";
import {
  getNotifications,
  updateNotification,
} from "../../Services/Notifications.service";
import { getUploadedVideosByUserId } from '../../Services/UploadedVideo.service';
import { getUploadedVideosByUser } from "../../Actions/User";
import {
  acceptFollowRequest,
  rejectFollowRequest,
  blockUser,
  unFollowUser,
} from "../../Services/Friendship.service";
import Loader from '../Loader';
import GenericInfoModal from '../genericInfoModal';

const SCROLL_TOP_LIMIT = 200;
const defaultDocTitle = document.title;

function Navigation({ routeChangeTrigger, isUserLoggedIn }) {
  const [goingUpClass, setGoingUpClass] = useState("");
  const [hideVdoUploadBtn, setHideVdoUploadBtn] = useState(false);
  const [didMount, setDidMount] = useState(false);
  const [isMobile, toggleMobile] = useState(false);
  const [goingDownClass, setGoingDownClass] = useState("");
  const [profileTabMenu, enableProfileTabMenu] = useState(false);
  const [showProfileTab, setShowProfileTab] = useState(false);
  const [userIconProfileMenu, setUserIconProfileMenu] = useState(false);
  const [showUserIconProfileMenu, setShowUserIconProfileMenu] = useState(false);
  const [isHomeRoute, togglHomeRouteValue] = useState(true);
  const [isNotificationsPresent, setNotificationValue] = useState(false);
  const [userNotificationMenu, setUserNotificationMenu] = useState(false);
  const [showUserNotificationMenu, setShowUserIconNotificationMenu] =
    useState(false);
  const [userNotificationList, setUserNotificationList] = useState([]);
  const [openInformationModal, toggleInfoModal] = useState(false);
  const [infoModalTitle, setInfoModalTitle] = useState('');
  const [infoModalMessage, setInfoModalMessage] = useState('');
  const [infoModalStatus, setInfoModalStatus] = useState('');
  const [navigateLink, setInfoModalNavigateLink] = useState('');

  const ref = useRef();
  const hamburgerMenuRef = useRef(null);
  const mainNavRef = useRef(null);
  const mobilHomelinkRef = useRef();

  const history = useHistory();
  const { state, dispatch } = useStoreConsumer();
  const loggedInUser = state.loggedInUser;
  const [openVdoUploadModal, setOpenVdoUploadModal] = useState(false);
  const [isPageLoaderActive, togglePageLoader] = useState(false);
  const [activeRoute, setActiveRoute] = useState("");
  const [isNavHidden, toggleNavHidden] = useState(false);
  const [animateNavClass, toggleNavAnimation] = useState("animate");

  const isAppAlreadyLoaded = JSON.parse(localStorage.getItem("isAppLoaded"));

  useEffect(() => {
    setDidMount(true);
    setHideVdoUploadBtn(false);
    let windowViewPortWidth = window.innerWidth;
    if (windowViewPortWidth > 1023) {
      toggleMobile(false);
    } else {
      toggleMobile(true);
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < SCROLL_TOP_LIMIT) {
        setTimeout(() => {
          setGoingUpClass("");
          setGoingDownClass("");
        }, 200);
      } else {
        setGoingUpClass("scrolled-up");
        setTimeout(() => {
          setGoingDownClass("scrolled-down");
        }, 200);
      }
    };

    const windowResize = () => {
      windowViewPortWidth = window.innerWidth;
      if (windowViewPortWidth > 1023) {
        toggleMobile(false);
      } else {
        toggleMobile(true);
      }
    };

    const pathName = history?.location?.pathname.split("/")[1];
    const navLinks = document.querySelectorAll(".nav-ul a");
    if (pathName === "") {
      togglHomeRouteValue(true);
      toggleNavAnimation("");
      if (isAppAlreadyLoaded) {
        setTimeout(() => {
          toggleNavAnimation("animate");
        }, 600);
      } else {
        setTimeout(() => {
          toggleNavAnimation("animate");
        }, 800);
      }
    } else {
      togglHomeRouteValue(false);
      routeChangeTrigger(false);
    }

    if (
      pathName.includes("login") ||
      pathName.includes("register") ||
      pathName.includes("admin")
    ) {
      setHideVdoUploadBtn(true);
      toggleNavHidden(true);
    } else {
      toggleNavHidden(false);
    }
    setTimeout(() => {
      if (navLinks && navLinks.length) {
        navLinks.forEach((ele) => {
          const getHref = ele.getAttribute("href").toLocaleLowerCase();
          if (pathName?.length && getHref.includes(pathName)) {
            ele.classList.add("active");
          }
          if (pathName === "") {
            if (loggedInUser.username) {
              if (ele.getAttribute("href") === "#Dashboard") {
                ele.classList.add("active");
              }
            }
          }
        });
      }
      topRightNavigation();
    }, 1000);

    window.addEventListener("resize", windowResize, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => setDidMount(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  useEffect(() => {
    const listenRouteChange = history.listen((location, action) => {
      const pathName = location?.pathname.split("/")[1];
      if (
        pathName.includes("admin") ||
        pathName.includes("register") ||
        pathName.includes("login")
      ) {
        setHideVdoUploadBtn(true);
        toggleNavHidden(true);
        routeChangeTrigger(false);
      } else {
        setHideVdoUploadBtn(false);
        toggleNavHidden(false);
        if (pathName !== "") {
          routeChangeTrigger(false);
          togglHomeRouteValue(false);
        }
      }
      if (
        (!pathName ||
          pathName.includes("lessons") ||
          pathName.includes("contactus") ||
          pathName.includes("home")) &&
        state.currentLoginFlow
      ) {
        dispatch(disableLoginFlow());
      }
      if (
        (state.currentLoginFlow === "upload-video" &&
          pathName.includes("events")) ||
        pathName.includes("lessons")
      )
        dispatch(disableLoginFlow());
      //set active route name
    });
    console.log("Route change handler: ", listenRouteChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (userNotificationList && userNotificationList.length > 0) {
      setNotificationValue(true);
    } else {
      setNotificationValue(false);
    }
  }, [userNotificationList]);

  function shouldCloseInfoModal() {
    setInfoModalTitle('');
    setInfoModalMessage('');
    setInfoModalStatus('');
    setInfoModalNavigateLink('');
    toggleInfoModal(false);
    const pathName = history?.location?.pathname.split('/')[1];
    if (!pathName.includes('profile')) {
      setInfoModalNavigateLink('/profile');
    }
  }

  const fetchNotifications = () => {
    let followNotificationArray = [];
    if (loggedInUser.key) {
      setUserNotificationList([]);
      changeTitle();
      getNotifications(loggedInUser.key).subscribe((response) => {
        const notifications =
          response && response.data && response.data ? response.data : [];
        if (notifications && Object.keys(notifications).length > 0) {
          const notificationKeys = Object.keys(notifications);
          const flatValues = Object.values(notifications).flat();
          notificationKeys.forEach((key, index) => {
            const valuesByKey = notifications[key];
            if (valuesByKey && valuesByKey.length > 0) {
              valuesByKey.forEach((value) => {
                followNotificationArray.push(value);
                if (
                  followNotificationArray &&
                  followNotificationArray.length === flatValues.length
                ) {
                  setUserNotificationList(followNotificationArray);
                  changeTitle(followNotificationArray.length);
                }
              });
            }
          });
        }
      });
    }
  };

  function changeTitle(notifications) {
    document.title = notifications ? `(${notifications}) ${defaultDocTitle}` : defaultDocTitle;
  }

  const logout = () => {
    dispatch(
      displayNotification({
        msg: "Logout Successfully",
        type: NOTIFICATION_SUCCCESS,
        time: 3000,
      })
    );
    console.log("logout success");
    dispatch(logoutUser());
    setShowProfileTab(false);
    enableProfileTabMenu(false);
    setShowUserIconProfileMenu(false);
    setUserIconProfileMenu(false);
    setUserNotificationMenu(false);
    if (hamburgerMenuRef.current) {
      hamburgerMenuRef.current.classList.remove("active");
    }
    if (mainNavRef.current) {
      mainNavRef.current.classList.remove("sideMenuVisible");
    }
    history.push(`/login`);
  };

  const onClickNav = (e, route) => {
    e.preventDefault();
    const navLinks = document.querySelectorAll(".nav-ul a");

    setTimeout(() => {
      const pathName = history?.location?.pathname.split("/")[1];
      if (pathName.includes("register") || pathName.includes("admin")) {
        setHideVdoUploadBtn(true);
      } else {
        setHideVdoUploadBtn(false);
      }

      if (pathName !== "") {
        routeChangeTrigger(false);
        togglHomeRouteValue(false);
      }
    }, 0);

    if (navLinks && navLinks.length) {
      navLinks.forEach((ele) => {
        if (ele.classList.contains("active")) {
          ele.classList.remove("active");
        }
      });
      if (loggedInUser.username && route === "") {
        navLinks.forEach((ele) => {
          if (ele.getAttribute("href") === "#Dashboard") {
            ele.classList.add("active");
            setActiveRoute("");
          }
        });
      }
    }
    if (route) {
      history.push(`/${route}`);
      e.target.classList.add("active");
      setActiveRoute(route);
      setTimeout(() => {
        let target = $(`.${route}`);
        if (target && target.offset()) {
          $("html,body").animate(
            {
              scrollTop: target.offset().top - 200,
            },
            700
          );
        }
      }, 100);
    } else {
      history.push(`/`);
      setActiveRoute("");
      if (loggedInUser.username) {
        navLinks.forEach((ele) => {
          if (ele.getAttribute("href") === "#Dashboard") {
            ele.classList.add("active");
          }
        });
      }
      setTimeout(() => {
        let target = $(`.homepage`);
        if (target.length) {
          $("html,body").animate(
            {
              scrollTop: target.offset().top - 200,
            },
            700
          );
        }
      }, 100);
    }
  };
  // Hook
  // function useOnClickOutside(ref, handler) {
  //     useEffect(
  //         () => {
  //             const listener = event => {
  //                 if (!ref.current || ref.current.contains(event.target)) {
  //                     return;
  //                 }

  //                 handler(event);
  //             };
  //             document.addEventListener('mousedown', listener);
  //             document.addEventListener('touchstart', listener);
  //             return () => {
  //                 document.removeEventListener('mousedown', listener);
  //                 document.removeEventListener('touchstart', listener);
  //             };
  //         },
  //         [ref, handler]
  //     );
  // }

  function navigateToUserRegistrationLogin(path) {
    setHideVdoUploadBtn(true);
    toggleNavHidden(true);
    history.push(`/${path}`);
  }

  if (!didMount) {
    return null;
  }

  function getUsersVideoList(userKey) {
    return new Promise ((res, rej) => {
      if (userKey) {
        togglePageLoader(true);
        try {
          getUploadedVideosByUserId(userKey).subscribe(list => {
            togglePageLoader(false);
            res(list);
            dispatch(getUploadedVideosByUser(list));
          });
        } catch (e) {
          rej(e);
          togglePageLoader(false);
          console.log('Video fetch error: ', e);
        }
      }
    });
  }

  function uploadVdo(e) {
    e.stopPropagation();
    e.preventDefault();
    if (loggedInUser?.key) {
      /**
       * NOTE: this function need to call to fetch the users video list,
       * so that we can put a check of video upload count to user. Currently, limit is 4.
       */
      getUsersVideoList(loggedInUser.key).then(res => {
        if (res && res.length < VIDEO_LIMIT_COUNT.monthly) {
          setOpenVdoUploadModal(true);
        } else {
          const pathName = history?.location?.pathname.split('/')[1];
          if (!pathName.includes('profile')) {
            setInfoModalNavigateLink('/profile');
          }
          setInfoModalMessage(`You have reached your maximum video upload limit of ${state?.userVideosList?.length || VIDEO_LIMIT_COUNT.monthly}, please delete some videos to upload another one!`);
          setInfoModalStatus('error');
          toggleInfoModal(true);
        }
      });
    } else {
      dispatch(enableLoginFlow({ type: "upload-video" }));
      history.push({
        pathname: "/login",
        state: null,
      });
    }
  };

  function topRightNavigation(event, url) {
    const getLinkMenu = document.querySelectorAll(".linkMenu");
    if (event && url) {
      getLinkMenu.forEach((item) => {
        if (item.classList.contains("active")) {
          item.classList.remove("active");
        }
      });
      history.push(`/${url}`);
      setTimeout(() => {
        $("html,body").animate(
          {
            scrollTop: 0,
          },
          700
        );
      }, 100);
      event.currentTarget.classList.add("active");
      setActiveRoute(url);
      setShowProfileTab(false);
      enableProfileTabMenu(false);
      setShowUserIconProfileMenu(false);
      setUserIconProfileMenu(false);
      setUserNotificationMenu(false);
      if (hamburgerMenuRef.current) {
        hamburgerMenuRef.current.classList.remove("active");
      }
      if (mainNavRef.current) {
        mainNavRef.current.classList.remove("sideMenuVisible");
      }
    } else {
      showActiveSideNavMenuFromRoute();
    }
  }

  function showActiveSideNavMenuFromRoute() {
    const getLinkMenu = document.querySelectorAll(".linkMenu");
    const pathName = history?.location?.pathname.split("/")[1];
    if (getLinkMenu.length) {
      getLinkMenu.forEach((item) => {
        if (item.getAttribute("data-url") === pathName) {
          item.classList.add("active");
        }
      });
    }
  }

  function activateLeftMenuBar(event) {
    event.stopPropagation();
    event.preventDefault();
    setShowUserIconProfileMenu(false);
    setTimeout(() => {
      setUserIconProfileMenu(false);
    }, 200);

    setShowUserIconNotificationMenu(false);
    setTimeout(() => {
      setUserNotificationMenu(false);
    }, 200);

    if (hamburgerMenuRef.current) {
      if (hamburgerMenuRef.current.classList.contains("active")) {
        hamburgerMenuRef.current.classList.remove("active");
        if (mainNavRef.current) {
          mainNavRef.current.classList.remove("sideMenuVisible");
        }
        setTimeout(() => {
          enableProfileTabMenu(false);
        }, 100);
        setShowProfileTab(false);
      } else {
        hamburgerMenuRef.current.classList.add("active");
        if (mainNavRef.current) {
          mainNavRef.current.classList.add("sideMenuVisible");
        }
        enableProfileTabMenu(true);
        setTimeout(() => {
          setShowProfileTab(true);
          showActiveSideNavMenuFromRoute();
        }, 100);
      }
    }
  }

  function activateProfileIconMenu(event) {
    event.stopPropagation();
    if (hamburgerMenuRef.current) {
      if (hamburgerMenuRef.current.classList.contains("active")) {
        hamburgerMenuRef.current.classList.remove("active");
        if (mainNavRef.current) {
          mainNavRef.current.classList.remove("sideMenuVisible");
        }
        setTimeout(() => {
          enableProfileTabMenu(false);
        }, 100);
        setShowProfileTab(false);
      }
    }

    setShowUserIconNotificationMenu(false);
    setTimeout(() => {
      setUserNotificationMenu(false);
    }, 200);

    if (userIconProfileMenu) {
      setShowUserIconProfileMenu(false);
      setTimeout(() => {
        setUserIconProfileMenu(false);
      }, 200);
    } else {
      setUserIconProfileMenu(true);
      setTimeout(() => {
        setShowUserIconProfileMenu(true);
      }, 200);
    }
  }

  function activateNotificationMenu(event) {
    event.stopPropagation();
    if (hamburgerMenuRef.current) {
      if (hamburgerMenuRef.current.classList.contains("active")) {
        hamburgerMenuRef.current.classList.remove("active");
        if (mainNavRef.current) {
          mainNavRef.current.classList.remove("sideMenuVisible");
        }
        setTimeout(() => {
          enableProfileTabMenu(false);
        }, 100);
        setShowProfileTab(false);
      }
    }

    setShowUserIconProfileMenu(false);
    setTimeout(() => {
      setUserIconProfileMenu(false);
    }, 200);

    if (userNotificationMenu) {
      setShowUserIconNotificationMenu(false);
      setTimeout(() => {
        setUserNotificationMenu(false);
      }, 200);
    } else {
      setUserNotificationMenu(true);
      setTimeout(() => {
        setShowUserIconNotificationMenu(true);
      }, 200);
    }
  }

  function navBoxClick(event) {
    event.stopPropagation();
    if (event.currentTarget.nodeName.toLocaleLowerCase() === "nav") {
      if (hamburgerMenuRef.current) {
        hamburgerMenuRef.current.classList.remove("active");
        if (mainNavRef.current) {
          mainNavRef.current.classList.remove("sideMenuVisible");
        }
        setTimeout(() => {
          enableProfileTabMenu(false);
        }, 100);
        setShowProfileTab(false);
      }
      setShowUserIconProfileMenu(false);
      setTimeout(() => {
        setUserIconProfileMenu(false);
      }, 200);

      setShowUserIconNotificationMenu(false);
      setTimeout(() => {
        setUserNotificationMenu(false);
      }, 200);
    }
  }

  function headerMenusClicked(event) {
    event.stopPropagation();
    event.preventDefault();
    setShowProfileTab(false);
    setShowUserIconProfileMenu(false);
    setShowUserIconNotificationMenu(false);
    setTimeout(() => {
      enableProfileTabMenu(false);
      setUserIconProfileMenu(false);
      setUserNotificationMenu(false);
    }, 500);
    if (hamburgerMenuRef.current) {
      hamburgerMenuRef.current.classList.remove("active");
    }
    if (mainNavRef.current) {
      mainNavRef.current.classList.remove("sideMenuVisible");
    }
  }

  const acceptFollowRequestHandler = (event, user) => {
    event.stopPropagation();
    event.target.classList.add("loading");
    try {
      user.key = user.userKey;
      user.name = user.username;
      acceptFollowRequest(loggedInUser, user).subscribe((response) => {
        console.log("response", response);
        event.target.classList.remove("loading");
        if (response) {
          let notificationData = {};
          if (response && response.accepted) {
            notificationData = {
              notify: loggedInUser,
              action: response.accepted,
              user: user,
              createdAt: new Date(),
            };
          }
          if (notificationData && Object.keys(notificationData).length > 0) {
            // Updating Nofification for user who accepted request
            updateNotification(notificationData).subscribe((response) => {
              console.log("response", response);
              if (response && response.notified) {
                // Updating Nofification for user whose request accepted
                notificationData = {
                  notify: user,
                  action: "accepted",
                  user: loggedInUser,
                  createdAt: new Date(),
                };

                updateNotification(notificationData).subscribe((reponse) => {
                  console.log("reponse", reponse);
                  fetchNotifications();
                });
              }
            });
          }
        }
      });
    } catch (e) {
      event.target.classList.remove("loading");
      console.log("accept follow error: ", e);
    }
  };

  const rejectFollowRequestHandler = (event, user) => {
    event.stopPropagation();
    event.target.classList.add("loading");
    try {
      user.key = user.userKey;
      user.name = user.username;
      rejectFollowRequest(loggedInUser, user).subscribe((response) => {
        console.log("response", response);
        event.target.classList.remove("loading");
        if (response) {
          let notificationData = {};
          if (response && response.rejected) {
            notificationData = {
              notify: loggedInUser,
              action: response.rejected ? "rejected" : null,
              user: user,
              createdAt: new Date(),
            };
          }
          if (notificationData && Object.keys(notificationData).length > 0) {
            // Updating Nofification for user who accepted request
            updateNotification(notificationData).subscribe((response) => {
              console.log("response", response);
              fetchNotifications();
            });
          }
        }
      });
    } catch (e) {
      event.target.classList.remove("loading");
      console.log("accept follow error: ", e);
    }
  };

  const blockUserHandler = (event, user) => {
    event.stopPropagation();
    event.target.classList.add("loading");
    try {
      user.key = user.userKey;
      user.name = user.username;
      blockUser(loggedInUser, user).subscribe((response) => {
        console.log("response", response);
        event.target.classList.remove("loading");
        if (response) {
          let notificationData = {};
          if (response && response.blocked) {
            notificationData = {
              notify: loggedInUser,
              action: response.blocked ? "blocked" : null,
              user: user,
              createdAt: new Date(),
            };
          }
          if (notificationData && Object.keys(notificationData).length > 0) {
            // Updating Nofification for user who accepted request
            updateNotification(notificationData).subscribe((response) => {
              console.log("response", response);
              fetchNotifications();
            });
          }
        }
      });
    } catch (e) {
      event.target.classList.remove("loading");
      console.log("accept follow error: ", e);
    }
  };

  const unFollowkUserHandler = (event, user) => {
    event.stopPropagation();
    event.target.classList.add("loading");
    try {
      user.key = user.userKey;
      user.name = user.username;
      unFollowUser(loggedInUser, user).subscribe((response) => {
        console.log("response", response);
        event.target.classList.remove("loading");
        if (response) {
          let notificationData = {};
          if (response && response.unfollowed) {
            notificationData = {
              notify: loggedInUser,
              action: response.unfollowed ? "unfollowed" : null,
              user: user,
              createdAt: new Date(),
            };
          }
          if (notificationData && Object.keys(notificationData).length > 0) {
            // Updating Nofification for user who accepted request
            updateNotification(notificationData).subscribe((response) => {
              console.log("response", response);
              fetchNotifications();
            });
          }
        }
      });
    } catch (e) {
      event.target.classList.remove("loading");
      console.log("accept follow error: ", e);
    }
  };
  return (
    <>
      {
        isPageLoaderActive ?
        <Loader /> : ''
      }
      <nav
        ref={mainNavRef}
        onClick={(e) => navBoxClick(e)}
        className={`navigation-wrap ${animateNavClass} ${isHomeRoute && !isUserLoggedIn ? "home-nav-style" : ""
          } ${goingUpClass} ${isNavHidden ? "hide-nav" : ""} ${goingDownClass} ${!loggedInUser.username ? "user-logged-out" : ""
          }`}
      >
        <div className="flex-container desktop-navigation">
          <h1 title="home">
            <a href="/" onClick={(e) => onClickNav(e, "")}>
              <img src={boogaluLogo} alt="Boogalu" />
            </a>
          </h1>
          {!isMobile ? (
            <ul className="flex-1 nav-ul">
              {loggedInUser.username && (
                <li>
                  <a
                    href="#Dashboard"
                    title="Dashboard"
                    onClick={(e) => onClickNav(e, "")}
                  >
                    Dashboard
                  </a>
                </li>
              )}
              <li>
                <a
                  href="#Events"
                  title="Events"
                  onClick={(e) => onClickNav(e, "events")}
                >
                  Events
                </a>
              </li>
              <li>
                <a
                  href="#Lessons"
                  title="Lessons"
                  onClick={(e) => onClickNav(e, "lessons")}
                >
                  Lessons
                </a>
              </li>
              {!hideVdoUploadBtn ? (
                <li>
                  <a
                    href="#uploadVideo"
                    onClick={(e) => uploadVdo(e)}
                    title="upload video"
                  >
                    Upload
                  </a>
                </li>
              ) : (
                ""
              )}
            </ul>
          ) : (
            ""
          )}
          {(!loggedInUser || !loggedInUser.phone) && (
            <div className="flex-2 signup-wrap">
              <button
                className="btn primary-light login"
                onClick={() => navigateToUserRegistrationLogin("login")}
              >
                Login
              </button>
              <button
                className="btn primary-dark signup"
                onClick={() => navigateToUserRegistrationLogin("register")}
              >
                Sign Up
              </button>
              <a
                href="#hamburgerMenuLink"
                className="hamburgerMenu"
                ref={hamburgerMenuRef}
                title={`${profileTabMenu ? "Close menu" : "Open menu"}`}
                onClick={(e) => activateLeftMenuBar(e)}
              >
                <span></span>
              </a>
            </div>
          )}

          {loggedInUser && loggedInUser.phone && (
            <div className="flex-2 signup-wrap">
              <div className="profile" ref={ref}>
                <div
                  onClick={(e) => activateProfileIconMenu(e)}
                  className="profile-img-wrap userIcon"
                >
                  {
                    loggedInUser?.profileImage ?
                    <img src={loggedInUser.profileImage} alt="profile" />
                    : 
                    <MdAccountCircle />
                  }
                </div>
                <div
                  onClick={(e) => activateNotificationMenu(e)}
                  className={`profile-img-wrap notificationIcon ${isNotificationsPresent ? "active" : ""
                    }`}
                >
                  {isNotificationsPresent ? (
                    <span className="notificationCount">
                      {userNotificationList.length}
                    </span>
                  ) : (
                    ""
                  )}
                  {isNotificationsPresent ? (
                    <MdNotificationsActive />
                  ) : (
                    <MdNotifications />
                  )}
                </div>
              </div>
              <a
                href="#hamburgerMenuLink"
                className="hamburgerMenu"
                ref={hamburgerMenuRef}
                title={`${profileTabMenu ? "Close menu" : "Open menu"}`}
                onClick={(e) => activateLeftMenuBar(e)}
              >
                <span></span>
              </a>
              {/* <button className="signup" onClick={() => logout()}>Logout</button> */}
            </div>
          )}
          {profileTabMenu ? (
            <div
              className={`profile-tab-wrap ${showProfileTab ? "showMenu" : ""}`}
              onClick={(e) => headerMenusClicked(e)}
            >
              <i className="crossMenuIcon"></i>
              <div className="innerMenuWrap">
                {loggedInUser.username ? (
                  <div
                    className="linkMenu"
                    data-url="members"
                    onClick={(e) => topRightNavigation(e, "members")}
                  >
                    Members
                  </div>
                ) : (
                  ""
                )}
                <div
                  className="linkMenu"
                  data-url="subscription"
                  onClick={(e) => topRightNavigation(e, "subscription")}
                >
                  Subscription
                </div>
                <div
                  className="linkMenu"
                  data-url="aboutus"
                  onClick={(e) => topRightNavigation(e, "aboutus")}
                >
                  About us
                </div>
                <div
                  className="linkMenu"
                  data-url="contactus"
                  onClick={(e) => topRightNavigation(e, "contactus")}
                >
                  Contact us
                </div>
                <div
                  className="linkMenu"
                  data-url="privacypolicy"
                  onClick={(e) => topRightNavigation(e, "privacypolicy")}
                >
                  Privacy policies
                </div>
                <div
                  className="linkMenu"
                  data-url="termsandconditions"
                  onClick={(e) => topRightNavigation(e, "termsandconditions")}
                >
                  Terms &amp; conditions
                </div>
                <div
                  className="linkMenu"
                  data-url="refundpolicy"
                  onClick={(e) => topRightNavigation(e, "refundpolicy")}
                >
                  Cancellation/refund policy
                </div>
              </div>
            </div>
          ) : (
            ""
          )}

          {userIconProfileMenu ? (
            <div
              className={`profile-tab-wrap user-icon-menu-wrap ${showUserIconProfileMenu ? "showMenu" : ""
                }`}
              onClick={(e) => headerMenusClicked(e)}
            >
              <div className="innerMenuWrap">
                <a
                  href="/profile"
                  onClick={(e) => e.stopPropagation()}
                  className="linkMenu profileLink"
                >
                  My account
                </a>
                <div
                  className="linkMenu"
                  data-url="profile/edit"
                  onClick={(e) => topRightNavigation(e, "profile/edit")}
                >
                  Edit profile
                </div>
                <div className="linkMenu logoutLink" onClick={() => logout()}>
                  Logout
                </div>
              </div>
            </div>
          ) : (
            ""
          )}

          {userNotificationMenu ? (
            <div
              className={`profile-tab-wrap userNotificationOptionWrap user-icon-menu-wrap ${showUserNotificationMenu ? "showMenu" : ""
                }`}
              onClick={(e) => headerMenusClicked(e)}
            >
              <i
                title="close notification"
                className="closeNotificationIcon"
                onClick={(e) => headerMenusClicked(e)}
              ></i>
              {isNotificationsPresent &&
                userNotificationList &&
                userNotificationList.length ? (
                <div className="innerMenuWrap">
                  <ul className="notificationList">
                    {userNotificationList.map((user, index) => {
                      return (
                        <li key={index}>
                          {user.action === "requested" && (
                            <>
                              <p>
                                {user.username} has requested to follow you!
                              </p>
                              <div className="notificationAction">
                                <button
                                  className="btn primary-dark"
                                  onClick={(event) =>
                                    acceptFollowRequestHandler(event, user)
                                  }
                                >
                                  Accept
                                </button>
                                <button
                                  className="btn primary-light"
                                  onClick={(event) =>
                                    rejectFollowRequestHandler(event, user)
                                  }
                                >
                                  Reject
                                </button>
                              </div>
                            </>
                          )}
                          {user.action === "following" && (
                            <>
                              <p>{user.username} has started following you!</p>
                              <div className="notificationAction">
                                <button
                                  className="btn primary-light"
                                  onClick={(event) =>
                                    blockUserHandler(event, user)
                                  }
                                >
                                  Block
                                </button>
                              </div>
                            </>
                          )}
                          {user.action === "accepted" && (
                            <>
                              <p>
                                {user.username} accepted your follow request!
                              </p>
                              <div className="notificationAction">
                                <button
                                  className="btn primary-light"
                                  onClick={(event) =>
                                    unFollowkUserHandler(event, user)
                                  }
                                >
                                  Unfollow
                                </button>
                              </div>
                            </>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <div className="innerMenuWrap">
                  <p className="message">No pending notifications!</p>
                </div>
              )}
            </div>
          ) : (
            ""
          )}
        </div>
        {!hideVdoUploadBtn ? (
          <a
            href="#uploadVideoLink"
            className="upload-btn"
            onClick={(e) => uploadVdo(e)}
          >
            <i>
              <FaCloudUploadAlt />
            </i>
          </a>
        ) : (
          ""
        )}
        {isMobile ? (
          <div className="sticky-mobile-menu">
            <ul className="flex-1 nav-ul">
              <li>
                <a
                  href="/"
                  ref={mobilHomelinkRef}
                  onClick={(e) => onClickNav(e, "")}
                  className={activeRoute === "" ? "active" : ""}
                >
                  <i>
                    <FaHome />
                  </i>
                  <span>{loggedInUser.username ? "Dashboard" : "Home"}</span>
                </a>
              </li>
              <li>
                <a
                  href="#Lessons"
                  onClick={(e) => onClickNav(e, "lessons")}
                  className={activeRoute === "lessons" ? "active" : ""}
                >
                  <i>
                    <FaBookReader />
                  </i>
                  <span>Lessons</span>
                </a>
              </li>
              <li>
                <a
                  href="#upload"
                  onClick={(e) => onClickNav(e, "events")}
                  className={activeRoute === "events" ? "active" : ""}
                >
                  <i>
                    <FaTrophy />
                  </i>
                  <span>Events</span>
                </a>
              </li>
              {loggedInUser.username && (
                <li>
                  <a
                    href="#profile"
                    onClick={(e) => onClickNav(e, "profile")}
                    className={activeRoute === "profile" ? "active" : ""}
                  >
                    <i>
                      <FaUserAlt />
                    </i>
                    <span>Profile</span>
                  </a>
                </li>
              )}
              {!loggedInUser.username && (
                <li>
                  <a
                    href="#subscription"
                    onClick={(e) => onClickNav(e, "subscription")}
                    className={activeRoute === "subscription" ? "active" : ""}
                  >
                    <i>
                      <FaRupeeSign />
                    </i>
                    <span>Pricing</span>
                  </a>
                </li>
              )}
            </ul>
          </div>
        ) : (
          ""
        )}
        {openVdoUploadModal && (
          <VideoUploader
            handleVdoUploadResponse={() => setOpenVdoUploadModal(false)}
          />
        )}
        {openInformationModal ? <GenericInfoModal
          title={infoModalTitle}
          message={infoModalMessage}
          status={infoModalStatus}
          navigateUrl={navigateLink}
          closeInfoModal={shouldCloseInfoModal}
        /> : ''}
      </nav>
    </>
  );
}
export default Navigation;
