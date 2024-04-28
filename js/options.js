var browser = browser || chrome;
var isFirefox = (navigator.userAgent.indexOf("Firefox") != -1);
var warningTimer;

function save() {
    let activeListArray = [];
    for (option of activeList.options) {
        activeListArray.push(option.value);
    }
    let inactiveListArray = [];
    for (option of inactiveList.options) {
        inactiveListArray.push(option.value);
    }
    browser.storage.sync.set({
        activelist: JSON.stringify(activeListArray),
        inactivelist: JSON.stringify(inactiveListArray)
    });
}

async function load() {
    function createActiveList(savedValueAL) {
        let activeListArray = [];
        savedValueAL && (activeListArray = JSON.parse(savedValueAL));
        if (activeListArray.length == 0) {
            activeListArray.push("https://www.crunchyroll.com/search?from=&q=");
            browser.storage.sync.set({activelist: JSON.stringify(activeListArray)});
        }
        for (item of activeListArray) {
            let newOption = document.createElement("option");
            newOption.value = item;
            newOption.text = item;
            activeList.add(newOption);
        }
    }
    if (isFirefox) {
        createActiveList((await browser.storage.sync.get("activelist")).activelist);
    } else {
        browser.storage.sync.get(["activelist"], result => {createActiveList(result.activelist)});
    }

    function createInactiveList(savedValueIL) {
        let inactiveListArray = [];
        savedValueIL && (inactiveListArray = JSON.parse(savedValueIL));
        for (item of inactiveListArray) {
            let newOption = document.createElement("option");
            newOption.value = item;
            newOption.text = item;
            inactiveList.add(newOption);
        }
    }
    if (isFirefox) {
        createInactiveList((await browser.storage.sync.get("inactivelist")).inactivelist);
    } else {
        browser.storage.sync.get(["inactivelist"], result => {createInactiveList(result.inactivelist)});
    }
}

function warningMessage(target, defaultColor, defaultBackground, defaultText) {
    target.style.color = defaultColor;
    target.style.background = defaultBackground;
    if (target.textContent != '') target.textContent = defaultText;
    target.placeholder = defaultText;
    clearInterval(warningTimer);
}

function warning(target) {
    let defaultColor = target.style.color;
    let defaultBackground = target.style.background;
    let defaultText = target.textContent;
    if (defaultText == '') {
        defaultText = target.placeholder;
        target.placeholder = browser.i18n.getMessage("InvalidUrl");

    } else {
        target.textContent = browser.i18n.getMessage("NothingSelected");
    }
    target.style.color = "white";
    target.style.background = "red";
    warningTimer = setInterval(
        function(){
            warningMessage(target, defaultColor, defaultBackground, defaultText)
        },
        500
    );
}

function isUrl(str) {
    regexp =  /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
    if (regexp.test(str)) {
        return true;
    } else {
        return false;
    }
}

function addNewUrl(targetList) {
    if(!isUrl(inputNewUrl.value)) {
        inputNewUrl.value = "";
        warning(inputNewUrl);
    } else {
        let newOption = document.createElement("option");
        newOption.value = inputNewUrl.value;
        newOption.text = inputNewUrl.value;
        targetList.prepend(newOption);
        inputNewUrl.value = "";
        save();
    }
}

function removeFromList(targetList) {
    if (targetList.value == "") {
        var targetButton;
        if (targetList.id == "active-list") {
            targetButton = btnRemoveFromActive;
        } else {
            targetButton = btnRemoveFromInactive;
        }
        warning(targetButton);
    } else {
        targetList.remove(targetList.selectedIndex);
        save();
    }
}

function moveToInactive() {
    inactiveList.prepend(activeList.options[activeList.selectedIndex]);
    activeList.remove(activeList.selectedIndex);
    save();
}

function moveToActive() {
    activeList.append(inactiveList.options[inactiveList.selectedIndex]);
    inactiveList.remove(inactiveList.selectedIndex);
    save();
}

var activeList = document.getElementById("active-list");
var inactiveList = document.getElementById("inactive-list");
var btnMoveToInactive = document.getElementById("move-to-inactive");
var btnMoveToActive = document.getElementById("move-to-active");
var lblActive = document.getElementById("active-lbl");
var lblInactive = document.getElementById("inactive-lbl");
var inputNewUrl = document.getElementById("new-url-input");
var btnAddToActive = document.getElementById("add-to-active");
var btnAddToInactive = document.getElementById("add-to-inactive");
var btnRemoveFromActive = document.getElementById("remove-from-active");
var btnRemoveFromInactive = document.getElementById("remove-from-inactive");

lblActive.textContent = browser.i18n.getMessage("lblActive");
lblInactive.textContent = browser.i18n.getMessage("lblInactive");
inputNewUrl.placeholder = browser.i18n.getMessage("inputNewUrl");
btnAddToActive.textContent = browser.i18n.getMessage("btnAddToActive");
btnRemoveFromInactive.textContent = browser.i18n.getMessage("btnRemoveFromInactive");

btnAddToActive.onclick = function(){addNewUrl(activeList)};
btnRemoveFromInactive.onclick = function(){removeFromList(inactiveList)};
btnMoveToInactive.onclick = function(){moveToInactive()};
btnMoveToActive.onclick = function(){moveToActive()};

document.addEventListener("DOMContentLoaded", load);
