// HID Control: General function
//十進位轉16進位
function d2h(d) { return d.toString(16); }

// HID Control: Focus
$('#hid-focus').click(function(e) {
    if(_hidDebug == true) {
        console.log('Current HID: ', currentHID);
        console.log('Current Connect HID: ', currentHIDConnectID);
    }

    if(currentHIDConnectID != null)
    {
        // Send set focus command to the connected HID device
        var bytes = new Uint8Array(4);

        bytes[0] = 0x4F;
        bytes[1] = 0x00;
        bytes[2] = 0x00;
        bytes[3] = 0x00;

        if(_hidDebug == true) console.log('bytes value: ', bytes);
        chrome.hid.send(currentHIDConnectID, 2, bytes.buffer, function() {
            if(_hidDebug == true) {
                console.log('send hid command.');
                console.log("Send: chrome runtime error: ", chrome.runtime.lastError);
            }
        });
    }
});

// HID Control: Exposure handel video exposure event
function setVideoExposure(val) {
    // set global val
    exposureValue = val; // in main.js line 102
    // console.log('exposureValue is: '+exposureValue);
    if(val !== null){
        $('#btnExposure').html('AE-' + val );
    } else {
        $('#btnExposure').html('AE-L');
    }

    // Connect to HID Device
    if(_hidDebug == true) console.log('set Exposure Current HID: ', currentHID);
    if(currentHIDConnectID != null)
    {
        // Send set exposure command to the connected HID device
        var bytes = new Uint8Array(4);
        var _exposureHexValue = "0x0"+d2h(exposureValue);
        if(_hidDebug == true) console.log('_exposureHexValue: ', _exposureHexValue);

        bytes[0] = 0x06;
        bytes[1] = _exposureHexValue;
        bytes[2] = 0x00;
        bytes[3] = 0x00;

        if(_hidDebug == true) console.log('bytes value: ', bytes);
        chrome.hid.send(currentHIDConnectID, 2, bytes.buffer, function() {
            if(_hidDebug == true) {
                console.log('send hid command.');
                console.log("Send: chrome runtime error: ", chrome.runtime.lastError);
            }
        });
        initHID();
    }
}

// HID Control: Set AE-Lock
function setVideoAElock(aeLockVal) {
    if(currentHIDConnectID != null) {
        var bytes = new Uint8Array(4);

        bytes[0] = 0x05;
        bytes[1] = (aeLockVal == true) ? 0x01 : 0x00
        bytes[2] = 0x00;
        bytes[3] = 0x00;

        // Send set AE-lock command to the connected HID device
        chrome.hid.send(currentHIDConnectID, 2, bytes.buffer, function() {
            if(_hidDebug == true) {
                console.log('set AElock send hid command: set AE-lock.', bytes);
                console.log("Send: chrome runtime error: ", chrome.runtime.lastError);
            }
        });
    }
}

/**********************************
* HID Listener
***********************************/

// HID Control: Listen hardware exposure button press event
function listenVideoExposureBtn() {
    if(currentHIDConnectID != null)
    {
        var bytes = new Uint8Array(4);

        bytes[0] = 0x00;
        bytes[1] = 0x06;
        bytes[2] = 0x00;
        bytes[3] = 0x00;

        // Send query exposure command to the connected HID device
        chrome.hid.send(currentHIDConnectID, 2, bytes.buffer, function() {
            if(_hidDebug == true) {
                console.log('send hid command: get exposure.', bytes);
                console.log("Send: chrome runtime error: ", chrome.runtime.lastError);
            }
        });

        // Receive HID return value from the connected HID device
        chrome.hid.receive(currentHIDConnectID, function(reportID, returnVal){
            // console.log('reportID: ', reportID);
            var _hidReturn = readArrayBuffer(returnVal);
            // console.log('return value: ', _hidReturn);
            if(_hidDebug == true) console.log('return value: ', _hidReturn);
            if(_hidReturn[0] == 6)
            {
                if(_hidDebug == true) console.log("exposure value: "+_hidReturn[1]);
                document.getElementById('btnExposure').innerHTML = "AE-"+_hidReturn[1];

                // 抓到曝光值之後，刻度也要跟著調整
                $('.slider.exposure').slider({
                    value: parseInt(_hidReturn[1])
                });
            }
        });

        // Revice HID feature report
        // chrome.hid.receiveFeatureReport(currentHIDConnectID, 6, function(featureReportData) {
        //     var _featureReport = readArrayBuffer(featureReportData);
        //     console.log('feature report: ', _featureReport);
        // });
    }
}

setInterval(function() {
    if(_hidDebug == true) {
        console.log('interval');
        console.log('connect id: ', currentHIDConnectID);
    }

    // listenVideoExposureBtn();
}, 2000);