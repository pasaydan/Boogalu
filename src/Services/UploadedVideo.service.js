import { Observable } from 'rxjs';
import db from '../Database';
import { formatDate, formatTime, timeStampToNewDate } from "./Utils";

const uploadedVideosRef = db.collection('uploadedVideos');

export function deleteUploadedVideoByVideoKey(videoKey) {
    return new Observable((observer) => {
        uploadedVideosRef.doc(videoKey).delete().then(() => {
            console.log("Document successfully deleted!");
            observer.next({deleted: true});
        }).catch((error) => {
            console.error("Error removing document: ", error);
            observer.next({deleted: false, error: error});
        });
    });
}

export function getUploadedVideosList() {
    return new Observable((observer) => {
        uploadedVideosRef.onSnapshot((querySnapshot) => {
            let videos = [];
            querySnapshot.forEach((doc) => {
                let data = doc.data();
                data.key = doc.id;
                let startingDate = new Date(data.createdOn);
                data.uploadedTime = formatDate(startingDate, 3) + " " + formatTime(startingDate);
                videos.push(data);
            });
            videos.sort((a, b) => a.index - b.index);
            observer.next(videos);
        });
    });
}

export function saveUploadedVideo(data) {
    data.createdOn = new Date();
    data.modifiedOn = new Date();
    return new Observable((observer) => {
        uploadedVideosRef.add(data).then((doc) => {
            observer.next({
                key: doc.id,
            });
        });
    });
}

export function getUploadedVideosByUserId(id) {
    return new Observable((observer) => {
        uploadedVideosRef.where('userId', '===', id).get().then((querySnapshot) => {
            let videos = []
            querySnapshot.forEach(function (doc) {
                let data = doc.data();
                data.key = doc.id;
                data.uploadedTime = formatDate(timeStampToNewDate(data.createdOn), 3);
                videos.push(data);
            })
            observer.next(videos);
        })
    })
}

export function updateVideo(id, data) {
    data.createdOn = data.createdOn || new Date();
    data.modifiedOn = new Date();
    return new Observable((observer) => {
        uploadedVideosRef.doc(id).set(data).then(() => {
            observer.next();
        });
    });
}

export function updateVideoLikes(id, data) {
    data.createdOn = data.createdOn || new Date();
    data.modifiedOn = new Date();
    return new Observable((observer) => {
        uploadedVideosRef.doc(`/${id}`).update({ 'likes': data.likes }).then(() => {
            observer.next();
        });
    });
}

export function updateVideoComments(id, data) {
    data.createdOn = data.createdOn || new Date();
    data.modifiedOn = new Date();
    return new Observable((observer) => {
        uploadedVideosRef.doc(`/${id}`).update({ 'comments': data.comments }).then(() => {
            observer.next();
        });
    });
}
