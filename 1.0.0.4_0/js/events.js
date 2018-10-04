// detect full screen
function fullscreenDetect(){
    return ( window.innerHeight == screen.height ) ? true : false;
}

var isFull = fullscreenDetect();

// trigger detect
$( window ).resize(function() {
    initMinimap('data_'+zoomText, zoomValue);
    var isFull = fullscreenDetect();
    if( isFull ){
        $('#container').css("height", "100%");
        $('.live').css({"width":"100%", "height": "100%"});
        $('#left_menu').css("display","none");
        document.getElementById('videoContainer').style.width = '100%';
        document.getElementById('videoContainer').style.height = '100%';
        $('#videoElement').css({"width":"100%", "height": "100%"});
    } else {
        $('#container').css("height", "calc(100% - 40px)");
        $('.live').css("width", "calc(100% - 50px)");
        $('#left_menu').css("display","");
    }
});

$(document).ready(function () {
    if (isFull) {
        $("#fullscreen-button").hide();
        $("#exit-fullscreen-button").show();
    } else {
        $("#fullscreen-button").show();
        $("#exit-fullscreen-button").hide();
    }
});

// 儲存設定
var saveSettings = function (instant, snapshot_timer, audio_source) {
    // do save settings
    snapshotPreviewTime = $('input[name=instant]:checked').val();
    snapshotTimer = $('input[name=snapshot_timer]:checked').val();
    settingStr = "{\"snapshotPreviewTime\":" + snapshotPreviewTime + ", \"snapshotTimer\":" + snapshotTimer + "}";

    // Create Folder
    appFS.root.getDirectory('Settings', { create: true }, function (dirEntry) {
        // Write settings to File System
        dirEntry.getFile('/Settings/settings.txt', { create: true }, function (fileEntry) {
            fileEntry.createWriter(function (fileWriter) {
                // Delete file content first
                fileWriter.truncate(0);

                // Wait 500 milliseconds then save new content
                setTimeout(function () {
                    fileWriter.onwriteend = function (e) {
                        closePopup();
                    };

                    fileWriter.onerror = function (e) {
                        console.log('Write failed: ' + e.toString());
                    };

                    // Create a new Blob and write it
                    var blob = new Blob([settingStr], { type: 'text/plain' }); //singleImageSrc], {type: imageType});
                    fileWriter.write(blob);
                }, 500);
            }, fsErrorHandler);
        }, fsErrorHandler);
    });
};

//關掉所有popup
var closePopup = function () {
    $("#setting_dialog").hide();
    $("#camera_select").hide();
    $("#resolution_select").hide();
    $("#resolution_not_support").hide();
    $("#rotate_select").hide();
    $("#confirm_dialog").hide();
    $("#zoom_box").hide();
};

function setRotateButtonPos(rotateVal) {
    $('.rotate_control_top li').removeClass("nowon");
    switch (rotateVal) {
        case -180:
            $('.rotate_control_top li.r0').addClass('nowon');
            break;
        case -90:
            $('.rotate_control_top li.r1').addClass('nowon');
            break;
        case 0:
            $('.rotate_control_top li.r2').addClass('nowon');
            break;
        case 90:
            $('.rotate_control_top li.r3').addClass('nowon');
            break;
        case 180:
            $('.rotate_control_top li.r4').addClass('nowon');
            break;
    }
}

// Full Screen Listener
$("#fullscreen-button").click(function () {
    if(document.webkitIsFullScreen)
    {
        // console.log('exit full screen');
        document.webkitCancelFullScreen(); // Chrome and Safari
        fullScreenButton.value = "Exit Full Screen";
    }
    else
    {
        // console.log('go full screen');
        container.webkitRequestFullscreen(); // Chrome and Safari
        fullScreenButton.value = "Full Screen";
    }
});

$("#exit-fullscreen-button").click(function () {
    console.log('restore app click');
    // chrome.app.window.current().restore();
    document.webkitCancelFullScreen();
    $('#container').css("height", "calc(100% - 40px)");
    $('.live').css("width", "calc(100% - 50px)");
    $('#left_menu').css("display","");
});
$('#closeApp').click(function () {
    console.log('close app click');
    chrome.app.window.current().close();
});

// Min App Listener
$('#minApp').click(function () {
    console.log('min app click');
    chrome.app.window.current().minimize();
});

// Open Settings Dialog
$('.window_setting').on('click', function () {
    closePopup();
    $("#setting_dialog").show();
    // Get Settings Value
    appFS.root.getDirectory('Settings', { create: true }, function (dirEntry) {
        dirEntry.getFile('settings.txt', {}, function (fileEntry) {
            fileEntry.file(function (file) {
                var readFile = new FileReader();
                readFile.onloadend = function (e) {
                    var settingJSON = JSON.parse(this.result);
                    snapshotPreviewTime = settingJSON.snapshotPreviewTime;
                    snapshotTimer = settingJSON.snapshotTimer;

                    instantRadio = document.getElementsByName('instant');
                    for (instantRadioSerial = 0; instantRadioSerial < instantRadio.length; instantRadioSerial++) {
                        if (instantRadio[instantRadioSerial].value == snapshotPreviewTime) {
                            instantRadio[instantRadioSerial].checked = true;
                        }
                    }

                    snapshotRadio = document.getElementsByName('snapshot_timer');
                    for (snapshotRadioSerial = 0; snapshotRadioSerial < snapshotRadio.length; snapshotRadioSerial++) {
                        if (snapshotRadio[snapshotRadioSerial].value == snapshotTimer) {
                            snapshotRadio[snapshotRadioSerial].checked = true;
                        }
                    }
                };

                readFile.readAsText(file);
            });
        });
    });
});

$("#btnCam").click(function () {
    closePopup();
    $("#camera_select").show();
});

$("#btnZoom").click(function () {
    closePopup();
    $("#zoom_box").show();
});

$(".resolution").click(function () {
    closePopup();
    $("#resolution_select").show();
});

$(".rotation").click(function () {
    closePopup();
    $("#rotate_select").show();
});

$("#videoResolution li").click(function () {
    var nowValue = $(this).data("value");
    if (nowValue != resolutionVal) {
        $("#videoResolution li").removeClass("nowon");
        resolutionVal = nowValue;
        start();
        if (window.innerHeight == screen.height) {
            // console.log('full screen inside');
            resizeWidth = screen.width;
            resizeHeight = screen.height;
            translateX = translateY = 0;
        }
        // reset the miniMap to center
        translateX = 0, translateY = 0;
        canvas.style[prop] = 'rotate(' + rotateValue + 'deg) scale(' + zoomValue + ') rotateY(' + rotateY + 'deg) rotateX(' + rotateX + 'deg)';
        v.style[prop] = 'scale(' + zoomValue + ') rotate(' + rotateValue + 'deg) rotateY(' + rotateY + 'deg) rotateX(' + rotateX + 'deg)';
        initMinimap(zoomValue);
    }
    closePopup();
});

$("#btnCancelSetting").click(function () {
    $("#setting_dialog").hide();
});

$("#btnSaveSetting").click(function () {
    saveSettings();
});

$("#btn-freeze").click(function () {
    if (videoElement.paused == true) {
        // Play the video
        videoElement.play();
        $(this).removeClass('btn_freeze-on').addClass("btn_freeze");

    } else {
        // Pause the video
        videoElement.pause();
        $(this).addClass('btn_freeze-on').removeClass("btn_freeze");
    }
});

$(".darkside_bg").click(function (e) {
    if ($.inArray("darkside_bg", e.target.classList) >= 0) {
        $(this).hide();
    }
});

// rotate btn toggle
$('.rotate_control_top li').on('click', function () {
    var _val = $(this).data('value');
    $('.rotate_control_top li').removeClass("nowon");
    $(this).addClass("nowon");
    setVideoRotate(_val);
});

$('#btnRotateReset').on('click', function () {
    rotateValue = 0;
    setVideoRotate(rotateValue);
    $(".mirror").prop('checked', false);
    setVideoMirror(0);
});

var mouseStillDown = false;
var keepRotate;
var keepRotateDelay = 250;
$(".rotate_control_mid li.reduce").click(function () {
    setVideoRotate(rotateValue - 6);
}).on('mousedown',function(){
    var _btn = $(this);
    mouseStillDown = true;
    keepRotate = setInterval(function () {
        if (!mouseStillDown) return;
        if (mouseStillDown) {
            _btn.trigger('click');
        }
    }, keepRotateDelay);
}).on('mouseup', function () {
    // 放開 btn 停止連發
    clearInterval(keepRotate);
    mouseStillDown = false;
})
.on('mouseout', function () {
    // 按住但離開 btn 也停止
    clearInterval(keepRotate);
    mouseStillDown = false;
});

$(".rotate_control_mid li.increase").click(function () {
    setVideoRotate(rotateValue + 6);
}).on('mousedown', function () {
    var _btn = $(this);
    mouseStillDown = true;
    keepRotate = setInterval(function () {
        if (!mouseStillDown) return;
        if (mouseStillDown) {
            _btn.trigger('click');
        }
    }, keepRotateDelay);
}).on('mouseup', function () {
    // 放開 btn 停止連發
    clearInterval(keepRotate);
    mouseStillDown = false;
}).on('mouseout', function () {
        // 按住但離開 btn 也停止
        clearInterval(keepRotate);
        mouseStillDown = false;
});

$('#textReload').on('click', function () {
    // location.href = "";
    // location.reload();
    return chrome.runtime.reload();
});

// Live image rotate slider
$('.rotate_control_mid .labar').slider({
    value: 0,
    min: -180,
    max: 180,
    step: 6,
    start: function (event, ui) {
        $('.rotate_control_top li').removeClass("nowon");
        // console.log('start drag');
        dragging = true;
    },
    slide: function (event, ui) {
        rotateValue = ui.value;
        _scaleX = zoomValue * mirrorX;
        _scaleY = zoomValue * mirrorY;

        setVideoRotate(rotateValue, true);
        // console.log('dragging:'+dragging);
    },
    stop: function (event, ui) {
        setRotateButtonPos(ui.value);
        dragging = false;
    }
});

//zoom slider
$(".zoom_control_mid li.reduce").click(function () {
    setZoom($('.zoom_control_mid .labar').slider("option", "value") - 0.5);
}).on('mousedown', function () {
    var _btn = $(this);
    mouseStillDown = true;
    keepRotate = setInterval(function () {
        if (!mouseStillDown) return;
        if (mouseStillDown) {
            _btn.trigger('click');
        }
    }, keepRotateDelay);
}).on('mouseup', function () {
    // 放開 btn 停止連發
    clearInterval(keepRotate);
    mouseStillDown = false;
}).on('mouseout', function () {
    // 按住但離開 btn 也停止
    clearInterval(keepRotate);
    mouseStillDown = false;
});

$(".zoom_control_mid li.increase").click(function () {
    setZoom($('.zoom_control_mid .labar').slider("option", "value") + 0.5);
}).on('mousedown', function () {
    var _btn = $(this);
    mouseStillDown = true;
    keepRotate = setInterval(function () {
        if (!mouseStillDown) return;
        if (mouseStillDown) {
            _btn.trigger('click');
        }
    }, keepRotateDelay);
}).on('mouseup', function () {
    // 放開 btn 停止連發
    clearInterval(keepRotate);
    mouseStillDown = false;
}).on('mouseout', function () {
    // 按住但離開 btn 也停止
    clearInterval(keepRotate);
    mouseStillDown = false;
});

$('.zoom_control_mid .labar').slider({
    value: 1,
    min: 1,
    max: 7,
    step: 0.5,
    slide: function (event, ui) {
        setZoom(ui.value);
    }
});

$(".mirror").change(function () {
    val = 0;
    $(".mirror:checked").each(function (index) {
        val += parseInt($(this).val());
    });
    setVideoMirror(val);
});

$('#camSelector').on('change', function () {
    var _val = $(this).val();
    var selIndex = $(this).data("hidindex");
    var _data = $("#camSelector option:selected").text();
    choseVideoSource = _val;
    currentHID = null;

    // Get HID Information
    _pidPattern = /\:[0-9a-zA-Z]+/g;
    _dataMatch = _data.match(_pidPattern).toString();
    // _getVIDMatch = _dataMatch.substring(0);
    _getPIDMatch = _dataMatch.substring(1);
    _getPID = parseInt("0x" + _getPIDMatch, 16).toString(10);

    var _deviceFilter = new Array();
    _deviceFilter['vendorId'] = 6008;
    _deviceFilter['productId'] = parseInt(_getPID);

    chrome.hid.getDevices({ "vendorId": 6008, "productId": parseInt(_getPID), "filters": _deviceFilter }, function (foundHID) {
        if (!$.isEmptyObject(foundHID)) {
            currentHID = (foundHID.length > 1) ? foundHID[selIndex].deviceId : foundHID[0].deviceId;
        }

        // Get HID Connect ID
        if (currentHID != null) {
            initHID();
        }
    });
    _data = _data.toLowerCase();
    $("#btnCam").attr('class', '');
    if (_data.indexOf('ziggi') >= 0) {
        $("#btnCam").addClass("cam-ziggi");
    } else if (_data.indexOf('vz-1') >= 0) {
        $("#btnCam").addClass("cam-vz1");
    } else if (_data.indexOf('vz-r') >= 0) {
        $("#btnCam").addClass("cam-vzr");
    } else if (_data.indexOf('point') >= 0){
        $("#btnCam").addClass("cam-p2v");
    } else {
        $("#btnCam").addClass("cam-others");
    }
    start();
});

function setVideoRotate(val, isSlide) {
    var checkIsSlide = isSlide || false;
    if (val > 180) val = 180;
    if (val < -180) val = -180;
    // Reset translate values
    if (zoomValue == 1.0) {
        translateX = translateY = 0;
    }

    rotateValue = val;
    initMinimap(zoomValue);

    _scaleX = zoomValue * mirrorX;
    _scaleY = zoomValue * mirrorY;

    v.style[prop] = 'rotate(' + rotateValue + 'deg) scale(' + _scaleX + ',' + _scaleY + ') translate(' + translateX + 'px,' + translateY + 'px)';
    $('.rotate_control_mid .labar').slider({
        value: rotateValue
    });
    setRotateButtonPos(rotateValue);
    drawFitRatioImage();
    val = 0;
    $(".mirror:checked").each(function (index) {
        val += parseInt($(this).val());
    });
    setVideoMirror(val);
}

function setVideoMirror(val) {
    videoMirror = val;
    _prevMirrorX = mirrorX;
    _prevMirrorY = mirrorY;
    switch (videoMirror) {
        case 0:
            mirrorX = 1;
            mirrorY = 1;
            rotateX = 0;
            rotateY = 0;
            scaleX = zoomValue * mirrorX;
            scaleY = zoomValue * mirrorY;
            break;
        case 1:
            mirrorX = -1;
            mirrorY = 1;
            rotateX = 0;
            rotateY = 180;
            scaleX = zoomValue * mirrorX;
            scaleY = zoomValue * mirrorY;
            break;
        case 2:
            mirrorX = 1;
            mirrorY = -1;
            rotateX = 180;
            rotateY = 0;
            scaleX = zoomValue * mirrorX;
            scaleY = zoomValue * mirrorY;
            break;
        case 3:
            mirrorX = -1;
            mirrorY = -1;
            rotateX = 180;
            rotateY = 180;
            scaleX = zoomValue * mirrorX;
            scaleY = zoomValue * mirrorY;
    }

    translateX = translateX * mirrorX * _prevMirrorX;
    translateY = translateY * mirrorY * _prevMirrorY;

    _prevMirrorX = mirrorX;
    _prevMirrorY = mirrorY;
    var vc = document.getElementById("videoContainer");
    // vc.style[prop] = 'scale(' + mirrorX + ',' + mirrorY + ')';
    v.style[prop] = 'rotate(' + rotateValue + 'deg) scale(' + zoomValue + ') rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
    initMinimap(zoomValue);
}

function setZoom(val, isSlide) {
    var checkIsSlide = isSlide || false;
    if (val > 7) val = 7;
    if (val < 1) val = 1;
    $("#zoomText").text(val + "x");
    zoomValue = (val - 1) / 5 + 1;
    if(!checkIsSlide) {
        $('.zoom_control_mid .labar').slider({
            value: val
        });
    }
    v.style[prop] = 'rotate(' + rotateValue + 'deg) scale(' + zoomValue + ') rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
    var _minimapClass = 'zoom' + val + 'x';
    _minimapClass = _minimapClass.replace(".", "_");
    $('#minimap').removeClass().addClass("pan_box " + _minimapClass);
    $('#minimap .digit').text(val + "x");
    initMinimap(zoomValue);
}

// Zoom In minimap
function initMinimap(scale) {
    // reset draggable mini box position
    $('#minimap_viewer').css({
        width: Math.floor(100 / scale) + '%',
        height: Math.floor(100 / scale) + '%',

        left: (160 - (160 / scale)) / 2,
        top: (120 - (120 / scale)) / 2
    });

    // define base positon
    var baseLeft = $('#minimap_viewer').position().left;
    var baseTop = $('#minimap_viewer').position().top;
    translateX = 0;
    translateY = 0;
    // Reset Position
    // resetVideoElementTransform();

    // init minimap viewer
    $('#minimap_viewer').draggable({
        containment: "parent", // lock limited moving area(parent box)
        drag: function (event, ui) {
            ui.position.left = ui.position.left < 0 ? 0 : ui.position.left;
            ui.position.top = ui.position.top < 0 ? 0 : ui.position.top;
            if (rotateValue > 0 && rotateValue < 90) // ok
            {
                translateX = ((baseLeft - ui.position.left) * v.offsetWidth / 160);
                translateY = ((baseTop - ui.position.top) * v.offsetHeight / 120);
            }
            else if (rotateValue == 90) // ok
            {
                translateX = ((baseTop - ui.position.top) * v.offsetHeight / 120);
                translateY = -((baseLeft - ui.position.left) * v.offsetWidth / 160);
            }
            else if (rotateValue > 90 && rotateValue < 180) // ok
            {
                translateX = -((baseLeft - ui.position.left) * v.offsetWidth / 120);
                translateY = -((baseTop - ui.position.top) * v.offsetHeight / 160);
            }
            else if (rotateValue == 180) // ok
            {
                translateX = -(baseLeft - ui.position.left) * v.offsetWidth / 160;
                translateY = -(baseTop - ui.position.top) * v.offsetHeight / 120;
            }
            else if ((rotateValue < 0 && rotateValue > -90)) // ok
            {
                translateX = ((baseLeft - ui.position.left) * v.offsetWidth / 160);
                translateY = ((baseTop - ui.position.top) * v.offsetHeight / 120);
            }
            else if (rotateValue == -90) // ok
            {
                translateX = -((baseTop - ui.position.top) * v.offsetHeight / 120);
                translateY = ((baseLeft - ui.position.left) * v.offsetWidth / 160);
            }
            else if ((rotateValue < -90 && rotateValue > -180)) // ok
            {
                translateX = -((baseLeft - ui.position.left) * v.offsetWidth / 160);
                translateY = -((baseTop - ui.position.top) * v.offsetHeight / 120);
            }
            else if (rotateValue == -180) // ok
            {
                translateX = -(baseLeft - ui.position.left) * v.offsetWidth / 160;
                translateY = -(baseTop - ui.position.top) * v.offsetHeight / 120;
            }
            else {
                translateX = (baseLeft - ui.position.left) * v.offsetWidth / 160;
                translateY = (baseTop - ui.position.top) * v.offsetHeight / 120;
                // console.log('translateX -> baseLeft: '+baseLeft+' positionLeft: '+ui.position.left+' resizeWidth: '+resizeWidth);
                // console.log('translateY -> baseTop: '+baseTop+' positionTop: '+ui.position.top+' resizeHeight: '+resizeHeight);
                // console.log('----------------------------------');

            }
            // console.log('adjust translate x= '+$('#videoElement').width());
            // console.log('request width= '+requestWidth);
            // if (mirrorY == -1) {
            //     translateX = translateX;
            //     translateY = translateY;
            // }

            // if (mirrorX == -1) {
            //     translateX = translateX;
            //     translateY = translateY;
            // }

            translateX = Math.floor(translateX);
            translateY = Math.floor(translateY);

            _scaleX = zoomValue * mirrorX;
            _scaleY = zoomValue * mirrorY;

            if (translateX < 0) {
                translateX = translateX + 5;
            }
            if (translateY < 0) {
                translateY = translateY + 5;
            }
            v.style[prop] = 'rotate(' + rotateValue + 'deg) scale(' + zoomValue + ') translate(' + translateX + 'px,' + translateY + 'px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
        }
    });
}