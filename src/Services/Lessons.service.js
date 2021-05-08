import { Observable } from 'rxjs';
import db from '../Database';
import { formatDate, formatTime, timeStampToNewDate} from "./Utils";

const lessonsVideosRef = db.collection('lessons');


// export function getUploadedVideosList() {
//     return new Observable((observer) => {
//         uploadedVideosRef.onSnapshot((querySnapshot) => {
//             let videos = [];
//             querySnapshot.forEach((doc) => {
//                 let data = doc.data();
//                 data.key = doc.id;
//                 let startingDate = new Date(data.createdOn);
//                 data.uploadedTime = formatDate(startingDate, 3) + " " + formatTime(startingDate);
//                 videos.push(data);
//             });
//             videos.sort((a, b) => a.index - b.index);
//             observer.next(videos);
//         });
//     });
// }

export function saveLesson(data) {
    data.createdOn = new Date();
    data.modifiedOn = new Date();
    data.id = data.name.toLowerCase();
    return new Observable((observer) => {
        lessonsVideosRef.add(data).then((doc) => {
            observer.next({
                key: doc.id,
            });
        });
    });
}

export function getLessonByName(name) {
    return new Observable((observer) => {
        lessonsVideosRef.where('id', '==', name.toLowerCase()).get().then((querySnapshot) => {
            let lesson = {}
            querySnapshot.forEach(function (doc) {
                let data = doc.data();
                console.log(" getLessonByName data is ", data);
                data.key = doc.id;
                lesson = data;
            })
            observer.next(lesson);
        })
    })
}

export function getLessonByPlanType(filter) {
    return new Observable((observer) => {
        lessonsVideosRef.where('accessbility', '==', filter.toLowerCase()).get().then((querySnapshot) => {
            let lessons = [];
            querySnapshot.forEach(function (doc) {
                let data = doc.data();
                data.key = doc.id;
                lessons.push(data);
            })
            observer.next(lessons);
        })
    })
}

export function getAllLessons() {
    return new Observable((observer) => {
        lessonsVideosRef.onSnapshot((querySnapshot) => {
            let lessons = [];
            querySnapshot.forEach((doc) => {
                let data = doc.data();
                data.key = doc.id;
                // let startingDate = new Date(data.createdOn.seconds);
                data.uploadedTime = formatDate(timeStampToNewDate(data.createdOn), 3);
                lessons.push(data);
            });
            observer.next(lessons);
        });
    });
}

// export function updateVideo(id, data) {
//     data.createdOn = data.createdOn || new Date();
//     data.modifiedOn = new Date();
//     return new Observable((observer) => {
//         uploadedVideosRef.doc(id).set(data).then(() => {
//             observer.next();
//         });
//     });
// }

// export function updateVideoLikes(id, data) {
//     data.createdOn = data.createdOn || new Date();
//     data.modifiedOn = new Date();
//     return new Observable((observer) => {
//         uploadedVideosRef.doc(`/${id}`).update({ 'likes': data.likes }).then(() => {
//             observer.next();
//         });
//     });
// }

// export function updateVideoComments(id, data) {
//     data.createdOn = data.createdOn || new Date();
//     data.modifiedOn = new Date();
//     return new Observable((observer) => {
//         uploadedVideosRef.doc(`/${id}`).update({ 'comments': data.comments }).then(() => {
//             observer.next();
//         });
//     });
// }
