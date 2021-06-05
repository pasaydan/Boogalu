import { Observable } from 'rxjs';
import axios from 'axios';
const { REACT_APP_API_URL } = process.env;
const header = new Headers();
header.append('Access-Control-Allow-Origin', '*');
header.append('Content-Type', 'application/json');
header.append('mode', 'cors');

export function sendEmail(data) {
    const EMAIL_API_URL = REACT_APP_API_URL + '/sendEmail';
    return new Observable((observer) => {
        axios.post(EMAIL_API_URL, data, header).then((response) => {
            observer.next(response);
        });
    });
}