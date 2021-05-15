import { Observable } from 'rxjs';
import db from '../Database';

const userRef = db.collection('users');

export const getNotifications = (id) => {
    return new Observable((observer) => {
        userRef.doc(id).get().then((doc) => {
            let data = doc.data();
            observer.next({
                key: doc.id,
                name: data.name,
                email: data.email,
                phone: data.phone,
                notification: data.notification
            });
        });
    });
}

export const acceptFollowRequest = (loggedInUserKey, userKey) => {
    return new Observable((observer) => {
        let followed = false;
        let requested = false;
        userRef.doc(loggedInUserKey).get().then((doc) => {
            let data = doc.data();
            if (data && data.notification) {
                if (data.notification.followRequestedBy) {
                    data.notification.followRequestedBy.map((requestId) => {
                        if (requestId === userKey) {
                            data.notification.followRequestedBy.splice(userKey);
                            if (data.acceptedRequested) {
                                data.acceptedRequested.push(userKey);
                            } else {
                                data = {...data, 'acceptedRequested': [userKey]};
                            }
                            userRef.doc(userKey).get().then((doc) => {
                                let acceptedUserData = doc.data();
                                if (!acceptedUserData.notification) {
                                    acceptedUserData = {...acceptedUserData, 'notification': {'followRequestAcceptedBy' : [loggedInUserKey]}};
                                } else if (!acceptedUserData.notification.followRequestAcceptedBy) {
                                    acceptedUserData = {...acceptedUserData, 'notification': {'followRequestAcceptedBy' : [loggedInUserKey]}};
                                } else {
                                    acceptedUserData.notification.followRequestAcceptedBy.push(loggedInUserKey);
                                }
                                userRef.doc(userKey).set(acceptedUserData).then((doc) => {
                                    userRef.doc(loggedInUserKey).set(data).then(() => {
                                        observer.next({success: true});
                                    });
                                });
                            })
                        }
                    });
                }
            }
        })
    });
}

export const rejectFollowRequest = (loggedInUserKey, userKey) => {
    return new Observable((observer) => {
        let followed = false;
        let requested = false;
        userRef.doc(loggedInUserKey).get().then((doc) => {
            let data = doc.data();
            if (data && data.notification) {
                if (data.notification.followRequestedBy) {
                    data.notification.followRequestedBy.map((requestId) => {
                        if (requestId === userKey) {
                            data.notification.followRequestedBy.splice(userKey);
                            if (data.rejectRequested) {
                                data.rejectRequested.push(userKey);
                            } else {
                                data = {...data, 'rejectRequested': [userKey]};
                            }

                            userRef.doc(loggedInUserKey).set(data).then(() => {
                                observer.next({success: true});
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
        })
    });
}


export const blockUser = (loggedInUserKey, userKey) => {
    return new Observable((observer) => {
        let followed = false;
        let requested = false;
        userRef.doc(loggedInUserKey).get().then((doc) => {
            let data = doc.data();
            if (data && data.notification) {
                if (data.notification.followedBy) {
                    data.notification.followedBy.map((requestId) => {
                        if (requestId === userKey) {
                            data.notification.followedBy.splice(userKey);
                            if (data.blockFollowRequest) {
                                data.blockFollowRequest.push(userKey);
                            } else {
                                data = {...data, 'blockFollowRequest': [userKey]};
                            }

                            userRef.doc(loggedInUserKey).set(data).then(() => {
                                observer.next({success: true});
                            });
                        }
                    });
                }
            }
        })
    });
}