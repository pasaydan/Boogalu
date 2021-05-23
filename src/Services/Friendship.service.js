import { Observable } from "rxjs";
import db from "../Database";

const userRef = db.collection("users");
const notificationsRef = db.collection("notifications");

export function updateFollowUnfollow(toFollowUser, followByUser, action) {
  const toFollowUserKey = toFollowUser.key;
  const followByUserKey = followByUser.key;
  return new Observable((observer) => {
    let followed = false;
    let requested = false;
    let followedByUserData = {};
    userRef
      .doc(toFollowUserKey)
      .get()
      .then((doc) => {
        let data = doc.data();
        userRef
          .doc(followByUserKey)
          .get()
          .then((doc) => {
            followedByUserData = doc.data();

            if (action === "follow") {
              if (data && !data.privacy) {
                data = { ...data, privacy: "public" };
              }

              if (
                data.privacy &&
                (data.privacy === "Public" || data.privacy === "public")
              ) {
                followed = true;
                if (!data.followedBy) {
                  data = { ...data, followedBy: [followByUserKey] };
                } else {
                  data.followedBy.push(followByUserKey);
                }
                if (!followedByUserData.following) {
                  followedByUserData = {
                    ...followedByUserData,
                    following: [toFollowUserKey],
                  };
                } else {
                  followedByUserData.following.push(toFollowUserKey);
                }
              } else {
                requested = true;
                if (!data.followedRequestedBy) {
                  data = { ...data, followedRequestedBy: [followByUserKey] };
                } else {
                  data.followedRequestedBy.push(followByUserKey);
                }
              }

              userRef
                .doc(toFollowUserKey)
                .set(data)
                .then(() => {
                  userRef
                    .doc(followByUserKey)
                    .set(followedByUserData)
                    .then(() => {
                      console.log(
                        `Follow requested by user ${followByUserKey} has been notified`
                      );
                    });
                  if (followed) {
                    observer.next({
                      followed: true,
                      followedUser: toFollowUserKey,
                      followedBy: followByUserKey,
                      email: data.email,
                      name: data.name,
                    });
                  } else if (requested) {
                    observer.next({
                      requested: true,
                      followedUser: toFollowUserKey,
                      followedBy: followByUserKey,
                      email: data.email,
                      name: data.name,
                    });
                  } else {
                    observer.next({ error: true });
                  }
                });
            }
          });
      });
  });
}

export const acceptFollowRequest = (loggedInUserKey, userKey) => {
  return new Observable((observer) => {
    userRef
      .doc(loggedInUserKey)
      .get()
      .then((doc) => {
        let data = doc.data();
        if (data && data.notification) {
          if (data.notification.followRequestedBy) {
            data.notification.followRequestedBy.forEach((requestId) => {
              if (requestId === userKey) {
                data.notification.followRequestedBy.splice(userKey);
                if (data.acceptedRequested) {
                  data.acceptedRequested.push(userKey);
                } else {
                  data = { ...data, acceptedRequested: [userKey] };
                }
                userRef
                  .doc(userKey)
                  .get()
                  .then((doc) => {
                    let acceptedUserData = doc.data();
                    if (!acceptedUserData.notification) {
                      acceptedUserData = {
                        ...acceptedUserData,
                        notification: {
                          followRequestAcceptedBy: [loggedInUserKey],
                        },
                      };
                    } else if (
                      !acceptedUserData.notification.followRequestAcceptedBy
                    ) {
                      acceptedUserData = {
                        ...acceptedUserData,
                        notification: {
                          followRequestAcceptedBy: [loggedInUserKey],
                        },
                      };
                    } else {
                      acceptedUserData.notification.followRequestAcceptedBy.push(
                        loggedInUserKey
                      );
                    }
                    userRef
                      .doc(userKey)
                      .set(acceptedUserData)
                      .then((doc) => {
                        userRef
                          .doc(loggedInUserKey)
                          .set(data)
                          .then(() => {
                            observer.next({ success: true });
                          });
                      });
                  });
              }
            });
          }
        }
      });
  });
};

export const rejectFollowRequest = (loggedInUserKey, userKey) => {
  return new Observable((observer) => {
    userRef
      .doc(loggedInUserKey)
      .get()
      .then((doc) => {
        let data = doc.data();
        if (data && data.notification) {
          if (data.notification.followRequestedBy) {
            data.notification.followRequestedBy.forEach((requestId) => {
              if (requestId === userKey) {
                data.notification.followRequestedBy.splice(userKey);
                if (data.rejectRequested) {
                  data.rejectRequested.push(userKey);
                } else {
                  data = { ...data, rejectRequested: [userKey] };
                }

                userRef
                  .doc(loggedInUserKey)
                  .set(data)
                  .then(() => {
                    observer.next({ success: true });
                  });
                // userRef.doc(userKey).get().then((doc) => {
                //     let rejectedUserData = doc.data();
                //     if (!rejectedUserData.notification) {
                //         rejectedUserData = {...rejectedUserData, 'notification': {'followRequestRejectedtedBy' : [loggedInUserKey]}};
                //     } else if (!rejectedUserData.notification.followRequestRejectedtedBy) {
                //         rejectedUserData = {...rejectedUserData, 'notification': {'followRequestRejectedtedBy' : [loggedInUserKey]}};
                //     } else {
                //         rejectedUserData.notification.followRequestRejectedtedBy.push(loggedInUserKey);
                //     }
                //     userRef.doc(userKey).set(rejectedUserData).then((doc) => {
                //         userRef.doc(loggedInUserKey).set(data).then(() => {
                //             observer.next({success: true});
                //         });
                //     });
                // })
              }
            });
          }
        }
      });
  });
};

export const blockUser = (loggedInUserKey, userKey) => {
  return new Observable((observer) => {
    userRef
      .doc(loggedInUserKey)
      .get()
      .then((doc) => {
        let data = doc.data();
        if (data && data.notification) {
          if (data.notification.followedBy) {
            data.notification.followedBy.forEach((requestId) => {
              if (requestId === userKey) {
                data.notification.followedBy.splice(userKey);
                if (data.blockFollowRequest) {
                  data.blockFollowRequest.push(userKey);
                } else {
                  data = { ...data, blockFollowRequest: [userKey] };
                }

                userRef
                  .doc(loggedInUserKey)
                  .set(data)
                  .then(() => {
                    observer.next({ success: true });
                  });
              }
            });
          }
        }
      });
  });
};

export const unFollowUser = (loggedInUserKey, userKey) => {
  return new Observable((observer) => {
    userRef
      .doc(loggedInUserKey)
      .get()
      .then((doc) => {
        let data = doc.data();
        if (data && data.notification) {
          if (data.notification.followedBy) {
            data.notification.followedBy.forEach((requestId) => {
              if (requestId === userKey) {
                data.notification.followedBy.splice(userKey);
                if (data.blockFollowRequest) {
                  data.blockFollowRequest.push(userKey);
                } else {
                  data = { ...data, blockFollowRequest: [userKey] };
                }

                userRef
                  .doc(loggedInUserKey)
                  .set(data)
                  .then(() => {
                    observer.next({ success: true });
                  });
              }
            });
          }
        }
      });
  });
};
