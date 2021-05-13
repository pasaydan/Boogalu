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
                data.startingDate = formatDate(startingDate, 3);
                data.startingTime = formatTime(startingDate);
                let endingDate = new Date(data.endAt);
                data.endingDate = formatDate(endingDate, 3);
                data.endingTime = formatTime(endingDate);
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
            querySnapshot.forEach((doc) => {
                let data = doc.data();
                inactiveSubscriptionIfDateExpired(data);
            });
        })
        subscriptionRef.onSnapshot((querySnapshot) => {
            let cat = [];
            querySnapshot.forEach((doc) => {
                let data = doc.data();
                if (data.active) {
                    let startingDate = new Date(data.startAt);
                    data.startingDate = formatDate(startingDate, 3);
                    data.startingTime = formatTime(startingDate);
                    let endingDate = new Date(data.endAt);
                    data.endingDate = formatDate(endingDate, 3);
                    data.endingTime = formatTime(endingDate);
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
            data.startingDate = formatDate(startingDate, 3);
            data.startingTime = formatTime(startingDate);
            let endingDate = new Date(data.endAt);
            data.endingDate = formatDate(endingDate, 3);
            data.endingTime = formatTime(endingDate);
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

export function toggleActivateDeactivateSubscription(data, action) {
    data.createdOn = data.createdOn || new Date();
    data.modifiedOn = new Date();
    return new Observable((observer) => {
        subscriptionRef.doc(data.id).update({ 'active': action }).then(() => {
            observer.next();
        });
    });
}

export function inactiveSubscriptionIfDateExpired(data) {
    data.createdOn = data.createdOn || new Date();
    data.modifiedOn = new Date();
    const getEndDate = new Date(data.endAt);
    if (data.modifiedOn > getEndDate) {
        return new Observable((observer) => {
            subscriptionRef.doc(data.id).update({ 'active': false }).then(() => {
                observer.next();
            });
        });
    }
}

export function deleteSubscriptionByKey(data) {
    return new Observable((observer) => {
        subscriptionRef.doc(data.id).delete().then(() => {
            console.log("Subscription successfully deleted!");
            observer.next({deleted: true});
        }).catch((error) => {
            console.error("Error removing Subscription: ", error);
            observer.next({deleted: false, error: error});
        });
        
    });
}