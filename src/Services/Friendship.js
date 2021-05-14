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

export const 