import { Observable } from "rxjs";
import db from "../Database";
import { updateNotification } from "./Notifications.service";

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
                if (!data.followRequestedBy) {
                  data = { ...data, followRequestedBy: [followByUserKey] };
                } else {
                  data.followRequestedBy.push(followByUserKey);
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

export const acceptFollowRequest = (toFollowUser, followByUser) => {
  const toFollowUserKey = toFollowUser.key;
  const followByUserKey = followByUser.key;
  let acceptedUserData = {};
  return new Observable((observer) => {
    userRef
      .doc(toFollowUserKey)
      .get()
      .then((doc) => {
        let data = doc.data();
        userRef
          .doc(followByUserKey)
          .get()
          .then((doc) => {
            acceptedUserData = doc.data();

            if (data) {
              if (data.followRequestedBy) {
                data.followRequestedBy.forEach((requestId) => {
                  if (requestId === followByUserKey) {
                    data.followRequestedBy.splice(followByUserKey);
                    if (data.followedBy) {
                      data.followedBy.push(followByUserKey);
                    } else {
                      data = { ...data, followedBy: [followByUserKey] };
                    }
                    if (!acceptedUserData.following) {
                      acceptedUserData = {
                        ...acceptedUserData,
                        following: [toFollowUserKey],
                      };
                    } else {
                      acceptedUserData.following.push(toFollowUserKey);
                    }
                  }
                });

                userRef
                  .doc(toFollowUserKey)
                  .set(data)
                  .then(() => {
                    console.log(
                      `Follow request accepted by  ${toFollowUserKey}`
                    );
                    userRef
                      .doc(followByUserKey)
                      .set(acceptedUserData)
                      .then(() => {
                        console.log(
                          `${followByUserKey} request has been accepted`
                        );
                        observer.next({
                          accepted: true,
                          followedUser: toFollowUserKey,
                          followedBy: followByUserKey,
                          email: data.email,
                          name: data.name,
                        });
                      });
                  });
              }
            }
          });
      });
  });
};

export const rejectFollowRequest = (toFollowUser, followByUser) => {
  const toFollowUserKey = toFollowUser.key;
  const followByUserKey = followByUser.key;
  return new Observable((observer) => {
    userRef
      .doc(toFollowUserKey)
      .get()
      .then((doc) => {
        let data = doc.data();
        if (data) {
          if (data.followRequestedBy) {
            data.followRequestedBy.forEach((requestId) => {
              if (requestId === followByUserKey) {
                data.followRequestedBy.splice(followByUserKey);
              }
            });
            userRef
              .doc(toFollowUserKey)
              .set(data)
              .then(() => {
                console.log(
                  `Follow request from ${followByUserKey} rejected by  ${toFollowUserKey}`
                );
                observer.next({
                  rejected: true,
                  followedUser: toFollowUserKey,
                  followedBy: followByUserKey,
                  email: data.email,
                  name: data.name,
                });
              });
          }
        }
      });
  });
};

export const blockUser = (toFollowUser, followByUser) => {
  const toFollowUserKey = toFollowUser.key;
  const followByUserKey = followByUser.key;
  return new Observable((observer) => {
    userRef
      .doc(toFollowUserKey)
      .get()
      .then((doc) => {
        let data = doc.data();
        if (data) {
          if (data.followedBy) {
            data.followedBy.forEach((requestId) => {
              if (requestId === followByUserKey) {
                data.followedBy.splice(followByUserKey);
                if (data.blockList) {
                  data.blockList.push(followByUserKey);
                } else {
                  data = { ...data, blockList: [followByUserKey] };
                }
              }
            });

            userRef
              .doc(toFollowUserKey)
              .set(data)
              .then(() => {
                console.log(
                  `${toFollowUserKey} has blocked this user : ${followByUserKey}`
                );
                observer.next({
                  blocked: true,
                  followedUser: toFollowUserKey,
                  followedBy: followByUserKey,
                  email: data.email,
                  name: data.name,
                });
              });
          }
        }
      });
  });
};

export const unFollowUser = (toFollowUser, followByUser) => {
  const toFollowUserKey = toFollowUser.key;
  const followByUserKey = followByUser.key;
  return new Observable((observer) => {
    userRef
      .doc(toFollowUserKey)
      .get()
      .then((doc) => {
        let data = doc.data();
        if (data) {
          if (data.following) {
            data.following.forEach((requestId) => {
              if (requestId === followByUserKey) {
                data.following.splice(followByUserKey);
                if (data.blockList) {
                  data.blockList.push(followByUserKey);
                } else {
                  data = { ...data, blockList: [followByUserKey] };
                }
              }
            });

            userRef
              .doc(toFollowUserKey)
              .set(data)
              .then(() => {
                console.log(
                  `${toFollowUserKey} unfollowed this user : ${followByUserKey}`
                );
                observer.next({
                  unfollowed: true,
                  followedUser: toFollowUserKey,
                  followedBy: followByUserKey,
                  email: data.email,
                  name: data.name,
                });
              });
          }
        }
      });
  });
};
