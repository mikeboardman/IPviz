var reviewArea     = document.getElementById('reviewArea');
var reviewFooter   = document.getElementById('reviewFooter');
var reviewButton   = document.getElementById('changeToReview');
var cameraButton   = document.getElementById('changeToCamera');
var snapshotButton = document.getElementById('snapshot-button');
var recordButton   = document.getElementById('record-button');

var singleReviewArea = document.getElementById('singleReview');
var singleReviewZoom = document.getElementById('singleReviewZoom');
var singleReviewRotate = document.getElementById('singleReviewRotate');
var singleReviewCanvas = document.getElementById('singleReviewCanvas');
var singleReviewCtx    = singleReviewCanvas.getContext('2d');
var singleImageObj     = null;
var singleTempCanvas   = null;

var videoStyle       = document.getElementById('videoElement').style;
var videoWebkitValue = videoStyle.getPropertyValue("-webkit-transform") || videoStyle.getPropertyValue("-transform");
var videoLeft        = videoStyle.left.split('px')[0];
var videoTop         = videoStyle.top.split('px')[0];
var stopRecordButton = document.getElementById('stop-record-button');
var imageRatio = 0;
var recordTime = 0;

var saveProcess = false;
var countdowning = false;
var recording = false;
var rafId = null;
var startTime = null;
var endTime = null;
var frames = [];
var snapshotImgID = 0;
var appFS = null;
var requestStorage = 1024*1024*10000; // 10G

var imageType = 'image/jpeg';
var imageExt  = 'jpg';
var imageData = Array();
var reviewWidth = 240;
var entries = [];
var resetWinSize = false;

// File System
// Note: The file system has been prefixed as of Google Chrome 12:
// windows filesytem storage path C:\Users\Henry\AppData\Local\Google\Chrome\User Data\Default\File System
window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

// Change to Review Page
function toArray(list)
{
    return list;
    // return Array.prototype.slice.call(list || [], 0);
}

function listResults(entries)
{
    var fragment = document.createDocumentFragment();



    // Create and Setup Review Div
    entries.forEach(function(entry, i)
    {
        var imageContainer = document.createElement('dl');
        // imageContainer.id = 'reviewImageContainer';
        imageContainer.className += 'cf'; // clearfix
        if(entry.isFile == false)
        {
            return false;
        }
        appFS.root.getFile(entry.name, {create: true}, function(fileEntry)
        {
            // Read
            fileEntry.file(function(file)
            {
                var reader = new FileReader();
                var fileType;
                // reader.onloadend = function(e)
                reader.onloadstart = function(e)
                {
                    snapshotImgID += 1;
                    // console.log('file entry: ', fileEntry);

                    // Create and setup review div
                    var imageDiv = document.createElement('dt');
                    imageDiv.id = 'reviewImgDiv_'+snapshotImgID;
                    imageDiv.className += ' reviewImageClass';

                    // Create and setup review image
                    if(file.type.match('image'))
                    {
                        var fsImage = document.createElement('img');
                        var imageReaderData = [];
                        fileType = 'image';

                        // Read Image Data
                        var doImageReader = function()
                        {
                            imageReader = new FileReader();
                            imageReader.onload = function(event)
                            {
                                if(imageReaderData.length != 0)
                                {
                                    fsImage.src = imageReaderData;
                                }
                                else
                                {
                                    imageReaderData = event.target.result;
                                    doImageReader();
                                }
                            };
                            imageReader.readAsText(file);
                        };
                        doImageReader();
                    }
                    else if(file.type.match('video'))
                    {
                        var fsImage = document.createElement('video');
                        fileType = 'video';
                        fsImage.autoplay = false;
                        fsImage.controls = true;
                        fsImage.loop = false;
                        fsImage.src = fileEntry.toURL(); //"filesystem:"+window.location.protocol+"//"+window.location.host+"/persistent/"+entry.name;
                    }

                    // File process to display
                    imageWidth = w;
                    imageHeight = h;
                    fsImage.style.width = reviewWidth+'px'; //parseInt(imageWidth*0.3)+'px';
                    imageRatio = reviewWidth/imageWidth;
                    fsImage.style.height = parseInt(imageHeight*imageRatio)+'px';

                    fsImage.id = 'reviewImg_'+snapshotImgID;

                    // Display image name
                    var imageDesc = document.createElement('dd');
                    imageDesc.innerHTML = entry.name;
                    imageDesc.className = 'reviewImageText';

                    // Create hidden checkbox
                    var imageChkBox = document.createElement('input');
                    imageChkBox.type = 'checkbox';
                    imageChkBox.name = 'imageCheckBox';
                    imageChkBox.value = entry.name;
                    imageChkBox.id = 'reviewImgChkBox_'+snapshotImgID;
                    imageChkBox.style.display = 'none';

                    var clickTimeout = false;
                    // Double click enter single review mode
                    fsImage.addEventListener('click', function(e)
                    {
                        if(clickTimeout !== false)
                        {
                            // Double click
                            clearTimeout(clickTimeout);
                            clickTimeout = false;
                            imageToDisplay = 'reviewImg_'+this.id.split('_')[1];
                            // imageData['fileType'] = fileType;
                            // imageData['imageID'] = imageToDisplay;
                            imageData['controlID'] = this.id.split('_')[1];
                            // imageData['fileName'] = entry.name;
                            singleReview(imageData);
                        }
                        else
                        {
                            clickTimeout = setTimeout(function()
                            {
                                clickTimeout = false;
                            }, 400);

                            if($('input[name=imageCheckBox]:checked'))
                            {
                                // Reset highlight class
                                if(e.ctrlKey == false && e.metaKey == false)
                                {
                                    $('input[name=imageCheckBox]:checked').attr('checked', false);
                                    $('.reviewImageHighlight').removeClass('reviewImageHighlight');
                                }

                                // Add select highlight class
                                $(this).addClass('reviewImageHighlight');
                            }

                            var reviewImgChkBoxID = 'reviewImgChkBox_'+this.id.split('_')[1];
                            if(document.getElementById(reviewImgChkBoxID).checked == true)
                            {
                                document.getElementById(reviewImgChkBoxID).checked = false;
                                document.getElementById(this.id).className = 'reviewImageNormal';
                            }
                            else
                            {
                                document.getElementById(reviewImgChkBoxID).checked = true;
                                document.getElementById(this.id).className = 'reviewImageHighlight';
                            }

                            // Check selected file type
                            $('input[name=imageCheckBox]:checked').each(function()
                            {
                                var checkedItem = this.nextSibling.tagName;
                            });
                        }
                    });

                    // Append html elemnets
                    imageDiv.appendChild(imageChkBox);
                    imageDiv.appendChild(fsImage);
                    imageContainer.appendChild(imageDiv);
                    imageContainer.appendChild(imageDesc);
                    reviewArea.appendChild(imageContainer);
                }; // end of reader.onloadend
                // reader.readAsText(file);
                reader.readAsText(file);
            }, fsErrorHandler);
        }, fsErrorHandler);
    });
}

// Change to review list page
reviewButton.onclick = function()
{
    closePopup();
    $(".live").hide();
    $("#cameraBtnGroup").hide();
    $("#minimap").addClass("zoom1x");
    $("#reviewHeader").hide();
    $("#singleReview").hide();
    $("#singleViewRotate").hide();
    reviewButton.style.display = 'none';
    cameraButton.style.display = 'block';
    $("#key_btn").hide();
    $("#right_menu").hide();
    reviewArea.style.display = 'block';
    reviewFooter.style.display = 'block';
    // If review image div existd, remove it and reset snapshot image id.
    $("#reviewArea").empty();
    snapshotImgID = 0;

    // Read Filesystem directory
    var dirReader = appFS.root.createReader();
    entries = [];

    var readEntries = function()
    {
        dirReader.readEntries(function(results){
            if(!results.length)
            {
                listResults(entries); //.sort());
            }
            else
            {
                entries = entries.concat(toArray(results));
                readEntries();
            }
        }, fsErrorHandler);
    };

    readEntries();
};

// // Change to Camera Page
cameraButton.onclick = function()
{
    $(".live").show();
    $("#cameraBtnGroup").show();
    $("#reviewHeader").hide();
    $("#singleReview").hide();
    // canvas.style.display = 'block';
    reviewButton.style.display = 'block';
    reviewArea.style.display = 'none';
    reviewFooter.style.display = 'none';
    // singleReviewArea.style.display = 'none';
    cameraButton.style.display = 'none';
    $("#key_btn").show();
    $("#right_menu").show();
    if ($('.zoom_control_mid .labar').slider("option", "value") != 1){
        $("#minimap").removeClass("zoom1x");
    }
};

// Snapshot
snapshotButton.onclick = function()
{
    // Get Settings Value First
    appFS.root.getDirectory('Settings', {create: true}, function(dirEntry)
    {
        dirEntry.getFile('settings.txt', {}, function(fileEntry)
        {
            fileEntry.file(function(file)
            {
                var readFile = new FileReader();

                readFile.onloadend = function(e)
                {
                    var settingJSON = JSON.parse(this.result);
                    snapshotPreviewTime = settingJSON.snapshotPreviewTime;
                    snapshotTimer = settingJSON.snapshotTimer;
                    prepareSnapshot();
                };

                readFile.readAsText(file);
            }, fsErrorHandler);
        }, prepareSnapshot);
    });
};

function prepareSnapshot()
{
    if(countdowning || saveProcess)
    {
        return false;
    }
    else
    {
        setSnapshotTimer = snapshotTimer * 1000;

        // start countdown
        if(snapshotTimer > 0 && recording == false){
            snapshotCountdown(snapshotTimer);
            $('#snapshotTimer').addClass('on').html(snapshotTimer);
            $('.btn-snapshot').addClass('disabled');
        } else {
            doSnapshot();
        }
    }
}

function snapshotCountdown(countDownTime)
{
    var time = (!countDownTime) ? snapshotTimer : countDownTime;
    var doCountDown = setInterval(function(){
        countdowning = true;
        time--;
        // console.log(time);
        $('#snapshotTimer').html(time);
    },1000);
    var endTime = countDownTime * 1000;
    var clear = setTimeout(function(){
        clearInterval(doCountDown);
        $('#snapshotTimer').removeClass('on');
        $('.btn-snapshot').removeClass('disabled');
        countdowning = false;
        doSnapshot();

    }, endTime );
}

function doSnapshot()
{

    $('.btn-snapshot').addClass('disabled');

    if(saveProcess == true)
    {
        return false;
    }

    saveProcess = true;
    getContext();

    // Image Source
    var imageUrl = canvas.toDataURL(imageType);

    //var imagePreview = document.getElementById('image-preview');

    // Create and Setup Review Div
    var imageDiv = document.createElement('div');
    imageDiv.setAttribute('style', 'float:left; margin: 10px 10px');

    // Create and Setup Review image
    var snapshot = document.createElement('img');
    snapshotImgID += 1;
    // snapshot.style.width = '150px' //parseInt(imageWidth*0.3)+'px';
    // imageRatio = 150/imageWidth;
    // snapshot.style.height = parseInt(imageHeight*imageRatio)+'px';
    snapshot.src = imageUrl;
    //imageDiv.appendChild(snapshot);

    currentDateTime = getDateTime();
    var saveFileName = currentDateTime+'.'+imageExt;



    // snapshot flash
    var f = document.getElementById('flasher');
    f.classList.add('flash');
    var flash = setTimeout(function() {
        f.classList.remove('flash');
    }, 150);

    // Instant Preview: create temp preview image
    $('.instant_img').remove();
    function instantPreview(){

        var _previewTime = snapshotPreviewTime,
            _overlay = $('.live'),
            _w = $('#stage').width(),
            _instant = (_previewTime == 0) ? false : true;

        if(_instant)
        {
            // init temp preview image
            var setPreviewImg = setTimeout(function(){
                $('<img id="instant_preview" class="instant_img" src='+imageUrl+'>').css('width',_w).prependTo('#stage');
                centerVideo(); // adjust tmp image's positon
            },150);

            // kill temp preview image
            _overlay.css('zIndex',200);

            setTimeout(function(){
                _overlay.css('zIndex',1);
                $('#instant_preview').fadeOut(200);
            }, _previewTime * 1000 );
        }

    }
    instantPreview();

    // countdown end
    var c = document.getElementById('snapshotTimer');
    c.classList.remove('on');

    // Write Image to File System
    /* HTML5 filesystem API */
    appFS.root.getFile(saveFileName, {create: true}, function(fileEntry)
    {
        fileEntry.createWriter(function(fileWriter)
        {
            fileWriter.onwriteend = function(e) {
                // console.log('Write completed.');

                // Waiting 1 seconds
                setTimeout(function(){
                    saveProcess = false;
                    $('.btn-snapshot').removeClass('disabled');
                },1000);
            };

            fileWriter.onerror = function(e) {
                console.log('Write failed: ' + e.toString());
                saveProcess = false;
            };

            // Create a new Blob and write it to jpg file.
            // console.log('snapshot src: '+snapshot.src);
            var blob = new Blob([snapshot.src], {type: imageType});
            fileWriter.write(blob);
        }, fsErrorHandler);
    }, fsErrorHandler);
}

// Recording Button
function toggleActivateRecordButton()
{
    recordButton.value = recordButton.disabled ? 'Record' : 'Recording...';
    recordButton.classList.toggle('recording');
    recordButton.disabled = !recordButton.disabled;
}

// Recording Count
function appendZero(v)
{
    if(Math.floor(v) < 10){
        return "0" +""+ v;
    } else {
        return v;
    }
}
var timer = $('#recordingTimer');
var startRecord;
var count = function(flag){
    if(flag){
        var _time = recordTime;
        ++_time;

        var hour = appendZero(Math.floor(_time / 3600));
        var min = appendZero((Math.floor(_time / 60) > 59) ? 0 : Math.floor(_time / 60));
        var sec = appendZero(Math.round(_time % 60));

        timer.html( hour + ':' + min + ':' + sec );
        recordTime = _time;
    } else {
        timer.html('00:00:00');
    }
}

// Start Recording
var mediaRecorder, videoUrl, saveFileName, recordRTC;

function getUserMediaError() {
    console.log('getUserMedia() failed.');
}

// Single Review
function singleReview(imageData)
{
    $("#reviewHeader").show();
    $("#singleReview").css("display","table");
    $("#singleViewRotate").show();
    reviewArea.style.display = 'none';

    // Has setting file
    if(entries[0].isFile == false)
    {
        totalFileAmt = entries.length -1;
        startFileID = 2;
        hasSetting = true;
        controlIdDiff = 0;
    }
    else
    {
        totalFileAmt = entries.length;
        startFileID = 1;
        hasSetting = false;
        controlIdDiff = 1;
    }

    switch(imageData['controlID'])
    {
        case 0:
            imageData['controlID'] = totalFileAmt;
        break;
        case totalFileAmt && hasSetting == false:
            imageData['controlID'] = 1;
        break;
        case totalFileAmt+1:
            imageData['controlID'] = 1;
        break;
        default:
            imageData['controlID'] = imageData['controlID'];
        break;
    }

    entryID = imageData['controlID'] - controlIdDiff;

    // Single Review Header
    document.getElementById('single-image-num').innerHTML = imageData['controlID'] + ' / ' + totalFileAmt;

    // console.log('entry: ', entries);
    if(hasSetting == true)
    {
        imageData['imageID'] = 'reviewImg_'+entryID;
    }
    else
    {
        imageData['imageID'] = 'reviewImg_'+imageData['controlID'];
    }
    imageData['fileName'] = entries[entryID].name;
    singleFileExt = entries[entryID].name.split('.')[1];
    imageData['fileType'] = (singleFileExt == 'jpg') ? 'image' : 'video';

    if(imageData['fileType'] == 'image')
    {
        // Make sure zoom, rotate and save as pdf button display
        $('.btn-zoom-slider').show();
        $('.btn-rotate-loop').show();
        $('.btn-pdf').show();

        // Reset single review rotate and zoom value
        singleRotateValue = 0;
        singleZoomValue = 1;
        singleReviewCanvas.style[prop] = '';

        document.getElementById('singleReviewCanvasArea').style.display = 'table-cell';

        // Read Image Data
        singleImageObj = new Image();

        image = document.getElementById(imageData['imageID']);
        singleImageObj.src = image.src;

        // Set Canvas Variables
        singleCanvasWidth = singleImageObj.width;
        singleCanvasHeight = singleImageObj.height;

        imageRatio = singleCanvasWidth / singleCanvasHeight;

        resizeWidth = window.innerWidth - 50;
        resizeHeight = window.innerHeight;
        var newWidthToHeight = resizeWidth / resizeHeight;

        if(newWidthToHeight > imageRatio)
        {
            singleCanvasHeight = resizeHeight;
            singleCanvasWidth = singleCanvasHeight * imageRatio;
        }
        else
        {
            singleCanvasWidth = resizeWidth;
            singleCanvasHeight = singleCanvasWidth / imageRatio;
        }

        document.getElementById('singleReviewCanvas').style.width = singleCanvasWidth+'px';
        document.getElementById('singleReviewCanvas').style.height = singleCanvasHeight+'px';

        singleReviewCanvas.width = singleCanvasWidth;
        singleReviewCanvas.height = singleCanvasHeight;
        singleReviewStartX = (-(singleCanvasWidth)/2)+0;
        singleReviewStartY = (-(singleCanvasHeight)/2)+0;
        singleReviewCtx.translate(singleReviewCanvas.width/2, singleReviewCanvas.height/2);

        singleImageObj.onload = function()
        {
            singleReviewCtx.drawImage(singleImageObj, singleReviewStartX, singleReviewStartY, singleCanvasWidth, singleCanvasHeight);
        };

        // Setup Display Window Size
        if(document.webkitIsFullScreen)
        {
            singleReviewArea.setAttribute('width', singleImageObj.width);
        }
        else
        {
            // window.resizeTo(singleImageObj.width, singleImageObj.height);
        }

    }

    if(document.getElementById('tempDivID') != null)
    {
        document.getElementById('tempDivID').remove();
        document.getElementById('tempFileType').remove();
        document.getElementById('tempFileName').remove();
    }

    // Create tempDivID to save review element's id
    var tempImageDivID = document.createElement('input');
    tempImageDivID.type = 'text';
    tempImageDivID.style.display = 'none';
    tempImageDivID.id = 'tempDivID';
    tempImageDivID.setAttribute('value',imageData['controlID']);

    document.getElementById('singleReview').appendChild(tempImageDivID);

    // Create tempFileTypeDivID to save review element's file type
    var tempFileTypeDivID = document.createElement('input');
    tempFileTypeDivID.type = 'text';
    tempFileTypeDivID.style.display = 'none';
    tempFileTypeDivID.id = 'tempFileType';
    tempFileTypeDivID.setAttribute('value',imageData['fileType']);

    document.getElementById('singleReview').appendChild(tempFileTypeDivID);

    // Create tempFileName to save review element's file name
    var tempFileName = document.createElement('input');
    tempFileName.type = 'text';
    tempFileName.style.display = 'none';
    tempFileName.id = 'tempFileName';
    tempFileName.setAttribute('value',imageData['fileName']);

    document.getElementById('singleReview').appendChild(tempFileName);
}

// Single View Prevous Click
document.getElementById('single-image-prev').addEventListener('click', function()
{
    prevEntryID = parseInt(document.getElementById('tempDivID').value) - 1;
    var prevImageData = [];
    prevImageData['controlID'] = prevEntryID;
    singleReview(prevImageData);
});

// // Single View Next Click
document.getElementById('single-image-next').addEventListener('click', function()
{
    nextEntryID = parseInt(document.getElementById('tempDivID').value) + 1;
    var nextImageData = [];
    nextImageData['controlID'] = nextEntryID;
    singleReview(nextImageData);
});

$('#back-to-review').on('click', function () {
    $('#changeToReview').trigger('click');
});

function getSingleContext()
{
    singleTempCanvas = document.createElement('canvas');
    singleTempCtx = singleTempCanvas.getContext('2d');

    if( ((singleRotateValue >= 90 && singleRotateValue < 180) || (singleRotateValue >= 270 && singleRotateValue < 360)) ||
        ((singleRotateValue <= -90 && singleRotateValue > -180) || (singleRotateValue <= -270 && singleRotateValue > -360)))
    {
        // canvas.width = h*zoomValue;
        // canvas.height = w*zoomValue;
        singleTempCanvas.width = singleImageObj.height;
        singleTempCanvas.height = singleImageObj.width;
    }
    else
    {
        // canvas.width = w*zoomValue;
        // canvas.height = h*zoomValue;
        singleTempCanvas.width = singleImageObj.width;
        singleTempCanvas.height = singleImageObj.height;
    }

    singleTempCtx.clearRect(0, 0, singleTempCanvas.width, singleTempCanvas.height);

    singleReviewStartX = (-(singleImageObj.width)/2)+0;
    singleReviewStartY = (-(singleImageObj.height)/2)+0;
    singleTempCtx.translate(singleTempCanvas.width/2, singleTempCanvas.height/2);

    // Rotate
    singleRealRotate = singleRotateValue*Math.PI/180;
    singleTempCtx.rotate(singleRealRotate);

    // Draw image to temp canvas
    singleTempCtx.drawImage(singleImageObj, singleReviewStartX, singleReviewStartY, singleImageObj.width, singleImageObj.height);

    return singleTempCtx;
}

$("#btnSavePDF").click(function(){
    //single save pdf
    if ($("#singleReview").is(":visible")){
        var pdfDoc = new jsPDF('landscape', 'pt', 'a3');

        getSingleContext();
        singleImageSrc = singleTempCanvas.toDataURL(imageType);

        var pdfImage = new Image();
        pdfImage.src = singleImageSrc;

        // USAGE: jsPDFAPI.addImage = function(imageData, format, x, y, w, h, alias, compression)
        pdfImage.onload = function(){
            pdfStartX = parseInt((1190 - pdfImage.width) / 2);
            pdfStartY = parseInt((850 - pdfImage.height) / 2);
            pdfDoc.addImage(singleImageSrc, 'JPEG', pdfStartX, pdfStartY, pdfImage.width, pdfImage.height);

            currentDateTime = getDateTime();
            var saveFileName = currentDateTime + '.pdf';
            var pdfContent = pdfDoc.output('bloburi');
            var link = document.createElement('a');
            link.download = saveFileName;
            link.href = pdfContent;
            link.target = '_blank';
            link.click();
        };
    } else if ($("#reviewArea").is(":visible")) { //review save pdf
        var pdfDoc = new jsPDF('landscape', 'pt', 'a3');

        // Check selected file type
        var checkedImageArray = $('input[name=imageCheckBox]:checked');
        if (checkedImageArray.length > 0) {
            for (var imageIndex = checkedImageArray.length - 1; imageIndex >= 0; imageIndex--) {
                entrySrc = checkedImageArray[imageIndex].nextSibling.src;

                // Get image demension
                var pdfImage = new Image();
                pdfImage.src = entrySrc;

                // USAGE: jsPDFAPI.addImage = function(imageData, format, x, y, w, h, alias, compression)
                pdfStartX = parseInt((1190 - pdfImage.width) / 2);
                pdfStartY = parseInt((850 - pdfImage.height) / 2);
                pdfDoc.addImage(entrySrc, 'JPEG', pdfStartX, pdfStartY, pdfImage.width, pdfImage.height);

                if (imageIndex > 0) //(checkedImageArray.length - 1))
                {
                    pdfDoc.addPage();
                }
            }

            currentDateTime = getDateTime();
            var saveFileName = currentDateTime + '.pdf';
            var pdfContent = pdfDoc.output('bloburi');
            var link = document.createElement('a');
            link.download = saveFileName;
            link.href = pdfContent;
            link.target = '_blank';
            link.click();
        }
    }
});

$("#btnSaveImg").click(function () {
    //single save
    if ($("#singleReview").is(":visible")) {
        tempFileType = document.getElementById('tempFileType').value;

        if (tempFileType == 'image') {
            getSingleContext();
            singleImageSrc = singleTempCanvas.toDataURL(imageType);

            var link = document.createElement('a');
            tempFileName = document.getElementById('tempFileName').value;
            link.download = tempFileName; //currentDateTime+'.'+imageExt;
            link.href = singleImageSrc;
            link.target = "_blank";
            link.click();
            console.log('link href: ', link.href);
        }
        else if (tempFileType == 'video') {
            entrySrc = document.getElementById('singleReviewVideo').src;

            var link = document.createElement('a');
            tempFileName = document.getElementById('tempFileName').value;
            link.download = tempFileName; //document.getElementById(processVideoCheckID).value;
            link.href = entrySrc;
            link.click();
            console.log('tempFileName: ', tempFileName);
        }
    } else if ($("#reviewArea").is(":visible")) { //review save pdf
        for (var saveImageID = 1; saveImageID <= snapshotImgID; saveImageID++) {
            checkedID = 'reviewImgChkBox_' + saveImageID;
            imageID = 'reviewImg_' + saveImageID;
            if (document.getElementById(checkedID) != null && document.getElementById(checkedID).checked == true) {
                entrySrc = document.getElementById(imageID).src;
                var link = document.createElement('a');
                link.download = document.getElementById(checkedID).value;
                link.href = entrySrc;
                link.target = "_blank";
                link.click();
                // console.log('entrySrc: ', entrySrc);
                // console.log('link: ', link);
            }
        }
    }
});

$("#btnDelImg").click(function () {
    closePopup();
    $("#confirm_dialog").show();
});

$("#btnConfirm").click(function(){
    if ($("#singleReview").is(":visible")) {
        processID = document.getElementById('tempDivID').value;
        removeImageDivID = 'reviewImgDiv_' + processID;
        removeCheckedID = 'reviewImgChkBox_' + processID;
        removeEntryName = document.getElementById(removeCheckedID).value;

        appFS.root.getFile(removeEntryName, { create: false }, function (fileEntry) {
            fileEntry.remove(function () {
                // console.log('File '+removeEntryName+' removed.');
                document.getElementById(removeImageDivID).remove();
                reviewButton.click();
            }, fsErrorHandler);
        }, fsErrorHandler);
    } else if ($("#reviewArea").is(":visible")) { //review save pdf
        for (var saveImageID = 1; saveImageID <= snapshotImgID; saveImageID++) {
            checkedID = 'reviewImgChkBox_' + saveImageID;
            imageDivID = 'reviewImgDiv_' + saveImageID;
            if (document.getElementById(checkedID) != null && document.getElementById(checkedID).checked == true) {
                entryName = document.getElementById(checkedID).value;
                // document.getElementById(imageDivID).remove();
                $("#" + imageDivID).parent("dl").remove();
                appFS.root.getFile(entryName, { create: false }, function (fileEntry) {
                    fileEntry.remove(function () {
                        // console.log('File '+entryName+' removed.');
                    }, fsErrorHandler);
                }, fsErrorHandler);
            }
        }
        closePopup();
    }
});

$("#btnCancel").click(function () {
    closePopup();
});

$("#singleViewRotate").click(function () {
    singleRotateValue += $(this).data('value');
    singleRotateValue = (singleRotateValue <= -360) ? 0 : singleRotateValue;
    singleReviewCanvas.style[prop] = 'rotate(' + singleRotateValue + 'deg) scale(' + singleZoomValue + ')';

    // Save rotate action
    getSingleContext();
    singleImageSrc = singleTempCanvas.toDataURL(imageType);
    saveFileName = document.getElementById('tempFileName').value;
    _saveImageID = document.getElementById('tempDivID').value;
    _imageID = 'reviewImg_' + _saveImageID;
    document.getElementById(_imageID).src = singleImageSrc;

    // Write New Image to File System
    appFS.root.getFile(saveFileName, { create: true }, function (fileEntry) {
        fileEntry.createWriter(function (fileWriter) {
            // Delete file content first
            fileWriter.truncate(0);

            // Wait 500 milliseconds then save new content
            setTimeout(function () {
                fileWriter.onwriteend = function (e) {
                    // console.log('Write completed.');
                    // currentDateTime = getDateTime();
                    // console.log('single review rotate save complete time: ', currentDateTime);
                };

                fileWriter.onerror = function (e) {
                    console.log('Write failed: ' + e.toString());
                };

                // Create a new Blob and write it
                var blob = new Blob([singleImageSrc], { type: imageType }); //singleImageSrc], {type: imageType});
                fileWriter.write(blob);
            }, 500);
        }, fsErrorHandler);
    }, fsErrorHandler);
});