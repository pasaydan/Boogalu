// import * as firebase from 'firebase/app';
import firebase from 'firebase'
import "firebase/auth";

const config = {
    apiKey: "AIzaSyDhsucdNp0aQKuvNHF6acthtUNxrOU54Tc",
    authDomain: "boogalusite.firebaseapp.com",
    projectId: "boogalusite",
    storageBucket: "boogalusite.appspot.com",
    messagingSenderId: "417866547364",
    appId: "1:417866547364:web:ddbf4055533ba61f3ee631",
    measurementId: "G-0XCNDFZJ1K"
};
firebase.initializeApp(config);
export default firebase;
// // export const auth = firebase.auth();

// const googleProvider = new firebase.auth.GoogleAuthProvider()

// export const signInWithGoogle = () => {
//   auth.signInWithPopup(googleProvider).then((res) => {
//     console.log(res.user)
//   }).catch((error) => {
//     console.log(error.message)
//   })
// }

// export const logOut = () => {
//     auth.signOut().then(()=> {
//       console.log('logged out')
//     }).catch((error) => {
//       console.log(error.message)
//     })
//   }