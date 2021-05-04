import { Observable } from 'rxjs';
import { formatDate, formatTime } from "./Utils";
import db from '../Database';

const competitionRef = db.collection('competitions');

export function getCompetitionsList() {
    return new Observable((observer) => {
        competitionRef.onSnapshot((querySnapshot) => {
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

export function getActiveCompetitionsList() {
    return new Observable((observer) => {
        competitionRef.onSnapshot((querySnapshot) => {
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

export function getCompetition(id) {
    return new Observable((observer) => {
        competitionRef.doc(id).get().then((doc) => {
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

export function updateCategory(id, data) {
    data.createdOn = data.createdOn || new Date();
    data.modifiedOn = new Date();
    return new Observable((observer) => {
        competitionRef.doc(id).set(data).then(() => {
            observer.next();
        });
    });
}

export function deleteCategory(id) {
    return new Observable((observer) => {
        competitionRef.doc(id).delete().then(() => {
            observer.next();
        });
    });
}

export function toggleActivateDeactivateCompetition(data, action) {
    data.createdOn = data.createdOn || new Date();
    data.modifiedOn = new Date();
    return new Observable((observer) => {
        competitionRef.doc(data.id).update({ 'active': action }).then(() => {
            observer.next();
        });
    });
}

export function deleteCompetitionByKey(data) {
    return new Observable((observer) => {
        competitionRef.doc(data.id).delete().then(() => {
            console.log("Competition successfully deleted!");
            observer.next({deleted: true});
        }).catch((error) => {
            console.error("Error removing Competition: ", error);
            observer.next({deleted: false, error: error});
        });
        
    });
}
