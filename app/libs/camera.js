'use strict';

const Core         = require('nodejs-lib');
const fs           = require('fs');
const os           = require('os');
const async        = require('async');
const path         = require('path');
const randomString = require('random-string');
const ffmpeg       = require('fluent-ffmpeg');
const swig         = require('swig');
const spawn        = require('child_process').spawn;

class Camera {

    /**
     * Class constructor
     *
     * @param options
     * @param options.cameraName {string} camera name
     * @param options.videoInput {string}
     * @param options.audioInput {string}
     * @param options.httpStreamingPort {number}
     * @param options.streamingResolution {string}
     * @param options.streamingVideoBitRate {number}
     * @param options.streamingVideoFps {number}
     * @param options.streamingAudioBitrate {number}
     * @param options.capturingResolution {string}
     * @param options.capturingVideoFps {number}
     * @param options.capturingAudioBitrate {number}
     */
    constructor(options) {

        if (!options.cameraName) throw new Error(`Camera::constructor: cameraName is required`);
        if (!options.videoInput) throw new Error(`Camera::constructor: videoInput is required`);
        if (!options.httpStreamingPort) throw new Error(`Camera::constructor: httpStreamingPort is required`);
        if (!options.streamingResolution) throw new Error(`Camera::constructor: streamingResolution is required`);
        if (!options.streamingVideoBitRate) throw new Error(`Camera::constructor: streamingVideoBitRate is required`);
        if (!options.streamingVideoFps) throw new Error(`Camera::constructor: streamingVideoFps is required`);

        if (!options.capturingResolution) throw new Error(`Camera::constructor: capturingResolution is required`);
        if (!options.capturingVideoFps) throw new Error(`Camera::constructor: capturingVideoFps is required`);

        if (options.audioInput) {
            if (!options.streamingAudioBitrate) throw new Error(`Camera::constructor: streamingAudioBitrate is required`);
            if (!options.capturingAudioBitrate) throw new Error(`Camera::constructor: capturingAudioBitrate is required`);
        }

        /**
         * Camera name
         *
         * @type {string}
         */
        this.cameraName = options.cameraName;

        /**
         * Video device
         *
         * @type {*|string}
         */
        this.videoInput = options.videoInput;

        /**
         * Audio device
         *
         * @type {*|string}
         */
        this.audioInput = options.audioInput;

        /**
         * FFmpeg bind port
         *
         * @type {*|number}
         */
        this.httpStreamingPort = options.httpStreamingPort;

        /**
         * Streaming resolution
         *
         * @type {*|string}
         */
        this.streamingResolution = options.streamingResolution;

        /**
         * Streaming video bitrate resolution
         *
         * @type {*|string}
         */
        this.streamingVideoBitRate = options.streamingVideoBitRate;

        /**
         * Streaming video FPS
         *
         * @type {*|string}
         */
        this.streamingVideoFps = options.streamingVideoFps;

        /**
         * Streaming audio bitrate
         *
         * @type {*|string}
         */
        this.streamingAudioBitrate = options.streamingAudioBitrate;

        /**
         * Capturing resolution
         *
         * @type {*|string}
         */
        this.capturingResolution = options.capturingResolution;

        /**
         * Capturing video FPS
         *
         * @type {*|string}
         */
        this.capturingVideoFps = options.capturingVideoFps;

        /**
         * Capturing audio bitrate
         *
         * @type {*|string}
         */
        this.capturingAudioBitrate = options.capturingAudioBitrate;

        /**
         * FFmpeg process (streaming)
         *
         * @type {null}
         */
        this.ffmpegStreamingProcess = null;

        /**
         * FFserver process (streaming)
         *
         * @type {null}
         */
        this.ffserverProcess = null;

        /**
         * FFmpeg process (capturing)
         *
         * @type {null}
         */
        this.ffmpegCapturingProcess = null;

        /**
         * Streaming token
         *
         * @type {null}
         */
        this.streamingToken = null;

        /**
         * Camera in streaming mode
         *
         * @type {boolean}
         */
        this.isStreaming = false;

        /**
         * Camera in capture mode
         *
         * @type {boolean}
         */
        this.isCapturing = false;

        /**
         * Record model
         *
         * @type {Function}
         */
        // this.recordModel = require('../models/record');
    }

    /**
     * Application logged getter
     *
     * @returns {*|exports|module.exports}
     */
    static get logger() {
        return Core.ApplicationFacade.instance.logger;
    }

    /**
     * Get FFserver config
     *
     * @returns {{ }}
     */
    get ffserverConfig() {

        return {
            httpPort: this.httpStreamingPort,
            httpBindAddress: '0.0.0.0',
            maxHttpConnections: 500,
            maxClients: 10,
            maxBandwidth: 50000,

            fileMaxSize: '10M',

            videoFrameRate: this.streamingVideoFps,
            videoBitRate: this.streamingVideoBitRate,
            videoSize: this.streamingResolution,

            audioInput: this.audioInput,
            audioBitRate: this.streamingAudioBitrate
        }
    }

    /**
     * Start streaming
     *
     * @param callback
     * @returns {*}
     */
    startStream(callback) {

        if (typeof callback !== 'function') callback = () => {
        };

        if (this.isStreaming) {

            // Camera is already in a streaming mode
            return callback(null, {streamUrl: this.streamUrl});
        }

        if (this.isCapturing) {

            return callback(new Error(`Camera::startStream: camera ${this.cameraName} is in capture mode. Please, stop capture first.`));
        }

        this.doStartStream(callback);
    }

    /**
     * Start streaming processes
     *
     * @param callback
     */
    doStartStream(callback) {

        this.streamingToken = randomString({
            length: 50,
            numeric: true,
            letters: true,
            special: false
        });

        this.streamName = `live-stream-${this.streamingToken}.flv`;
        this.streamUrl  = `http://${Core.ApplicationFacade.instance.config.env.STREAMING_HOST}:${this.httpStreamingPort}/${this.streamName}`;

        async.series([callback => {

            this.startFSServerProcess(callback)

        }, callback => {

            this.startFFmpegStreamingProcess(callback)

        }], err => {
            if (err) {
                Camera.logger.error(`Camera::doStartStream: ${err.stack}`);
                return callback(err);
            }

            this.isStreaming = true;

            let data = {streamUrl: this.streamUrl};

            Camera.logger.info(data);

            callback(null, data);

            setTimeout(() => {

                // Automatically stop stream after 15 min from start
                Camera.logger.debug(`Camera::doStartStream: Automatically stop stream for camera: ${this.cameraName}`);
                this.stopStream();

            }, 1000 * 60 * 15);
        });
    }

    /**
     * Start FFserver process
     *
     * @param callback
     */
    startFSServerProcess(callback) {

        let callbackCalled = false;

        let ffserverConfigFilePath = path.resolve(os.tmpdir(), `${this.cameraName}-ffserver.conf`);

        let data = {
            ffserver: this.ffserverConfig,
            cameraName: this.cameraName,
            streamName: this.streamName
        };

        fs.writeFileSync(ffserverConfigFilePath, swig.renderFile(path.resolve(__dirname, '..', '..', 'config/ffserver.swig'), data));

        this.ffserverProcess = spawn('/home/pi/mining/bin/ffserver', ['-f', ffserverConfigFilePath]);

        this.ffserverProcess.stdout.on('data', data => {
            Camera.logger.info(`FFserver::stdout: ${data}`);
        });

        this.ffserverProcess.stderr.on('data', data => {
            Camera.logger.info(`FFserver::stderr: ${data}`);

            if (!callbackCalled && data.indexOf('configuration') > -1) {

                // fs.unlink(ffserverConfigFilePath, err => {
                //     if (err) Camera.logger.error(`Camera::startFSServer: ${err}`);
                // });

                callbackCalled = true;

                setTimeout(() => {
                    callback();
                }, 2000);
            }
        });

        this.ffserverProcess.on('close', code => {

            if (code === null) return Camera.logger.info(`Camera::startFSServer: exited with code null (fix me)`);

            this.ffserverProcess = null;

            Camera.logger.error(`Camera::startFSServer: FFserver process exited unexpectedly with code ${code}`);

            this.doStopStream();
        });
    }

    /**
     * Start FFmpeg streaming process
     *
     * @param callback
     */
    startFFmpegStreamingProcess(callback) {

        let callbackCalled = false;

        // Ex: ffmpeg -f v4l2 -s 640x480 -r 15 -i /dev/video0 -thread_queue_size 1024 -f alsa -ac 1 -i plughw:1,0 http://localhost:8090/feed1.ffm

        let options = ['-f', 'v4l2',
            '-s', this.streamingResolution,
            '-r', this.streamingVideoFps,
            '-i', this.videoInput];

        if (this.audioInput) {
            options.push('-f');
            options.push('alsa');
            options.push('-thread_queue_size');
            options.push('1024');
            options.push('-ac');
            options.push('1');
            options.push('-i');
            options.push(this.audioInput);
        }

        options.push('-q:v');
        options.push('1');

        options.push(`http://localhost:${this.httpStreamingPort}/${this.cameraName}-feed.ffm`);

        Camera.logger.info(`Camera::startFFmpegStreamingProcess: ffmpeg options: ${options.join(' ')}`);

        this.ffmpegStreamingProcess = spawn('/home/pi/mining/bin/ffmpeg', options);

        this.ffmpegStreamingProcess.stdout.on('data', data => {
            Camera.logger.info(`FFmpeg::stdout: ${data}`);
        });

        this.ffmpegStreamingProcess.stderr.on('data', data => {
            Camera.logger.info(`FFmpeg::stderr: ${data}`);

            if (!callbackCalled && data.indexOf('Press [q] to stop') > -1) {

                callbackCalled = true;

                callback();
            }
        });

        this.ffmpegStreamingProcess.on('close', code => {

            this.ffmpegStreamingProcess = null;

            Camera.logger.error(`Camera::startFFmpegStreamingProcess: FFmpeg process exited unexpectedly with code ${code}`);

            this.doStopStream();
        });
    }

    /**
     * Stop streaming
     *
     * @param callback
     * @returns {*}
     */
    stopStream(callback) {

        if (typeof callback !== 'function') callback = () => {
        };

        if (!this.isStreaming) {

            // Stream is inactive
            return callback();
        }

        this.doStopStream(callback);
    }

    /**
     * Do stop stream
     *
     * @param callback
     */
    doStopStream(callback) {

        if (typeof callback !== 'function') callback = () => {
        };

        async.series([callback => {

            /**
             * Shut down FFmpeg
             */
            if (this.ffmpegStreamingProcess) {

                this.ffmpegStreamingProcess.removeAllListeners('close');

                this.ffmpegStreamingProcess.once('close', () => {

                    callback();
                });

                this.ffmpegStreamingProcess.kill();

            } else {
                callback();
            }

        }, callback => {

            /**
             * Shut down FFserver
             */
            if (this.ffserverProcess) {

                this.ffserverProcess.removeAllListeners('close');

                this.ffserverProcess.once('close', () => {

                    callback();
                });

                this.ffserverProcess.kill();

            } else {
                callback();
            }

        }], err => {
            if (err) {
                Camera.logger.debug(`Camera::doStopStream: ${err.stack}`);
                return callback(err);
            }

            this.ffserverProcess        = null;
            this.ffmpegStreamingProcess = null;

            this.isStreaming    = false;
            this.streamingToken = null;

            callback();
        });
    }

    // /**
    //  * Start video capturing
    //  *
    //  * @param [callback]
    //  */
    // startCapture(callback) {
    //
    //     if (typeof callback !== 'function') callback = () => {
    //     };
    //
    //     async.series([callback => {
    //
    //         if (this.isStreaming) {
    //
    //             // Stop streaming
    //             this.doStopStream(callback);
    //
    //         } else if (this.isCapturing) {
    //
    //             // Stop previous capture
    //             this.stopCapture(callback);
    //
    //         } else {
    //             callback();
    //         }
    //
    //     }, callback => {
    //
    //         this.startFFmpegCapturingProcess(callback);
    //
    //     }], err => {
    //         if (err) {
    //             Camera.logger.debug(`Camera::startCapture: ${err.stack}`);
    //             return callback(err);
    //         }
    //
    //         this.isCapturing = true;
    //
    //         let data = {capturingPath: this.capturingPath, httpUrl: this.httpUrl};
    //
    //         this.emit('capture-started');
    //
    //         callback(null, data);
    //     });
    // }
    //
    // /**
    //  * Start FFmpeg capturing process
    //  *
    //  * @param callback
    //  */
    // startFFmpegCapturingProcess(callback) {
    //
    //     let callbackCalled = false;
    //
    //     let randomSuffix = randomString({
    //         length: 50,
    //         numeric: true,
    //         letters: true,
    //         special: false
    //     });
    //
    //     this.ftpPath       = `/pi-ftp/${this.cameraName}-video-${randomSuffix}.mp4`;
    //     this.httpUrl       = `http://185810.selcdn.ru${this.ftpPath}`; // TODO: More to conf
    //     this.capturingPath = `ftp://${Core.ApplicationFacade.instance.config.env.FTP_USER}` +
    //         `:${Core.ApplicationFacade.instance.config.env.FTP_PASSWORD}` +
    //         `@${Core.ApplicationFacade.instance.config.env.FTP_HOST}` +
    //         `:${Core.ApplicationFacade.instance.config.env.FTP_PORT}` +
    //         `${this.ftpPath}`;
    //
    //     // Ex: ffmpeg -f v4l2 -s 640x480 -r 15 -i /dev/video0 -q:v 1 -f alsa -ac 1 -i plughw:1,0 out.avi
    //     // http://askubuntu.com/questions/352920/fastest-way-to-convert-videos-batch-or-single
    //
    //     // Ex: ffmpeg -thread_queue_size 512 -f alsa -i plughw:1,0 -c:a aac \
    //     // -f v4l2 -i /dev/video0 -s 640x480 -r 15 -c:v libx264 -preset ultrafast -crf 27 \
    //     // -vf format=yuv420p -movflags +faststart -ar 44100 -b:a 64k -ac 2 ddd.mp4
    //
    //     // Ex: ffmpeg -thread_queue_size 512 -f alsa -i plughw:1,0 -c:a aac -f v4l2 \
    //     // -i /dev/video0 -s 640x480 -r 15 -c:v libx264 -preset ultrafast -crf 27 \
    //     // -vf format=yuv420p -ar 44100 -b:a 128k -ac 2 -movflags faststart+frag_keyframe+empty_moov \
    //     // -ftp-write-seekable 1 ftp://123.mp4
    //
    //     let options = ['-thread_queue_size', '512'];
    //
    //     if (this.audioInput) {
    //         options.push('-f');
    //         options.push('alsa');
    //         options.push('-i');
    //         options.push(this.audioInput);
    //         options.push('-c:a');
    //         options.push('aac');
    //     }
    //
    //     options.push('-f');
    //     options.push('v4l2');
    //     options.push('-i');
    //     options.push(this.videoInput);
    //     options.push('-s');
    //     options.push(this.capturingResolution);
    //     options.push('-r');
    //     options.push(this.capturingVideoFps);
    //     options.push('-c:v');
    //     options.push('libx264');
    //     options.push('-preset');
    //     options.push('ultrafast'); // ultrafast, superfast, veryfast, faster, fast, medium (the default), slow, slower, veryslow.
    //     options.push('-crf');
    //     options.push(18);
    //     options.push('-vf');
    //     options.push('format=yuv420p');
    //
    //     if (this.audioInput) {
    //         options.push('-ar');
    //         options.push(44100);
    //         options.push('-b:a');
    //         options.push(this.capturingAudioBitrate);
    //         options.push('-ac');
    //         options.push('2');
    //     }
    //
    //     options.push('-movflags');
    //     //options.push('faststart+frag_keyframe+empty_moov');
    //     options.push('frag_keyframe+empty_moov');
    //
    //     //options.push('-q:v');
    //     //options.push('1');
    //
    //     // TODO: ?
    //     options.push('-ftp-write-seekable');
    //     options.push('1');
    //
    //     options.push(this.capturingPath);
    //
    //     let startTimer = setTimeout(() => {
    //
    //         callbackCalled = true;
    //
    //         if (this.ffmpegCapturingProcess) {
    //             this.ffmpegCapturingProcess.kill();
    //             this.ffmpegCapturingProcess = null;
    //         }
    //
    //         // TODO: Can't write to ftp using the same user?
    //         callback(new Error(`startTimer has expired, can't start ffmpeg process in 10 sec.`));
    //
    //     }, 10000);
    //
    //     Camera.logger.debug(`Camera::startFFmpegStreamingProcess: ffmpeg options: ${options.join(' ')}`);
    //
    //     this.ffmpegCapturingProcess = spawn('ffmpeg', options);
    //
    //     this.ffmpegCapturingProcess.stdout.on('data', data => {
    //         Camera.logger.debug(`FFmpeg::stdout: ${data}`);
    //     });
    //
    //     this.ffmpegCapturingProcess.stderr.on('data', data => {
    //         Camera.logger.debug(`FFmpeg::stderr: ${data}`);
    //
    //         if (!callbackCalled && data.indexOf('Press [q] to stop') > -1) {
    //
    //             callbackCalled = true;
    //
    //             clearTimeout(startTimer);
    //
    //             callback();
    //         }
    //
    //         if (!callbackCalled && data.indexOf('Device or resource busy') > -1) {
    //
    //             callbackCalled = true;
    //
    //             clearTimeout(startTimer);
    //
    //             callback(new Error(data));
    //         }
    //     });
    //
    //     this.ffmpegCapturingProcess.on('close', code => {
    //
    //         this.ffmpegCapturingProcess = null;
    //
    //         Camera.logger.error(`Camera::startFFmpegStreamingProcess: FFmpeg process exited unexpectedly with code ${code}`);
    //
    //         this.doStopCapture();
    //     });
    // }
    //
    // /**
    //  * Stop video capturing
    //  *
    //  * @param [callback]
    //  */
    // stopCapture(callback) {
    //
    //     if (typeof callback !== 'function') callback = () => {
    //     };
    //
    //     if (!this.isCapturing) {
    //
    //         // Capture is inactive
    //         return callback();
    //     }
    //
    //     this.doStopCapture(callback);
    // }
    //
    // /**
    //  * Stop video capturing
    //  *
    //  * @param [callback]
    //  */
    // doStopCapture(callback) {
    //
    //     if (typeof callback !== 'function') callback = () => {
    //     };
    //
    //     async.series([callback => {
    //
    //         /**
    //          * Shut down FFmpeg
    //          */
    //         if (this.ffmpegCapturingProcess) {
    //
    //             this.ffmpegCapturingProcess.removeAllListeners('close');
    //
    //             this.ffmpegCapturingProcess.once('close', () => {
    //
    //                 callback();
    //             });
    //
    //             this.ffmpegCapturingProcess.kill();
    //
    //         } else {
    //             callback();
    //         }
    //
    //     }, callback => {
    //
    //         // Save record
    //         // TODO: Should not be invoked is camera was not really started!
    //         let record = new this.recordModel.model({
    //             cameraName: this.cameraName,
    //             ftpPath: this.ftpPath,
    //             url: this.capturingPath,
    //             httpUrl: this.httpUrl
    //         });
    //
    //         record.save(callback);
    //
    //     }], err => {
    //         if (err) {
    //             Camera.logger.debug(`Camera::doStopCapture: ${err.stack}`);
    //             return callback(err);
    //         }
    //
    //         this.ffmpegCapturingProcess = null;
    //
    //         this.isCapturing   = false;
    //         this.capturingPath = false;
    //
    //         let data = {
    //             ftpPath: this.ftpPath,
    //             url: this.capturingPath,
    //             httpUrl: this.httpUrl
    //         };
    //
    //         this.emit('capture-stopped', data);
    //
    //         callback();
    //     });
    // }

    init(callback) {

        callback();
    }
}

let camera = new Camera({
    cameraName: 'main-camera',
    videoInput: '/dev/video0',
    audioInput: 'plughw:1,0',
    httpStreamingPort: '8081',
    streamingResolution: '640x480',
    streamingVideoBitRate: '1024',
    streamingVideoFps: '5',
    streamingAudioBitrate: '64',

    capturingResolution: '640x480',
    capturingVideoFps: '15',
    capturingAudioBitrate: '128k'
});

/**
 * Exporting Model
 *
 * @type {Function}
 */
module.exports = camera;