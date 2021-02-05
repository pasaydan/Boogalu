import { Observable } from 'rxjs';
import db from '../Database';

const enquiryRef = db.collection('enquiries');

export const submitEnquiry = (data) => {
    data.createdOn = new Date();
    data.modifiedOn = new Date();
    data.status = 'Pending';
    return new Observable((observer) => {
        enquiryRef.add(data).then((doc) => {
            observer.next({
                key: doc.id,
            });
        });
    });
}