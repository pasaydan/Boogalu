import {
  Button,
  ClickAwayListener,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
} from "@material-ui/core";
import React, { useState } from "react";
import {
  updateFollowUnfollow,
  blockUser,
  unFollowUser,
  cancelFollowRequest,
} from "../../Services/Friendship.service";
import { updateNotification } from "../../Services/Notifications.service";
import Loader from "../Loader";
const FollowButton = (props) => {
  const { status, onClickHandler, user, loggedInUser } = props;
  const [isLoaderActive, toggleLoading] = useState(false);
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);

  const handleToggle = (event, identifier) => {
    event.stopPropagation();
    if (!identifier) {
      setOpen((prevOpen) => !prevOpen);
    } else {
      followHandler("follow", user, loggedInUser);
    }
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
    let value = event.currentTarget.id;
    if (value && value.length) {
      // followHandler(value, user, loggedInUser);
      switch (value) {
        case "cancelrequest":
          cancelFollowRequestHandler(user);
          break;
        case "unfollow":
          unFollowkUserHandler(user);
          break;
        case "block":
          blockUserHandler(user);
          break;
        default:
          break;
      }
    }
  };

  function handleListKeyDown(event) {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  const followHandler = (action, user, loggedInUser) => {
    toggleLoading(true);
    updateFollowUnfollow(action, user, loggedInUser).subscribe((response) => {
      if (response) {
        // eslint-disable-next-line no-unused-vars
        const { name, email } = response;
        if (response) {
          let notificationData = {};
          if (response.followed || response.requested) {
            notificationData = {
              notify: user,
              action: response.followed ? "following" : "requested",
              user: loggedInUser,
              createdAt: new Date(),
            };
          }
          if (notificationData && Object.keys(notificationData).length > 0) {
            updateNotification(notificationData).subscribe((reponse) => {
              console.log("reponse", reponse);
              // callback here
              onClickHandler();
            });
          }
        }
      }
      toggleLoading(false);
    });
  };

  const blockUserHandler = (user) => {
    // user.key = user.userKey;
    // user.name = user.username;
    toggleLoading(true);
    blockUser(loggedInUser, user).subscribe((response) => {
      console.log("response", response);
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
            onClickHandler();
          });
        }
      }
      toggleLoading(false);
    });
  };

  const unFollowkUserHandler = (user) => {
    // user.key = user.userKey;
    // user.name = user.username;
    toggleLoading(true);
    unFollowUser(loggedInUser, user).subscribe((response) => {
      console.log("response", response);
      if (response) {
        let notificationData = {};
        if (response && response.unfollowed) {
          notificationData = {
            notify: user,
            action: response.unfollowed ? "unfollowed" : null,
            user: loggedInUser,
            createdAt: new Date(),
          };
        }
        if (notificationData && Object.keys(notificationData).length > 0) {
          // Updating Nofification for user who accepted request
          updateNotification(notificationData).subscribe((response) => {
            console.log("response", response);
            onClickHandler();
          });
        }
      }
      toggleLoading(false);
    });
  };

  const cancelFollowRequestHandler = (user) => {
    // user.key = user.userKey;
    // user.name = user.username;
    toggleLoading(true);
    cancelFollowRequest(loggedInUser, user).subscribe((response) => {
      console.log("response", response);
      if (response) {
        let notificationData = {};
        if (response && response.cancelled) {
          notificationData = {
            notify: user,
            action: response.cancelled ? "cancelled" : null,
            user: loggedInUser,
            createdAt: new Date(),
          };
        }
        if (notificationData && Object.keys(notificationData).length > 0) {
          // Updating Nofification for user who accepted request
          updateNotification(notificationData).subscribe((response) => {
            console.log("response", response);
            onClickHandler();
          });
        }
      }
      toggleLoading(false);
    });
  };
  return (
    <>
      <Loader value={isLoaderActive} />
      {!status && (
        <Button
          variant="contained"
          color="primary"
          className="btn primary-light followBtn"
          onClick={(e) => handleToggle(e, "follow")}
        >
          Follow
        </Button>
      )}
      {(status === "following" || status === "requested") && (
        <div className="input-wrap cardFollowBtd">
          <Button
            ref={anchorRef}
            aria-controls={open ? "menu-list-grow" : undefined}
            aria-haspopup="true"
            onClick={handleToggle}
            className="btn primary-light followBtn"
          >
            {status}
          </Button>
          {
            open ?
            <div className="boxPopper">
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList
                  autoFocusItem={open}
                  id="menu-list-grow"
                  onKeyDown={handleListKeyDown}
                >
                  {status === "requested" && (
                    <MenuItem id="cancelrequest" onClick={handleClose}>
                      Cancel Request
                    </MenuItem>
                  )}

                  {status === "following" && (
                    <MenuItem id="unfollow" onClick={handleClose}>
                      Unfollow
                    </MenuItem>
                  )}
                  <MenuItem id="block" onClick={handleClose}>
                    Block
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </div> : ''
          }
          {/* <Popper
            open={open}
            anchorEl={anchorRef.current}
            role={undefined}
            transition
            disablePortal
            placement='bottom'
            style={{ zIndex: 15 }}
          >
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                style={{
                  transformOrigin: "center bottom"
                }}
              >
                <Paper>
                  <ClickAwayListener onClickAway={handleClose}>
                    <MenuList
                      autoFocusItem={open}
                      id="menu-list-grow"
                      onKeyDown={handleListKeyDown}
                    >
                      {status === "requested" && (
                        <MenuItem id="cancelrequest" onClick={handleClose}>
                          Cancel Request
                        </MenuItem>
                      )}

                      {status === "following" && (
                        <MenuItem id="unfollow" onClick={handleClose}>
                          Unfollow
                        </MenuItem>
                      )}
                      <MenuItem id="block" onClick={handleClose}>
                        Block
                      </MenuItem>
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper> */}
        </div>
      )}
    </>
  );
};

export default FollowButton;
