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
            observer.next();
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
