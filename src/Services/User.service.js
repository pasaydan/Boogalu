import { Observable } from 'rxjs';
import db from '../Database';

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
            observer.next({updated: true});
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
                phone: data.phone
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

export function getLimitedUser() {
    return new Observable((observer) => {
        userRef.orderBy('name').limit(10).onSnapshot((querySnapshot) => {
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

export function getAllUser() {
    return new Observable((observer) => {
        userRef.orderBy('username').onSnapshot((querySnapshot) => {
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
                if (data.privacy === ('Public' || 'public')) {
                    followed = true;
                    if (!data.followedBy) {
                        data = {...data, followedBy: [followedById]}
                    } else {
                        data.followedBy.push(followedById);
                    }
                } else {
                    requested = true;
                    if (!data.followRequestedBy) {
                        data = {...data, followRequestedBy: [followedById]}
                    } else {
                        data.followRequestedBy.push(followedById);
                    }
                }
                userRef.doc(id).set(data).then(() => {
                    if (followed) {
                        observer.next({followed: true, followedUser: id, followedBy: followedById, email: data.email, name: data.name});
                    } else if (requested) {
                        observer.next({requested: true, followedUser: id, followedBy: followedById, email: data.email, name: data.name});
                    } else {
                        observer.next({error: true});
                    }
                });
            }
        });
    });
}

export function getUserPublicProfile(email){
    return new Observable((observer) => {
        userRef.where('email', '==', email).get().then((querySnapshot) => {
            let user = []
            querySnapshot.forEach(function (doc) {
                let data = doc.data();
                const privateData = [
                    'username', 'password', 'confirmPassword', 'createdOn', 'followRequestedBy', 'modifiedOn', 'subscribed'
                ]
                privateData.map((item) => {
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