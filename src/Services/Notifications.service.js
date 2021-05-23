import { Observable } from "rxjs";
import db from "../Database";

const notificationsRef = db.collection("notifications");
const userRef = db.collection("users");

export const getNotifications = (id) => {
  return new Observable((observer) => {
    notificationsRef
      .doc(id)
      .get()
      .then((doc) => {
        let data = doc.data();
        console.log("getNotifications >>>>> ", data);
        if (data) {
          observer.next(data);
        } else {
          observer.next({
            message: "No notifications found!",
          });
        }
      });
  });
};

export const updateNotification = (notificationData) => {
  const { notify, action, user } = notificationData;
  const updateData = {
    action: action,
    userKey: user.key,
    username: user.name,
    createdAt: new Date(),
  };
  return new Observable((observer) => {
    notificationsRef
      .doc(notify.key)
      .get()
      .then((doc) => {
        let data = doc.data();
        if (action === "requested") {
          // if (!data) {
          //   data = { ...data, followRequestedBy: [notificationData] };
          // } else
          if (!data || !data.followRequestedBy) {
            data = { ...data, followRequestedBy: [updateData] };
          } else {
            data.followRequestedBy.push(updateData);
          }
        }
        if (action === "following") {
          if (!data || !data.followedBy) {
            data = { ...data, followedBy: [updateData] };
          } else {
            data.followedBy.push(updateData);
          }
        }
        if (action === "accepted") {
          if (!data || !data.accepted) {
            data = { ...data, acceptedBy: [updateData] };
          } else {
            data.acceptedBy.push(updateData);
          }
        }
        notificationsRef
          .doc(notify.key)
          .set(data)
          .then((doc) => {
            observer.next({
              name: notify.name,
              notified: true,
            });
          });
        // if (!data.followedBy) {
        //   data = { ...data, followedBy: [followByUserKey] };
        // } else {
        //   data.followedBy.push(followByUserKey);
        // }
        // console.log("data ", data);
        // if (data) {
        //   observer.next({
        //     key: doc.id,
        //     name: data.name,
        //     email: data.email,
        //     phone: data.phone,
        //     notification: data.notification,
        //   });
        // } else {
        //   observer.next({
        //     message: "No notifications found!",
        //   });
        // }
      });
  });
};
