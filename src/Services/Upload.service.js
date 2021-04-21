import { Observable } from 'rxjs';
import firebase from './firebase';
const storageRef = firebase.storage().ref();

const BASE_PATH = '/uploads';
var FILE_NAME = '';
var FILE_PATH = '';
// from ==> competition or user upload
// type => small or large
export function uploadImage(image, from, type) {

    let date = new Date();
    let id = date.getTime().toString();
    FILE_NAME = (type ? type : '') + 'pic' + id + '.jpg';
    FILE_PATH = BASE_PATH + '/' + from + '/' + FILE_NAME;

    let uploadTask = storageRef.child(FILE_PATH).putString(image, 'data_url');

    return new Observable((observer) => {
        uploadTask.on('state_changed',
            (snapshot) => {
                let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                    case firebase.storage.TaskState.PAUSED: // or 'paused'
                        console.log('Upload is paused');
                        break;
                    case firebase.storage.TaskState.RUNNING: // or 'running'
                        console.log('Upload is running');
                        break;
                }
            }, (error) => {
                console.log(error);
            }, () => {
                uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                    observer.next(downloadURL);
                });
            });
    });
}

export function deleteImage(imageUrl) {
    storageRef.refFromURL(imageUrl).delete();
}

export function uploadVideo(video, uploadPath, pathId, view) {

    let date = new Date();
    let id = date.getTime().toString();
    FILE_NAME = 'user' + id + '.mp4';
    FILE_PATH = BASE_PATH + '/video/' + FILE_NAME;
    if (uploadPath && pathId && view) {
        if (view === 'thumbnailImage') {
            FILE_NAME = view + '_' + id + '.jpg';
        } else {
            FILE_NAME = view + '_' + id + '.mp4';
        }
        FILE_PATH = BASE_PATH + '/' + uploadPath + '/' + pathId + '/' + FILE_NAME;
    }
    console.log("FILE_PATH in Upload service is : ", FILE_PATH)

    let uploadTask = storageRef.child(FILE_PATH).putString(video, 'data_url');

    return new Observable((observer) => {
        uploadTask.on('state_changed',
            (snapshot) => {
                let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                // console.log('Upload is ' + progress + '% done');
                observer.next({ donePercentage: progress });
                switch (snapshot.state) {
                    case firebase.storage.TaskState.PAUSED: // or 'paused'
                        console.log('Upload is paused');
                        break;
                    case firebase.storage.TaskState.RUNNING: // or 'running'
                        console.log('Upload is running');
                        break;
                }
            }, (error) => {
                console.log(error);
            }, () => {
                uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                    observer.next({ downloadURL });
                });
            });
    });
}

export function deleteVideo(videoUrl) {
    storageRef.refFromURL(videoUrl).delete();
}
