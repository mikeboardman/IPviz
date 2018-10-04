(function () {
  var blockContextMenu, myElement;

  blockContextMenu = function (evt) {
    evt.preventDefault();
  };

  myElement = document.body;
  myElement.addEventListener('contextmenu', blockContextMenu);
})();

var clientLang = window.navigator.language;
var lang = {
    reviewConfirm: chrome.i18n.getMessage('btnConfirm'),
    singleConfirm: chrome.i18n.getMessage('btnConfirm'),
    cancel: chrome.i18n.getMessage('btnCancel'),
    saveSettings: chrome.i18n.getMessage('btnSave')
};

var v = document.getElementsByTagName('video')[0];
var container = document.getElementById('container');
var live = document.getElementById('live');
var videoElement = document.getElementById('videoElement');
var videoMirror = document.getElementById('videoMirror');
var videoRotate = document.getElementById('videoRotate');
var videoZoom = document.getElementById('videoZoom');
var canvas = document.querySelector('canvas');
var context = canvas.getContext('2d');
var isStreaming = false;
var w, h, ratio;
var winExtraWidth = 50;
var winExtraHeight = 40;
var requestWidth = 1280;
var requestHeight = 720;
var widthToHeight = 16 / 9;
var widthToHeight90 = 9 / 16;
var disableBodySelect = true;
var aeLock = false;
var HIDindex = 0;

/* If a button was clicked (uses event delegation)...*/
var resolutionVal = 4, zoomValue = 1, rotateValue = 0, singleZoomValue = 1, singleRotateValue = 0, translateX = 0, translateY = 0;
var mirrorY = 1, mirrorX = 1;
var rotateX = 0, rotateY = 0;
var exposureValue = 8, exposureValueDefault = 8;

/* Array of possible browser specific settings for transformation */
var properties = ['transform', 'WebkitTransform', 'MozTransform', 'msTransform', 'OTransform'], prop = properties[0];

/* Iterators and stuff */
var i, j, t;
var videoSourceSerial = 0;
var audioSourceSerial = 0;
var snapshotTimer = 0;
var snapshotPreviewTime = 0;

var fullScreenButton = document.getElementById('fullscreen-button');
var rafId = null;
var startTime = null;
var endTime = null;
var frames = [];
var snapShotButton = document.getElementById('snapshot-button');
var recordButton = document.getElementById('record-button');
var stopRecordButton = document.getElementById('stop-record-button');
var choseVideoSource = '', currentHID = null, currentHIDConnectID = null, _hidDebug = false;
var hasIPEVO = true;
var zoomText, scaleX, scaleY;
var resizeWidth = 1280;
var resizeHeight = 720;
var indexArr;
var labelArr;
var firstHID = -1;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

var appFS = null;
var requestStorage = 1024 * 1024 * 10000; // 10G
// File System
// Note: The file system has been prefixed as of Google Chrome 12:
// windows filesytem storage path C:\Users\Henry\AppData\Local\Google\Chrome\User Data\Default\File System
window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

window.onresize = function (event) {
    drawFitRatioImage();
    centerVideo();
    initMinimap(zoomValue);
    resizeWidth = window.innerWidth - 50;
    resizeHeight = window.innerHeight;
    var newWidthToHeight = resizeWidth / resizeHeight;

    if (newWidthToHeight > imageRatio) {
        singleCanvasHeight = resizeHeight;
        singleCanvasWidth = singleCanvasHeight * imageRatio;
    }
    else {
        singleCanvasWidth = resizeWidth;
        singleCanvasHeight = singleCanvasWidth / imageRatio;
    }
    document.getElementById('singleReviewCanvas').style.width = singleCanvasWidth + 'px';
    document.getElementById('singleReviewCanvas').style.height = singleCanvasHeight + 'px';
    v.style[prop] = 'scale(' + zoomValue + ') rotate(' + rotateValue + 'deg) rotateY(' + rotateY + 'deg) rotateX(' + rotateX + 'deg)';
};

// Draw fit ratio image
function drawFitRatioImage() {
    resizeWidth = window.innerWidth - 50;
    resizeHeight = window.innerHeight - 40;
    var newWidthToHeight = resizeWidth / resizeHeight;
    var realWindowHeight = $(window).height();

    if (newWidthToHeight > widthToHeight) {
        resizeWidth = resizeHeight * widthToHeight;
    }
    else {
        resizeHeight = resizeWidth / widthToHeight;
    }

    if (window.innerHeight == screen.height) {
        resizeWidth = screen.width;
        resizeHeight = screen.height;
    }
    // Live View
    resizeWidth = Math.ceil(resizeWidth);
    resizeHeight = Math.ceil(resizeHeight);

    document.getElementById('canvas_area').style.width = resizeWidth + 'px';
    document.getElementById('canvas_area').style.height = resizeHeight + 'px';
    document.getElementById('canvas').style.width = resizeWidth + 'px';
    document.getElementById('canvas').style.height = resizeHeight + 'px';
    videoElement.style.width = resizeWidth + 'px';
    videoElement.style.height = resizeHeight + 'px';

    document.getElementById('videoContainer').style.width = resizeWidth + 'px';
    document.getElementById('videoContainer').style.height = resizeHeight + 'px';
    $('#videoElement').css('transform-origin', '50% 50%');
    absRotate = Math.abs(rotateValue);
    realRotate = absRotate * Math.PI / 180;
}

// center
function centerVideo() {
    // var outer = $(window).width();
    // var inner = $('#videoElement').width() + 70;
    // var space = Math.floor((outer - inner) / 2) - 1;
    // var _top = $('#videoElement').position().top;
    // var _top = videoElement.offsetTop;
    // $('#videoElement, #guideline, #instant_preview').css('left', space);
    // $('#guideline, #instant_preview').css('left', space);
    // $('#guideline').css('top', _top);
    // $('#instant_preview').css('top', _top - 7);
}

function onInitFs(fs) {
    appFS = fs;
}

// FileSystem Error Handler
function fsErrorHandler(e) {
    var msg = 'An error occured:';
    console.log('error name = ', e.name);

    switch (e.name) {
        case 'QuotaExceededError':
            msg += 'QUOTA_EXCEEDED_ERR';
            break;
        case 'NotFoundError':
            msg += 'NOT_FOUND_ERR';
            break;
        case 'SecurityError':
            msg += 'SECURITY_ERR';
            break;
        case 'InvalidModificationError':
            msg += 'INVALID_MODIFICATION_ERR';
            break;
        case 'InvalidStateError':
            msg += 'INVALID_STATE_ERR';
            break;
        default:
            msg += 'Unknown Error';
            break;
    }
    console.log('Error: ' + msg);
}

function readArrayBuffer(buf) {
    return new Uint8Array(buf);
}

// FileSystem RequestQutota
navigator.webkitPersistentStorage.requestQuota(
    requestStorage,
    function (grantedBytes) {
        window.requestFileSystem(PERSISTENT, grantedBytes, onInitFs, fsErrorHandler);
        // console.log('request file system storage');
    },
    function (e) {
        console.log('Error', e);
    }
);


chrome.app.window.current().onMaximized.addListener(function () {
    $("#fullscreen-button").hide();
    $("#exit-fullscreen-button").show();
});

chrome.app.window.current().onRestored.addListener(function () {
    $("#fullscreen-button").show();
    $("#exit-fullscreen-button").hide();
});

function initHID() {
    if (currentHID != null) {
        if (_hidDebug == true) console.log("init HID:", currentHID);
        // Connect to HID Device and get connection ID
        chrome.hid.connect(currentHID, function (connectHID) {
            document.getElementById('hid-focus').style.display = '';
            // document.getElementById('exposureControl').style.display = '';
            currentHIDConnectID = connectHID.connectionId;
            if (_hidDebug == true) console.log("currentHIDConnectID:", currentHIDConnectID);
            // Sent query HID device current exposure command
            var bytes = new Uint8Array(4);

            bytes[0] = 0x00;
            bytes[1] = 0x06;
            bytes[2] = 0x00;
            bytes[3] = 0x00;

            if (_hidDebug == true) console.log('bytes value: ', bytes);
            chrome.hid.send(currentHIDConnectID, 2, bytes.buffer, function () {
                if (_hidDebug == true) {
                    console.log('send hid command: get exposure.');
                    // console.log("Send: chrome runtime error: ", chrome.runtime.lastError);
                }
            });

            chrome.hid.receive(currentHIDConnectID, function (reportID, returnVal) {
                var _hidReturn = readArrayBuffer(returnVal);
                if (_hidDebug == true) {
                    console.log('reportID: ', reportID);
                    console.log('return value: ', _hidReturn);
                }
                if (_hidReturn[0] == 6) {
                    if (_hidDebug == true) console.log("exposure value: " + _hidReturn[1]);
                    // document.getElementById('btnExposure').innerHTML = "AE-" + _hidReturn[1];

                    // 抓到曝光值之後，刻度也要跟著調整
                    $('.slider.exposure').slider({
                        value: parseInt(_hidReturn[1])
                    });
                }
            });


            // Set AE-Lock off
            var aeLockBytes = new Uint8Array(4);

            aeLockBytes[0] = 0x05;
            aeLockBytes[1] = 0x00;
            aeLockBytes[2] = 0x00;
            aeLockBytes[3] = 0x00;

            // Send set AE-lock command to the connected HID device
            chrome.hid.send(currentHIDConnectID, 2, aeLockBytes.buffer, function () {
                if (_hidDebug == true) {
                    console.log('send hid command: set AE-unlock.', aeLockBytes);
                    // console.log("Send: chrome runtime error: ", chrome.runtime.lastError);
                }
            });

            // Uncheck AE Lock UI
            $('.btn-aelock').removeClass('checked');
        });
    } else {
        document.getElementById('hid-focus').style.display = 'none';
        // document.getElementById('exposureControl').style.display = 'none';
    }
}

var checkIpevoHID = function () {
    $("#camSelector option").each(function (index) {
        $(this).data("hidindex", indexArr[index]);
    });
    if (firstHID > -1) {
        $("#camSelector option:eq(" + firstHID + ")").attr("selected", true);
    } else {
        $("#camSelector option:eq(0)").attr("selected", true);
    }
    $("#camSelector").change();
};

var successCallback = function (stream) {
    window.stream = stream; // make stream available to console
    // videoElement.src = window.URL.createObjectURL(stream);
    videoElement.srcObject = stream;
    videoElement.play();
    $(this).removeClass('btn_freeze-on').addClass("btn_freeze");
    return navigator.mediaDevices.enumerateDevices();
};

var errorCallback = function (error) {
    // alert('Your camera not supports this resolution.');
    $("#dialog-resolution").dialog({
        width: 400
    });
    $("#resolution_not_support").show();
    console.log("navigator.getUserMedia error: ", error);
};

var start = function () {
    if(currentHID == null){
        document.getElementById('hid-focus').style.display = 'none';
    }
    // document.getElementById('exposureControl').style.display = 'none';

    if (!!window.stream) {
        // videoElement.src = null;
        appVersion = navigator.appVersion;
        objOffsetVersion = appVersion.indexOf("Chrome");
        chromeVersion = appVersion.substr(objOffsetVersion + 7, 2);
        // console.log('version: ', chromeVersion);
        // console.log('main version: ', parseInt(navigator.appVersion, 10));
        if (chromeVersion <= 46) {
            window.stream.stop();
        } else {
            window.stream.getVideoTracks()[0].stop();
        }
    }
    var videoSource = choseVideoSource; //videoSelect.value;

    var recordVideo = false;
    switch (resolutionVal) {
        case 1:
            requestWidth = 640;
            requestHeight = 480;
            resolutionVal = 1;
            widthToHeight = 4 / 3;
            widthToHeight90 = 3 / 4;
            break;
        case 2:
            requestWidth = 800;
            requestHeight = 600;
            widthToHeight = 4 / 3;
            widthToHeight90 = 3 / 4;
            break;
        case 3:
            requestWidth = 1024;
            requestHeight = 768;
            widthToHeight = 4 / 3;
            widthToHeight90 = 3 / 4;
            break;
        case 4:
            requestWidth = 1280;
            requestHeight = 720;
            widthToHeight = 16 / 9;
            widthToHeight90 = 9 / 16;
            break;
        case 5:
            requestWidth = 1600;
            requestHeight = 1200;
            widthToHeight = 4 / 3;
            widthToHeight90 = 3 / 4;
            break;
        case 6:
            requestWidth = 1920;
            requestHeight = 1080;
            widthToHeight = 16 / 9;
            widthToHeight90 = 9 / 16;
            break;
        case 7:
            requestWidth = 2048;
            requestHeight = 1536;
            widthToHeight = 4 / 3;
            widthToHeight90 = 3 / 4;
            break;
        case 8:
            requestWidth = 2592;
            requestHeight = 1944;
            widthToHeight = 4 / 3;
            widthToHeight90 = 3 / 4;
            break;
        case 9:
            requestWidth = 3264;
            requestHeight = 1836;
            widthToHeight = 16 / 9;
            widthToHeight90 = 9 / 16;
            break;
        case 10:
            requestWidth = 3264;
            requestHeight = 2448;
            widthToHeight = 4 / 3;
            widthToHeight90 = 3 / 4;
            break;
        case 11:
            requestWidth = 1024;
            requestHeight = 720;
            widthToHeight = 1.42;
            widthToHeight90 = 0.70;
            break;
        default:
        case 2:
            requestWidth = 800;
            requestHeight = 600;
            widthToHeight = 4 / 3;
            widthToHeight90 = 3 / 4;
            break;
    }
    $("#videoResolution li[data-value='" + resolutionVal + "']").addClass("nowon");
    // console.log('before constraints => width = '+requestWidth+ ' height = '+requestHeight);
    // console.log('videoSource: ', videoSource);
    var constraints = {
        video: {
            deviceId: videoSource ? { exact: videoSource } : undefined,
            width: { min: requestWidth, max: requestWidth },
            height: { min: requestHeight, max: requestHeight }
        }
    };
    // Setup Display Window Size
    if (document.webkitIsFullScreen) {
        container.setAttribute('width', requestWidth);
    }
    else {
        // console.log('not in full screen');
        if (requestWidth <= 1280) {
            window.resizeTo(requestWidth + winExtraWidth, requestHeight + winExtraHeight);
        }
        else if (requestWidth <= 3000) {
            window.resizeTo((requestWidth / 2) + winExtraWidth, (requestHeight / 2) + winExtraHeight);
        }
        else {
            window.resizeTo((requestWidth / 3) + winExtraWidth, (requestHeight / 3) + winExtraHeight);
        }
    }

    // console.log('constraints = ', constraints);
    navigator.mediaDevices.getUserMedia(constraints).then(successCallback).catch(errorCallback);

    videoElement.addEventListener('loadedmetadata', function () {
        // Calculate the ratio of the video's width to height
        ratio = videoElement.videoWidth / videoElement.videoHeight;

        // Define the required width as 100 pixels smaller than the actual video's width
        w = videoElement.videoWidth;// - 100;

        // Calculate the height based on the video's width and the ratio
        h = videoElement.videoHeight; //parseInt(w / ratio, 10);
    }, false);

    videoElement.addEventListener('canplay', function (e) {
        if (!isStreaming) {
            isStreaming = 1;
        }
    }, false);
};

// List all video sources
var getSources = function (sourceInfos) {
    indexArr = new Array(sourceInfos.length);
    labelArr = new Array(sourceInfos.length);

    sourceInfos.forEach(function (sourceInfos) {
        if (sourceInfos.kind === 'videoinput') {
            var tmpeLabel = '';
            setLabel = sourceInfos.label;
            tmpeLabel = setLabel;

            var option = $("<option>");
            option.val(sourceInfos.deviceId);

            var getVendorID = 0;
            if (sourceInfos.label.length > 0) {
                getVendorID = parseInt("0x" + sourceInfos.label.split(":")[0].split("(")[1], 16).toString(10);
            }
            if (firstHID < 0) {
                if (getVendorID == '6008') {
                    firstHID = videoSourceSerial;
                }
            }

            if (videoSourceSerial == 0) {
                indexArr[videoSourceSerial] = 0;
            } else {
                if ($.inArray(setLabel, labelArr) == -1) {
                    indexArr[videoSourceSerial] = 0;
                } else {
                    HIDindex++;
                    tmpeLabel += ' ' + HIDindex;
                    indexArr[videoSourceSerial] = HIDindex;
                }
            }
            // console.log('i=',videoSourceSerial," setLabel:", setLabel, "id=", sourceInfos.deviceId);

            labelArr[videoSourceSerial] = setLabel;
            videoSourceSerial++;
            option.text(tmpeLabel);
            option.appendTo($("#camSelector"));
        }
    });

    setTimeout(function () {
        checkIpevoHID();
    }, 500);
};

// Get canvas.getContext('2d') effects
function getContext(outputType) {
    drawImageEndX = w;
    drawImageEndY = h;
    canvas.width = w;//h;
    canvas.height = h;//w;
    imageWidth = w;//h;
    imageHeight = h;//w;
    if (outputType == null) {
        if ((rotateValue == 90 || rotateValue == -90) && zoomValue == 1) {
            drawImageStartX = (-w / 2);
            drawImageStartY = (-h / 2);
        }
        else {
            drawImageStartX = (-canvas.width / 2);
            drawImageStartY = (-canvas.height / 2);
        }
    }


    realRotate = rotateValue * Math.PI / 180;

    context.clearRect(0, 0, canvas.width, canvas.height);


    // context.translate(canvas.width*zoomValue/2, canvas.height*zoomValue/2);
    context.translate(canvas.width / 2, canvas.height / 2);

    // Rotate
    context.rotate(realRotate);

    // Zoom-in and zoom-out
    context.scale(zoomValue * mirrorX, zoomValue * mirrorY);

    context.translate(translateX * mirrorX, translateY * mirrorY);

    context.drawImage(videoElement, drawImageStartX, drawImageStartY, drawImageEndX, drawImageEndY);
    // console.log('startX: '+drawImageStartX+' startY: '+drawImageStartY+' width: '+w+' height: '+h+' translateX: '+translateX+' translateY: '+translateY);
    context.rotate(-realRotate);

    return context;
}

// Get current date time
function getDateTime() {
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    var day = today.getDate();
    var hour = today.getHours();
    var min = today.getMinutes();
    var sec = today.getSeconds();

    //add a zero in front of numbers which<10
    month = checkTime(month);
    day = checkTime(day);
    hour = checkTime(hour);
    min = checkTime(min);
    sec = checkTime(sec);

    dateTime = year.toString() + month.toString() + day.toString() + '-' + hour.toString() + min.toString() + sec.toString();
    return dateTime;
}

function checkTime(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

var zoomWidth, zoomHeight;
var basePosition = {
    center:{}
};
/*
var initPosition = {};
var dragStart = false, dragged = false;
var newPosition = {};
var scale = 3;
$('video').css({ 'transform': 'scale(' + scale +')' });
basePosition.left = newPosition.left = resizeWidth * scale / 4;
basePosition.top = newPosition.top = resizeHeight * scale / 4;
basePosition.center.x = resizeWidth / 2;
basePosition.center.y = resizeHeight / 2;

$('#videoContainer')
    // tile mouse actions
    .on('mousedown', function (e) {
        initPosition.x = e.pageX - $(this).offset().left;
        initPosition.y = e.pageY - $(this).offset().top;
        dragStart = true;
    })
    .on('mouseup', function (e) {
        var x = e.pageX - $(this).offset().left;
        var y = e.pageY - $(this).offset().top;
        var moveX = initPosition.x - x;
        var moveY = initPosition.y - y;
        dragStart = false;
    })
    .on('mousemove', function (e) {
        if (dragStart) {
            var x = e.pageX - $(this).offset().left;
            var y = e.pageY - $(this).offset().top;
            var moveX = initPosition.x - x;
            var moveY = initPosition.y - y;
            if (moveX <= -basePosition.left) {
                moveX = -basePosition.left;
            }
            if (moveX >= basePosition.left * scale) {
                moveX = basePosition.left * scale;
            }

            if (moveY <= -basePosition.top) {
                moveY = -basePosition.top;
            }
            if (moveY >= basePosition.top * scale) {
                moveY = basePosition.top * scale;
            }
            newPosition.left += moveX;
            newPosition.top += moveY;
            if (newPosition.left < 0) {
                newPosition.left = 0;
                initPosition.x = x;
            }
            if (newPosition.top < 0) {
                newPosition.top = 0;
                initPosition.y = y;
            }
            if (newPosition.left > basePosition.left * scale) {
                newPosition.left = basePosition.left * scale;
                initPosition.x = x;
            }
            if (newPosition.top > basePosition.top * scale) {
                newPosition.top = basePosition.top * scale;
                initPosition.y = y;
            }
            console.log(newPosition.left);
            console.log(newPosition.top);
            translateX = (basePosition.left - newPosition.left) / 2;
            translateY = (basePosition.top - newPosition.top) / 2;
            v.style[prop] = 'rotate(' + rotateValue + 'deg) scale(' + scale + ') translate(' + translateX + 'px,' + translateY + 'px)';
        }

    });
*/
navigator.mediaDevices.enumerateDevices().then(getSources);

document.addEventListener("keydown", function(e) {
  // Rewrite F11 pressed event
  if(e.keyCode == 122 || e.keyCode == 183)
  {
    e.preventDefault();
    $('#fullscreen-button').trigger('click');
    // console.log('F11 pressed');
  }

  // spacebar trigger snapshot
  if(e.keyCode == 32 )
  {
    e.preventDefault();
    $('#snapshot-button').trigger('click');
   // console.log('esc pressed');
  }

  // press "+" to zoom in
  if(e.keyCode == 107 || e.keyCode == 38)
  {
    e.preventDefault();
    $(".zoom_control_mid li.increase").trigger('click');
  }

  // press "ctrl" + "+" to zoom in
  if(e.ctrlKey && e.keyCode == 187)
  {
    e.preventDefault();
    $(".zoom_control_mid li.increase").trigger('click');
  }

  // // press "-" to zoom out
  if(e.keyCode == 109 || e.keyCode == 40)
  {
    e.preventDefault();
    $(".zoom_control_mid li.reduce").trigger('click');
  }

  // press "ctrl" + "-" to zoom in
  if(e.ctrlKey && e.keyCode == 189)
  {
    e.preventDefault();
    $(".zoom_control_mid li.reduce").trigger('click');
  }

  // press "right arrow" to rotate right
  if(e.keyCode == 39)
  {
    e.preventDefault();
    $(".rotate_control_mid li.increase").trigger('click');
  }

  // press "left arrow" to rotate left
  if(e.keyCode == 37)
  {
    e.preventDefault();
    $(".rotate_control_mid li.reduce").trigger('click');
  }


  if(e.ctrlKey && e.shiftKey && e.keyCode == 27)
  {
    e.preventDefault();
  }

  if(e.keyCode == 27 )
  {
    e.preventDefault();
  }
  // console.log('you pressed key: '+e.keyCode);
}, false);
