import { EMAIL_SENDING_STAGING_API_URL } from "../Constants";
import { Observable } from 'rxjs';
import axios from 'axios';

const header = new Headers();
header.append('Access-Control-Allow-Origin', '*');
header.append('Content-Type', 'application/json');
header.append('mode', 'cors');

export function sendEmail(data) {
    const EMAIL_API_URL = EMAIL_SENDING_STAGING_API_URL;
    return new Observable((observer) => {
        axios.post(EMAIL_API_URL, data, header).then((response) => {
            observer.next(response);
        });
    });
}