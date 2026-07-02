const bookmarkImgURL = chrome.runtime.getURL("assets/bookmark.png");
const AZ_PROBLEM_KEY = "AZ_PROBLEM_KEY";

const observer = new MutationObserver(() => {
    addBookmarkButton();
});

observer.observe(document.body, {childList: true, subtree: true});

addBookmarkButton();

function onProblemsPage(){
    return window.location.pathname.startsWith('/problems/');
}

function addBookmarkButton() {
    console.log("Trigerring");
    if(!onProblemsPage() || document.getElementById("add-bookmark-button")) return;

    const bookmarkButton = document.createElement('img');
    bookmarkButton.id = "add-bookmark-button";
    bookmarkButton.src = bookmarkImgURL;
    bookmarkButton.style.height = "30px";
    bookmarkButton.style.width = "30px";

    const askDoubtButton = document.getElementsByClassName("coding_ask_doubt_button__FjwXJ")[0];

    // Guard: the target element may not exist yet (page still loading) or
    // may never exist (MAANG.in changed its markup). Without this check,
    // every single DOM mutation would throw a TypeError and the bookmark
    // button would never get inserted.
    if (!askDoubtButton || !askDoubtButton.parentNode) return;

    askDoubtButton.parentNode.insertAdjacentElement("afterend", bookmarkButton);

    bookmarkButton.addEventListener("click", addNewBookmarkHandler);
}

async function addNewBookmarkHandler() {
    const currentBookmarks = await getCurrentBookmarks();

    const azProblemUrl = window.location.href;
    const uniqueId = extractUniqueId(azProblemUrl);
    const titleEl = document.getElementsByClassName("Header_resource_heading__cpRp1")[0];

    // Guard: bail out instead of throwing if the title element isn't found.
    if (!titleEl) return;
    const problemName = titleEl.innerText;

    if(currentBookmarks.some((bookmark) => bookmark.id === uniqueId)) return;

    const bookmarkObj = {
        id: uniqueId,
        name: problemName,
        url: azProblemUrl
    }

    const updatedBookmarks = [...currentBookmarks, bookmarkObj];

    chrome.storage.sync.set({AZ_PROBLEM_KEY: updatedBookmarks}, () => {
        console.log("Updated the bookmarks correctly to ", updatedBookmarks);
    })
}
function extractUniqueId(url) {
    const start = url.indexOf("problems/") + "problems/".length;
    const end = url.indexOf("?", start);
    return end === -1 ? url.substring(start) : url.substring(start, end);
}

function getCurrentBookmarks() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get([AZ_PROBLEM_KEY], (results) => {
            resolve(results[AZ_PROBLEM_KEY] || []);
        });
    });
}

// ----- AI Hint feature -----
// Listens for a request from popup.js asking for the current problem's
// title + statement. chrome.runtime.onMessage is how a popup (a separate
// extension context) talks to a content script running inside the webpage.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_PROBLEM_DATA") {
        sendResponse(extractProblemData());
    }
    // "return true" tells Chrome we might respond asynchronously.
    // Not strictly needed here (extractProblemData is synchronous), but it's
    // a safe default for message listeners.
    return true;
});

// Pulls the problem title and problem statement text out of the page.
// NOTE: MAANG.in's CSS class names can change over time. The title selector
// reuses the same class the bookmark feature already relies on. The
// statement selector tries a few likely class-name patterns and falls back
// to an empty string if none match — adjust this if the page structure changes.
function extractProblemData() {
    const titleEl = document.getElementsByClassName("Header_resource_heading__cpRp1")[0];
    const title = titleEl ? titleEl.innerText : "";

    const statementEl =
        document.querySelector('[class*="problem_statement"]') ||
        document.querySelector('[class*="ProblemStatement"]') ||
        document.querySelector('[class*="statement"]');

    const statement = statementEl ? statementEl.innerText : "";

    return { title, statement };
}
