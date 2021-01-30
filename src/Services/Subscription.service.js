import { Observable } from 'rxjs';
import { formatDate, formatTime } from "./Utils";
import db from '../Database';

const subscriptionRef = db.collection('subscriptions');

export function getSubscriptionsList() {
    return new Observable((observer) => {
        subscriptionRef.onSnapshot((querySnapshot) => {
            let cat = [];
            querySnapshot.forEach((doc) => {
                let data = doc.data();
                data.key = doc.id;
                let startingDate = new Date(data.startAt);
                data.startingDate = formatDate(startingDate, 3) + " " + formatTime(startingDate);
                let endingDate = new Date(data.endAt);
                data.endingDate = formatDate(endingDate, 3) + " " + formatTime(endingDate);
                cat.push(data);
            });
            cat.sort((a, b) => a.index - b.index);
            observer.next(cat);
        });
    });
}

export function getActiveSubscriptionsList() {
    return new Observable((observer) => {
        subscriptionRef.onSnapshot((querySnapshot) => {
            let cat = [];
            querySnapshot.forEach((doc) => {
                let data = doc.data();
                if (data.active) {
                    let startingDate = new Date(data.startAt);
                    data.startingDate = formatDate(startingDate, 3) + " " + formatTime(startingDate);
                    let endingDate = new Date(data.endAt);
                    data.endingDate = formatDate(endingDate, 3) + " " + formatTime(endingDate);
                    data.key = doc.id;
                    cat.push(data);
                }
            });
            cat.sort((a, b) => a.index - b.index);
            observer.next(cat);
        });
    });
}

export function getSubscription(id) {
    return new Observable((observer) => {
        subscriptionRef.doc(id).get().then((doc) => {
            let data = doc.data();
            data.key = doc.id;
            let startingDate = new Date(data.startAt);
            data.startingDate = formatDate(startingDate, 3) + " " + formatTime(startingDate);
            let endingDate = new Date(data.endAt);
            data.endingDate = formatDate(endingDate, 3) + " " + formatTime(endingDate);
            observer.next(data);
        });
    });
}

export function saveSubscription(data) {
    data.createdOn = new Date();
    data.modifiedOn = new Date();
    return new Observable((observer) => {
        subscriptionRef.add(data).then((doc) => {
            observer.next({
                key: doc.id,
            });
        });
    });
};