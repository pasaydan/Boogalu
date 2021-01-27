import { Observable } from 'rxjs';
import { formatDate, formatTime } from "./Utils";
import db from '../Database';

const competitionRef = db.collection('enrolledCompetitions');

export function getCompetitionsList() {
    return new Observable((observer) => {
        competitionRef.onSnapshot((querySnapshot) => {
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

export function getActiveCompetitionsList() {
    return new Observable((observer) => {
        competitionRef.onSnapshot((querySnapshot) => {
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

export function getCompetition(id) {
    return new Observable((observer) => {
        competitionRef.doc(id).get().then((doc) => {
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

export function getCompetitionByUserId(userId) {
    return new Observable((observer) => {
        competitionRef.where('userId', '==', userId).get().then((querySnapshot) => {
            let videos = []
            querySnapshot.forEach(function (doc) {
                let data = doc.data();
                data.key = doc.id;
                videos.push(data);
            })
            observer.next(videos);
        })
    })
}

export function saveCompetition(data) {
    data.createdOn = new Date();
    data.modifiedOn = new Date();
    return new Observable((observer) => {
        competitionRef.add(data).then((doc) => {
            observer.next({
                key: doc.id,
            });
        });
    });
};