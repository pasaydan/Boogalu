export function formatTime(time) {
    time = new Date(time);
    const hour24 = time.getHours();
    let minutes = (time.getMinutes() === 0) ? '00' : time.getMinutes();
    minutes = (minutes > 0 && minutes < 10) ? `0${minutes}` : minutes;
    const ampm = (hour24 >= 12) ? 'PM' : 'AM';
    let hour = hour24 % 12 || 12;
    //append zero is hour is single digit
    if (hour < 10) {
        hour = `0${hour}`;
    }
    return `${hour}:${minutes} ${ampm}`;
};

export function formatDate(date, status) {
    date = new Date(date);
    var monthNames = [
        "Jan", "Feb", "Mar",
        "Apr", "May", "Jun", "Jul",
        "Aug", "Sept", "Oct",
        "Nov", "Dec"
    ];
    let day = date.getDate();
    let monthIndex = date.getMonth();
    let year = date.getFullYear();
    if (status === 3) return day + 'th ' + monthNames[monthIndex] + " " + year;
    if (status === 2) return day + 'th ' + monthNames[monthIndex];
    if (status === 1) return day;
};

export function timeStampToNewDate(timeStamp) {
    return new Date(timeStamp.seconds * 1000 + Math.round(timeStamp.nanoseconds / 1000000));
}

export function toBase64(file) {
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}