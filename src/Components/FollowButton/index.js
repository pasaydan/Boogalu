import {
  Button,
  ClickAwayListener,
  FormControl,
  Grow,
  InputLabel,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Select,
} from "@material-ui/core";
import React from "react";
import {
  updateFollowUnfollow,
  blockUser,
  unFollowUser,
  cancelFollowRequest,
} from "../../Services/Friendship.service";
import { updateNotification } from "../../Services/Notifications.service";
import { useStoreConsumer } from "../../Providers/StateProvider";
import { enableLoading, disableLoading } from "../../Actions/Loader";
const FollowButton = (props) => {
  const { status, onClickHandler, user, loggedInUser } = props;
  const { state, dispatch } = useStoreConsumer();
  const handleChange = (event) => {
    let value = event.target.value;
    console.log("value ", value);
  };

  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);

  const handleToggle = (event, identifier) => {
    if (!identifier) {
      setOpen((prevOpen) => !prevOpen);
    } else {
      followHandler("follow", user, loggedInUser);
    }
  };

  const handleClose = (event) => {
    const value = event.currentTarget.id;
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
    if (value && value.length) {
      console.log("value", value);
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

  const followHandler = (action, toFollowUser, followByUser) => {
    dispatch(enableLoading());
    updateFollowUnfollow(action, toFollowUser, followByUser).subscribe(
      (response) => {
        if (response) {
          const { name, email } = response;
          console.log("Name: ", name);
          console.log("Email: ", email);
          if (response) {
            let notificationData = {};
            if (response.followed || response.requested) {
              notificationData = {
                notify: toFollowUser,
                action: response.followed ? "following" : "requested",
                user: followByUser,
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
        dispatch(disableLoading());
      }
    );
  };

  const blockUserHandler = (user) => {
    // user.key = user.userKey;
    // user.name = user.username;
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
            console.log("response", response);
            onClickHandler();
          });
        }
      }
    });
  };

  const unFollowkUserHandler = (user) => {
    // user.key = user.userKey;
    // user.name = user.username;
    unFollowUser(loggedInUser, user).subscribe((response) => {
      console.log("response", response);
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
            onClickHandler();
          });
        }
      }
    });
  };

  const cancelFollowRequestHandler = (user) => {
    // user.key = user.userKey;
    // user.name = user.username;
    cancelFollowRequest(loggedInUser, user).subscribe((response) => {
      console.log("response", response);
      if (response) {
        let notificationData = {};
        if (response && response.cancelled) {
          notificationData = {
            notify: loggedInUser,
            action: response.cancelled ? "cancelled" : null,
            user: user,
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
    });
  };
  return (
    <>
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
        <div className="input-wrap">
          <Button
            ref={anchorRef}
            aria-controls={open ? "menu-list-grow" : undefined}
            aria-haspopup="true"
            onClick={handleToggle}
            className="btn primary-light followBtn"
          >
            {status}
          </Button>
          <Popper
            open={open}
            anchorEl={anchorRef.current}
            role={undefined}
            transition
            disablePortal
          >
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                style={{
                  transformOrigin:
                    placement === "bottom" ? "center top" : "center bottom",
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
          </Popper>
        </div>
      )}
      {/* {status === "requested" && (
        <div className="input-wrap">
          <Button
            ref={anchorRef}
            aria-controls={open ? "menu-list-grow" : undefined}
            aria-haspopup="true"
            onClick={handleToggle}
            className="btn primary-light followBtn"
          >
            Requested
          </Button>
          <Popper
            open={open}
            anchorEl={anchorRef.current}
            role={undefined}
            transition
            disablePortal
          >
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                style={{
                  transformOrigin:
                    placement === "bottom" ? "center top" : "center bottom",
                }}
              >
                <Paper>
                  <ClickAwayListener onClickAway={handleClose}>
                    <MenuList
                      autoFocusItem={open}
                      id="menu-list-grow"
                      onKeyDown={handleListKeyDown}
                    >
                      <MenuItem onClick={handleClose}>Cancel Request</MenuItem>
                      <MenuItem onClick={handleClose}>Block</MenuItem>
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
        </div>
      )} */}
    </>
  );
};

export default FollowButton;
