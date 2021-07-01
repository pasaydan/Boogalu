import { Observable } from 'rxjs';
import db from '../Database';
import { timeStampToNewDate } from './Utils';

const userRef = db.collection('users');

export function getUserByPhone(phone) {
    return new Observable((observer) => {
        userRef.where('phone', '==', phone).get().then((querySnapshot) => {
            let user = []
            querySnapshot.forEach(function (doc) {
                let data = doc.data();
                data.key = doc.id;
                user.push(data);
            })
            observer.next(user);
        })
    })
}

export function getUsersByFilter(filter, filterType) {
    return new Observable((observer) => {
        if (filterType === 'event') {
            userRef.orderBy('username').onSnapshot((querySnapshot) => {
                let user = []
                querySnapshot.forEach(function (doc) {
                    let isEventPresent = false;
                    let data = doc.data();
                    data.key = doc.id;
                    if (data.events && data.events.length) {
                        for(let i = 0; i < data.events.length; i++) {
                            if (data.events[i].id === filter) {
                                isEventPresent = true;
                            }
                        }
                    }
                    if (isEventPresent) {
                        user.push(data);
                    }
                })
                observer.next(user);
            })
        } else {
            userRef.where(filterType, '==', filter).get().then((querySnapshot) => {
                let user = []
                querySnapshot.forEach(function (doc) {
                    let data = doc.data();
                    data.key = doc.id;
                    if (data.role !== 'admin') {
                        user.push(data);
                    }
                })
                observer.next(user);
            })
        }
    })
}

export function getUserByEmail(email) {
    return new Observable((observer) => {
        userRef.where('email', '==', email).get().then((querySnapshot) => {
            let user = []
            querySnapshot.forEach(function (doc) {
                let data = doc.data();
                data.key = doc.id;
                user.push(data);
            })
            observer.next(user);
        })
    })
}

export function updateUser(id, data) {
    data.createdOn = data.createdOn || new Date();
    data.modifiedOn = new Date();
    return new Observable((observer) => {
        userRef.doc(id).set(data).then(() => {
            observer.next({ updated: true });
        });
    });
}

export function registerUser(data) {
    data.createdOn = new Date();
    data.modifiedOn = new Date();
    return new Observable((observer) => {
        userRef.add(data).then((doc) => {
            observer.next({
                key: doc.id,
            });
        });
    });
}

export function getUserById(id) {
    return new Observable((observer) => {
        userRef.doc(id).get().then((doc) => {
            let data = doc.data();
            observer.next({
                key: doc.id,
                name: data.name,
                email: data.email,
                phone: data.phone,
                dob: data?.dob?.seconds ? timeStampToNewDate(data.dob) : data.dob,
                bio: data.bio
            });
        });
    });
}

export function saveUserSubscription(id, data) {
    data.createdOn = data.createdOn || new Date();
    data.modifiedOn = new Date();
    return new Observable((observer) => {
        userRef.doc(id).set(data).then(() => {
            observer.next();
        });
    });
}

export function getLimitedUser(userKey) {
    return new Observable((observer) => {
        userRef.orderBy('name').limit(10).onSnapshot((querySnapshot) => {
            let users = [];
            querySnapshot.forEach((doc) => {
                let data = doc.data();
                data.key = doc.id;
                if (data.key !== userKey) {
                    users.push(data);
                }
            });
            observer.next(users);
        });
    });
}

export function getAllUser(userKey) {
    return new Observable((observer) => {
        userRef.orderBy('username').onSnapshot((querySnapshot) => {
            let users = [];
            if (userKey && userKey === 'admin') {
                querySnapshot.forEach((doc) => {
                    let data = doc.data();
                    data.key = doc.id;
                    users.push(data);
                });
            } else {
                if (userKey) {
                    querySnapshot.forEach((doc) => {
                        let data = doc.data();
                        data.key = doc.id;
                        if (data.key !== userKey) {
                            users.push(data);
                        }
                    });
                } else {
                    querySnapshot.forEach((doc) => {
                        let data = doc.data();
                        data.key = doc.id;
                        users.push(data);
                    });
                }
            }
            observer.next(users);
        });
    });
}

export function getAllUserLazyLoad(userKey) {
    return new Observable((observer) => {
        userRef.orderByChild('username')
            .startAt(0)
            .endAt(14)
            .limitToFirst(5)
            .onSnapshot((querySnapshot) => {
                let users = [];
                querySnapshot.forEach((doc) => {
                    let data = doc.data();
                    data.key = doc.id;
                    users.push(data);
                });
                observer.next(users);
            });
    });
}

export function updateFollowUnfollow(id, followedById, action) {
    return new Observable((observer) => {
        let followed = false;
        let requested = false;
        userRef.doc(id).get().then((doc) => {
            let data = doc.data();
            if (action === 'follow') {
                if (data && !data.privacy) {
                    data = { ...data, 'privacy': 'public' }
                }
                if (data.privacy && (data.privacy === 'Public' || data.privacy === 'public')) {
                    followed = true;
                    if (!data.notification) {
                        data = { ...data, 'notification': { 'followedBy': [followedById] } };
                    } else if (!data.notification.followedBy) {
                        data = { ...data, 'notification': { 'followedBy': [followedById] } };
                    } else {
                        data.notification.followedBy.push(followedById);
                    }
                    if (!data.followedBy) {
                        data = { ...data, 'followedBy': [followedById] };
                    } else {
                        data.followedBy.push(followedById);
                    }
                } else {
                    requested = true;
                    if (!data.notification) {
                        data = { ...data, 'notification': { 'followRequestedBy': [followedById] } };
                    } else if (!data.notification.followRequestedBy) {
                        data = { ...data, 'notification': { 'followRequestedBy': [followedById] } };
                    } else {
                        data.notification.followRequestedBy.push(followedById);
                    }
                }
                userRef.doc(id).set(data).then(() => {
                    userRef.doc(followedById).get().then((doc) => {
                        let followedByUserData = doc.data();
                        if (!followedByUserData.following) {
                            followedByUserData = { ...followedByUserData, 'following': [id] };
                        } else {
                            followedByUserData.following.push(id);
                        }
                        userRef.doc(followedById).set(followedByUserData).then(() => {
                            console.log(`Follow requested by user ${followedById} has been notified`);
                        });
                    });
                    if (followed) {
                        observer.next({ followed: true, followedUser: id, followedBy: followedById, email: data.email, name: data.name });
                    } else if (requested) {
                        observer.next({ requested: true, followedUser: id, followedBy: followedById, email: data.email, name: data.name });
                    } else {
                        observer.next({ error: true });
                    }
                });
            }
        });
    });
}

export function getUserPublicProfile(email) {
    return new Observable((observer) => {
        userRef.where('email', '==', email).get().then((querySnapshot) => {
            let user = []
            querySnapshot.forEach(function (doc) {
                let data = doc.data();
                const privateData = [
                    'password', 'confirmPassword', 'createdOn', 'modifiedOn', 'subscribed'
                ]
                privateData.forEach((item) => {
                    if (data[item]) {
                        delete data[item];
                    }
                });
                console.log("getUserPublicProfile", data);
                data.key = doc.id;
                user.push(data);
            })
            observer.next(user);
        })
    })
}

export function updatePassword(id, password) {
    return new Observable((observer) => {
        userRef.doc(`/${id}`).update({ 'password': password }).then(() => {
            observer.next();
        });
    });

}

export function updateLessonsTaken(id, data) {
    data.modifiedOn = new Date();
    return new Observable((observer) => {
        userRef.doc(id).set(data).then(() => {
            observer.next();
        });
    });
}

export function getUsersLessonsOnly(id) {
    return new Observable((observer) => {
        userRef.doc(id).get().then((doc) => {
            let data = doc.data();
            observer.next({
                key: doc.id,
                name: data.name,
                email: data.email,
                phone: data.phone,
                myLessons: data?.myLessons
            });
        });
    });
}
