require('dotenv').config();

const path = require('path');
const express = require('express');
const webpush = require('web-push');
const admin = require('firebase-admin');
const schedule = require('node-schedule');
const moment = require('moment-timezone');
const methods = require('./helperFunctions.js');

// Global variables
var datePattern = /\d{4}-\d{2}-\d{2}/;
var timePattern = /\d{1,2}:\d{1,2}:\d{1,2}/;
var dateTime = moment.tz("Asia/Kolkata").format();
const subscription = JSON.parse(process.env.ANDROID_SUBCRIPTION_URL);

// Initializing firebase
admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.SERVER_KEY))
})

// Applying settings of web-push
const vapidKeys = webpush.generateVAPIDKeys();
// webpush.setVapidDetails(
//     'mailto:codebreakers1306@gmail.com',
//     vapidKeys.publicKey,
//     vapidKeys.privateKey
// );

webpush.setVapidDetails(
    "mailto:tanmaychavan1306@gmail.com",
    process.env.PUBLIC_KEY,
    process.env.PRIVATE_KEY    
)


// Initializing instance of firestore and express app
const db = admin.firestore();
const app = express();

// Parsing incoming requests with json payloads
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        hello: "Hey there! Handsome."
    });
});

// Routes to handle incoming requests
app.get('/sendLogFile', (req, res) => {
    console.log('Sending log file...')
    res.sendFile(path.resolve(__dirname, "./log.txt"))
})

app.get('/notify', (req, res) => {
    let payload = JSON.stringify({title: `My Meanings from server-8:15`})
    webpush.sendNotification(subscription, payload)
    .then(res => {
        methods.log(`Notification sent from server on-8:15`)
        res.json({
            notified: 'Success'
        })
    })
    .catch(err => {
        methods.log(err)
        res.json({
            notified: 'Failed',
            error: err
        })
    })
})

app.listen(process.env.PORT, () => {
    console.log('Listening to port ', process.env.PORT);
})

/*

// Schedule operation for morning(12:00) notification
schedule.scheduleJob("25 23 * * *", () => {
    let payload = JSON.stringify({title: `My Meanings for- 11:10`})
    webpush.sendNotification(subscription, payload)
    .then(res => methods.log(`Notification sent on 01:30`))
    .catch(err => methods.log(err))
})

// Schedule operation for evening(5:30) notification
schedule.scheduleJob("30 23 * * *", () => {
    let payload = JSON.stringify({title: `Notification successfull!- 11:10:30`})
    webpush.sendNotification(subscription, payload)
    .then(res => methods.log(`Notification sent on 02:05`))
    .catch(err => methods.log(err))
})

// Schedule operation for night(9:30) notification
schedule.scheduleJob("40 23 * * *", () => {
    let payload = JSON.stringify({title: `My Meanings for- 11:12 `})
    webpush.sendNotification(subscription, payload)
    .then(res => methods.log(`Notification sent on 02:14`))
    .catch(err => methods.log(err))
})

// Schedule operation for night(9:30) notification
schedule.scheduleJob("57 23 * * *", () => {
    let payload = JSON.stringify({title: `My Meanings for - 11:30`})
    webpush.sendNotification(subscription, payload)
    .then(res => methods.log(`Notification sent on 02:15`))
    .catch(err => methods.log(err))
})

*/

// Logging and sending notification of first set-up time to console and in file.
let setupMsg = `Set-up completed on time ${moment.tz('Asia/Kolkata').format().match(timePattern)}`
webpush.sendNotification(subscription, JSON.stringify({title: setupMsg}))
.then(res => methods.log(`Set-up completed on date ${moment.tz('Asia/Kolkata').format().match(datePattern)} and on time ${moment.tz('Asia/Kolkata').format().match(timePattern)}`))
.catch(err => methods.log(err))

