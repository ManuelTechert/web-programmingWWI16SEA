const Joi = require('joi');
const _ = require('lodash');

const Guestbook = function () {
    var entries = [],
        getInitials = function (name) {
            return name.split(' ').reduce(function (accu, name) {
                return accu + name.charAt(0);
            }, '');
        },
        randomColor = function () {
          var hex = Math.floor(Math.random() * 0xFFFFFF);
          return "#" + ("000000" + hex.toString(16)).slice(-6);
        },
        schema = Joi.object().keys({
            name: Joi.string().min(3).max(40).required(),
            email: Joi.string().email().empty(''),
            date: Joi.string().regex(/^(\d{1,2}\.){2}\d{4} (\d{2}:\d{2})?$/).empty(''),
            rating: Joi.number().integer().min(1).max(5).required(),
            message: Joi.string().min(15).required()
        });

    this.addEntry = function (data) {
        const entry = Joi.validate(data || {}, schema, { abortEarly: false }),
            errors = _((entry.error || {}).details)
                .keyBy('path')
                .mapValues('message')
                .value(),
            d = new Date(),
            defaults = {
                initials: getInitials(entry.value.name),
                backgroundColor: randomColor(),
                date: ("00" + d.getDate().toString()).slice(-2) + '.'
                    + ("00" + (d.getMonth() + 1).toString()).slice(-2) + '.'
                    + d.getFullYear() + ' '
                    + ("00" + d.getHours().toString()).slice(-2) + ':'
                    + ("00" + d.getMinutes().toString()).slice(-2)
            };

        if (_.isEmpty(errors)) {
            entries.unshift(Object.assign({}, defaults, entry.value));
        }

        return [entry.value, errors];
    };

    this.loadAll = function () {
        return entries;
    };
};

const guestbook = new Guestbook();

guestbook.addEntry({
    name: 'Doreen Ackerman',
    email: 'DoreenAckerman@einrot.com',
    date: '19.09.2017 18:00',
    rating: 3,
    message: 'Essen war gut aber viel zu lange Wartezeiten'
});

guestbook.addEntry({
    name: 'Steffen Hahn',
    email: 's.hahn@web.de',
    date: '21.09.2017 12:30',
    rating: 5,
    message: 'Alles toll! Essen war lecker!'
});

guestbook.addEntry({
    name: 'Robert Fürst',
    email: 'fuerst3999@t-online.de',
    date: '23.09.2017 21:20',
    rating: 4,
    message: 'Fast perfekt. Aber Austern waren aus!'
});

module.exports = guestbook;
