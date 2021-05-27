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
          observer.next({ data: data });
        } else {
          observer.next({
            data: [],
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
            data = { ...data, accepted: [updateData] };
          } else {
            data.accepted.push(updateData);
          }
        }
        if (action === true) {
          if (data && data.followRequestedBy) {
            let tempData = data.followRequestedBy;
            tempData.map((item, index) => {
              if (item.userKey === updateData.userKey) {
                tempData.splice(index);
              }
            });
            data.followRequestedBy = tempData;
          }
        }
        notificationsRef
          .doc(notify.key)
          .set(data)
          .then(() => {
            observer.next({
              name: notify.name,
              notified: true,
            });
          });
      });
  });
};
