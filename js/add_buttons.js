var browser = browser || chrome;
var isFirefox = (navigator.userAgent.indexOf("Firefox") != -1);

function removeButtons() {
    let buttons = document.getElementsByClassName("searchanimebutton");
    while (buttons.length > 0) {
        buttons[0].parentNode.removeChild(buttons[0]);
    };
}

function setupButton(button, title){
    let imageUrl = browser.runtime.getURL("assets/icons/icon-256.png");
    let imageUrlHover = browser.runtime.getURL("assets/icons/icon-256-highlighted.png");
    button.src = imageUrl;
    button.alt = title;
    button.style.width = "32px";
    button.style.cursor = "pointer";
    button.onmouseover = function(){this.src = imageUrlHover};
    button.onmouseout = function(){this.src = imageUrl};
    button.onclick = function(){loadDataAndSearch(this.alt)};
    return button;
}

function addButtons() {
    let allAnimes = document.getElementsByClassName("data title clearfix");
    let existingButtons = document.getElementsByClassName("searchanimebutton");
    if (existingButtons.length < allAnimes.length) {
        for (let anime of allAnimes) {
            if (anime.parentElement.getElementsByClassName("searchanimebutton").length === 0) {
                let title = anime.firstChild.innerHTML;
                let button = document.createElement("img");
                button = setupButton(button, title);
                let malvsTd = document.createElement("td");
                malvsTd.className = "data searchanimebutton";
                malvsTd.appendChild(button);
                anime.parentElement.appendChild(malvsTd);
            }
        }
    }
}

async function loadDataAndSearch(title) {
    function startSearch(savedValueAL) {
        let activeList = [];
        savedValueAL && (activeList = JSON.parse(savedValueAL));
        if (activeList.length == 0) {
            activeList.push("https://www.crunchyroll.com/search?from=&q=");
        }
        for (let url of activeList) {
            window.open(url + title);
        }
    }
    if (isFirefox) {
        startSearch((await browser.storage.sync.get("activelist")).activelist);
    } else {
        browser.storage.sync.get(["activelist"], result => {startSearch(result.activelist)});
    }
}

const regexp = RegExp("myanimelist.net/animelist//*")
let curUrl = window.location.href;
if (regexp.test(curUrl)) {
    if (document.getElementsByClassName("malvs-header").length === 0) {
        let tableHeader = document.getElementsByClassName("list-table-header")[0]
        let malvsHeader = document.createElement("th");
        malvsHeader.className = "header-title malvs-header";
        malvsHeader.innerHTML ='<a class="link hover_info">MAL VS</a>';
        tableHeader.appendChild(malvsHeader);
    };
    removeButtons();
    setInterval(addButtons, 1000);
} else {
    for (let malvsButton of document.getElementsByClassName("searchanimebutton")) {
        malvsButton.parentNode.removeChild(malvsButton);
    }
    let titleDiv = document.getElementsByClassName("h1-title")[0]
    titleDiv.style.verticalAlign = "middle";
    titleDiv.style.float = "none";
    let targetElement = document.getElementsByClassName("h1 edit-info")[0];
    targetElement.style.minHeight = "32px";
    let title;
    try {
        title = document.getElementsByClassName("title-name h1_bold_none")[0].firstElementChild.textContent;
    } catch(error) {
        console.log(error);
        title = document.getElementsByClassName("title-name")[0].innerHTML;
    }
    let malvsDiv = document.createElement("div");
    malvsDiv.className = "searchanimebutton";
    malvsDiv.style.display = "table-cell";
    malvsDiv.style.verticalAlign = "middle";
    malvsDiv.style.width = "48px";
    malvsDiv.style.transform = "scaleX(-1)";
    malvsDiv.style.textAlign = "right";
    let button = document.createElement("img");
    button = setupButton(button, title);
    malvsDiv.appendChild(button);
    targetElement.prepend(malvsDiv);
}
