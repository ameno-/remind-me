var express = require('express');
var router = express.Router();
var momentTimeZone = require('moment-timezone');
var moment = require('moment');
var Appointment = require('../models/appointment');


var getTimeZones = function() {
    return momentTimeZone.tz.names();
}

function saveRepeats(appointment, repeatCount) {



}

var saveAppointments = function(appointment) {

    if (appointment.repeat > 0) {

        console.log("saving many");

        appointment.save();

        switch (appointment.repeat) {
            case 365:
                //generate unique repeatId

                for (var index = 0; index < 365; index++) {
                    new Appointment({ name: appointment.name, phoneNumber: appointment.phoneNumber, notification: appointment.notification, timeZone: appointment.timeZone, time: moment(appointment.time).add(index, 'days'), repeat: appointment.repeat, repeatId: 1 }).save();
                }

                console.log("Saved repeat appointment: EVERY-DAY");
                break;

            case 52:
                for (var index = 0; index < 52; index++) {
                    new Appointment({ name: appointment.name, phoneNumber: appointment.phoneNumber, notification: appointment.notification, timeZone: appointment.timeZone, time: moment(appointment.time).add(index, 'week'), repeat: appointment.repeat, repeatId: 1 }).save();
                }

                console.log("Saved repeat appointment: EVERY-WEEK");
                break;
            case 26:
                for (var index = 0; index < 26; index++) {
                    new Appointment({ name: appointment.name, phoneNumber: appointment.phoneNumber, notification: appointment.notification, timeZone: appointment.timeZone, time: moment(appointment.time).add(++index, 'week'), repeat: appointment.repeat, repeatId: 1 }).save();
                }

                console.log("Saved repeat appointment: EVERY-OTHER-WEEK");
                break;
            case 12:
                for (var index = 0; index < 12; index++) {
                    new Appointment({ name: appointment.name, phoneNumber: appointment.phoneNumber, notification: appointment.notification, timeZone: appointment.timeZone, time: moment(appointment.time).add(index, 'month'), repeat: appointment.repeat, repeatId: 1 }).save();
                }

                console.log("Saved repeat appointment: EVERY-MONTH");
                break;
            case 1:

                new Appointment({ name: appointment.name, phoneNumber: appointment.phoneNumber, notification: appointment.notification, timeZone: appointment.timeZone, time: moment(appointment.time).add(index, 'year'), repeat: appointment.repeat, repeatId: 1 }).save();

                console.log("Saved repeat appointment: EVERY-YEAR");
                break;
        }

    } else {
        appointment.save();
        console.log("appointment saved");
    }
}

// GET: /appointments
router.get('/', function(req, res, next) {
    Appointment.find()
        .then(function(appointments) {
            res.render('appointments/index', { appointments: appointments });
        });
});

// GET: /appointments/create
router.get('/create', function(req, res, next) {
    res.render('appointments/create', { timeZones: getTimeZones(), appointment: new Appointment({ name: "", phoneNumber: "", notification: '', timeZone: "", time: '', repeat: '' }) });
});

// POST: /appointments
router.post('/', function(req, res, next) {

    console.log(req.body);

    var name = req.body.name;
    var phoneNumber = req.body.phoneNumber;
    var notification = req.body.notification;
    var timeZone = req.body.timeZone;
    var time = moment(req.body.time, "MM-DD-YYYY hh:mma");
    var repeat = req.body.repeat;
    var repeatId = Math.floor((Math.random() * 1000) + 1);

    var appointment = new Appointment({ name: name, phoneNumber: phoneNumber, notification: notification, timeZone: timeZone, time: time, repeat: repeat, repeatId: 1 });

    Promise.resolve(saveAppointments(appointment))
        .then(function() {
            res.redirect('/')
        });
});

// GET: /appointments/:id/edit
router.get('/:id/edit', function(req, res, next) {
    var id = req.params.id;
    Appointment.findOne({ _id: id })
        .then(function(appointment) {
            res.render('appointments/edit', { timeZones: getTimeZones(), appointment: appointment });
        });
});

// POST: /appointments/:id/edit
router.post('/:id/edit', function(req, res, next) {
    var id = req.params.id;
    var name = req.body.name;
    var phoneNumber = req.body.phoneNumber;
    var notification = req.body.notification;
    var timeZone = req.body.timeZone;
    var time = moment(req.body.time, "MM-DD-YYYY hh:mma");
    var repeat = req.body.repeat;

    Appointment.findOne({ _id: id })
        .then(function(appointment) {
            appointment.name = name;
            appointment.phoneNumber = phoneNumber;
            appointment.notification = notification;
            appointment.timeZone = timeZone;
            appointment.time = time;
            appointment.repeat = repeat;

            appointment.save()
                .then(function() {
                    res.redirect('/');
                });
        });
});

// POST: /appointments/:id/delete
router.post('/:id/delete', function(req, res, next) {
    var id = req.params.id;

    if (id === "all") {

        Appointment.remove({})
            .then(function() {
                res.redirect('/');
            });
    } else {

        Appointment.remove({ _id: id })
            .then(function() {
                res.redirect('/');
            });
    }

});

module.exports = router;