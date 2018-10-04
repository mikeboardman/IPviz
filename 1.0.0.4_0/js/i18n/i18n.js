document.getElementById('appName').innerHTML = chrome.i18n.getMessage('appName');
document.getElementById('btnCancelSetting').innerHTML = chrome.i18n.getMessage('btnCancel');
document.getElementById('btnSaveSetting').innerHTML = chrome.i18n.getMessage('btnSave');
document.getElementById('btnRotateReset').innerHTML = chrome.i18n.getMessage('btnReset');
document.getElementById('txtRotate').innerHTML = chrome.i18n.getMessage('btnRotate');
document.getElementById('textResolution').innerHTML = chrome.i18n.getMessage('textResolution');
document.getElementById('textMirror').innerHTML = chrome.i18n.getMessage('textMirror');
document.getElementById('text10Secs').innerHTML = chrome.i18n.getMessage('text10Secs');
document.getElementById('text2Secs').innerHTML = chrome.i18n.getMessage('text2Secs');
document.getElementById('text3Secs').innerHTML = chrome.i18n.getMessage('text3Secs');
document.getElementById('text4Secs').innerHTML = chrome.i18n.getMessage('text4Secs');
document.getElementById('textConfirm').innerHTML = chrome.i18n.getMessage('textDeleteTitle');
document.getElementById('textDeleteWarn').innerHTML = chrome.i18n.getMessage('textDeleteWarn');
document.getElementById('textInstantPreview').innerHTML = chrome.i18n.getMessage('textInstantPreview');
document.getElementById('textMirrorH').innerHTML = chrome.i18n.getMessage('textMirrorH');
document.getElementById('textMirrorV').innerHTML = chrome.i18n.getMessage('textMirrorV');
document.getElementById('textPreviewOff').innerHTML = chrome.i18n.getMessage('textOff');
document.getElementById('textTimerOff').innerHTML = chrome.i18n.getMessage('textOff');
document.getElementById('textReload').innerHTML = chrome.i18n.getMessage('textReload');
document.getElementById('textResolutionWarn').innerHTML = chrome.i18n.getMessage('textResolutionWarn');
document.getElementById('textSelectDevice').innerHTML = chrome.i18n.getMessage('textSelectDevice');
document.getElementById('setting').innerHTML = chrome.i18n.getMessage('textSettings');
document.getElementById('textSnapshotTimer').innerHTML = chrome.i18n.getMessage('textSnapshotTimer');
document.getElementById('btnConfirm').innerHTML = chrome.i18n.getMessage('btnConfirm');
document.getElementById('btnCancel').innerHTML = chrome.i18n.getMessage('btnCancel');
document.getElementById('txtZoom').innerHTML = chrome.i18n.getMessage('textZoom');

// Get Manifest Information
var manifest = chrome.runtime.getManifest();
var appVersion = manifest.version;
document.getElementById('textVersion').innerHTML = chrome.i18n.getMessage('textVersion')+" "+appVersion;

var uiLang = chrome.i18n.getUILanguage();
document.body.className = uiLang;