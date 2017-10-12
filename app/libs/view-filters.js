'use strict';

module.exports = {

    'secondsToTimeString': duration => {

        let sec_num = parseInt(duration, 10); // don't forget the second param
        let hours   = Math.floor(sec_num / 3600);
        let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        let seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (hours < 10) {
            hours = '0' + hours;
        }
        if (minutes < 10) {
            minutes = '0' + minutes;
        }
        if (seconds < 10) {
            seconds = '0' + seconds;
        }
        return hours + ':' + minutes + ':' + seconds;
    },

    'millisecondsToTimeString': duration => {

        let milliseconds = parseInt((duration % 1000) / 100)
            , seconds    = parseInt((duration / 1000) % 60)
            , minutes    = parseInt((duration / (1000 * 60)) % 60)
            , hours      = parseInt((duration / (1000 * 60 * 60)) % 24);

        hours   = (hours < 10) ? '0' + hours : hours;
        minutes = (minutes < 10) ? '0' + minutes : minutes;
        seconds = (seconds < 10) ? '0' + seconds : seconds;

        return hours + ':' + minutes + ':' + seconds + '.' + milliseconds;
    }
};