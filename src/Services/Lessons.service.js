import { Observable } from 'rxjs';
import db from '../Database';
import { formatDate, timeStampToNewDate} from "./Utils";

const lessonsVideosRef = db.collection('lessons');

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

export function getLessonByPlanTypeOnlyPreview(filter) {
    return new Observable((observer) => {
        lessonsVideosRef.where('accessbility', '==', filter.toLowerCase()).get().then((querySnapshot) => {
            let lessons = [];
            querySnapshot.forEach(function (doc) {
                let data = doc.data();
                let previewKeyOnly = data.videoList.preview;
                data.videoList = {};
                data.videoList['preview'] = previewKeyOnly;
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
                data.uploadedTime = formatDate(timeStampToNewDate(data.createdOn), 3);
                lessons.push(data);
            });
            observer.next(lessons);
        });
    });
}

export function deleteLessons(lessonKey) {
    return new Observable((observer) => {
        lessonsVideosRef.doc(lessonKey).delete().then(() => {
            console.log("Document successfully deleted!");
            observer.next({deleted: true});
        }).catch((error) => {
            console.error("Error removing document: ", error);
            observer.next({deleted: false, error: error});
        });
    });
}

export function getLessonsWithOnlyPreview() {
    return new Observable((observer) => {
        lessonsVideosRef.onSnapshot((querySnapshot) => {
            let lessons = [];
            querySnapshot.forEach((doc) => {
                let data = doc.data();
                let previewKeyOnly = data.videoList.preview;
                data.key = doc.id;
                data.videoList = {};
                data.videoList['preview'] = previewKeyOnly;
                data.uploadedTime = formatDate(timeStampToNewDate(data.createdOn), 3);
                lessons.push(data);
            });
            observer.next(lessons);
        });
    });
}

export function updateLessonPlayTime(id, playedTimeData) {
    return new Observable((observer) => {
        lessonsVideosRef.doc(id).get().then((doc) => {
            let data = doc.data();
            if (data && !data.lessonPlayedTimes) {
                data = {...data, 'lessonPlayedTimes': [playedTimeData]}
            } else {
                if (data.lessonPlayedTimes.length) {
                    data.lessonPlayedTimes.forEach( item => {
                        if (item.userKey === playedTimeData.userKey) {
                            item.playedTime = playedTimeData.playedTime
                        } else {
                            data.lessonPlayedTimes.push(playedTimeData);
                        }
                    });
                    
                    const setObj = new Set();
                    const uniqueResult = data.lessonPlayedTimes.reduce((acc, item) => {
                    if(!setObj.has(item.userKey)){
                        setObj.add(item.userKey, item);
                        acc.push(item);
                    }
                    return acc;
                    },[]);
                    data.lessonPlayedTimes = uniqueResult;
                }
            }

            lessonsVideosRef.doc(id).set(data).then(() => {
                observer.next();
            });
        });
    });
}

