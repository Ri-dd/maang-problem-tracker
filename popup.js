const AZ_PROBLEM_KEY = "AZ_PROBLEM_KEY";

const assetsURLMap = {
    play: chrome.runtime.getURL("assets/play.png"),
    delete: chrome.runtime.getURL("assets/delete.png")
};

const bookmarkSection = document.getElementById("bookmarks");
const searchInput = document.getElementById("search-input");

let allBookmarks = [];

document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get([AZ_PROBLEM_KEY], (data) => {
        allBookmarks = data[AZ_PROBLEM_KEY] || [];
        viewBookmarks(allBookmarks);
    });

    searchInput.addEventListener("input", filterBookmarks);
});

function filterBookmarks() {
    const query = searchInput.value.toLowerCase();

    const filteredBookmarks = allBookmarks.filter((bookmark) =>
        bookmark.name.toLowerCase().includes(query)
    );

    viewBookmarks(filteredBookmarks);
}

function viewBookmarks(bookmarks) {
    bookmarkSection.innerHTML = "";

    if (bookmarks.length === 0) {
        bookmarkSection.innerHTML = "<i>No Bookmarks to Show</i>";
        return;
    }

    bookmarks.forEach((bookmark) => addNewBookmark(bookmark));
}

function addNewBookmark(bookmark) {
    const newBookmark = document.createElement("div");
    const bookmarkTitle = document.createElement("div");
    const bookmarkControls = document.createElement("div");

    bookmarkTitle.textContent = bookmark.name;
    bookmarkTitle.classList.add("bookmark-title");

    setControlAttributes(assetsURLMap.play, onPlay, bookmarkControls);
    setControlAttributes(assetsURLMap.delete, onDelete, bookmarkControls);

    bookmarkControls.classList.add("bookmark-controls");
    newBookmark.classList.add("bookmark");

    newBookmark.append(bookmarkTitle);
    newBookmark.append(bookmarkControls);

    newBookmark.setAttribute("url", bookmark.url);
    newBookmark.setAttribute("bookmark-id", bookmark.id);

    bookmarkSection.appendChild(newBookmark);
}

function setControlAttributes(src, handler, parentDiv) {
    const controlElement = document.createElement("img");
    controlElement.src = src;
    controlElement.addEventListener("click", handler);
    parentDiv.appendChild(controlElement);
}

function onPlay(event) {
    const problemUrl = event.target.parentNode.parentNode.getAttribute("url");
    window.open(problemUrl, "_blank");
}

function onDelete(event) {
    const bookmarkItem = event.target.parentNode.parentNode;
    const idToRemove = bookmarkItem.getAttribute("bookmark-id");

    deleteItemFromStorage(idToRemove);
}

function deleteItemFromStorage(idToRemove) {
    
    allBookmarks = allBookmarks.filter(
        (bookmark) => bookmark.id !== idToRemove
    );


    chrome.storage.sync.set({ AZ_PROBLEM_KEY: allBookmarks }, () => {
        filterBookmarks();
    });
}

// ----- AI Hint feature (Gemini API) -----

// TODO: Paste your own free Gemini API key here.
// Get one at https://aistudio.google.com/app/apikey
// (This key is only used in the browser to call Gemini directly — it is
// never saved to chrome.storage, matching the "don't store AI responses" rule.)
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";
const GEMINI_API_URL =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const hintButton = document.getElementById("hint-button");
const hintResult = document.getElementById("hint-result");

hintButton.addEventListener("click", getAIHintHandler);

// Runs the whole "Get AI Hint" flow: find the active tab -> ask content.js
// for the problem -> call Gemini -> show the hint (or an error).
async function getAIHintHandler() {
    hintResult.textContent = "Getting hint...";

    try {
        // chrome.tabs.query finds the tab the user currently has open.
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!activeTab || !activeTab.url || !activeTab.url.includes("maang.in/problems/")) {
            hintResult.textContent = "Open a MAANG.in problem page first.";
            return;
        }

        // Message passing: ask the content script (running on the MAANG.in
        // page) to extract and send back the problem's title + statement.
        const problemData = await chrome.tabs.sendMessage(activeTab.id, {
            type: "GET_PROBLEM_DATA"
        });

        if (!problemData || !problemData.title) {
            hintResult.textContent = "Couldn't read the problem from this page.";
            return;
        }

        const hint = await fetchAIHint(problemData.title, problemData.statement);
        hintResult.textContent = hint;
    } catch (error) {
        console.error("AI Hint error:", error);
        hintResult.textContent = "Sorry, couldn't get a hint right now. Please try again.";
    }
}

// Sends the problem to Gemini and returns just the hint text.
async function fetchAIHint(title, statement) {
    const prompt =
`You are an expert DSA tutor.
Give only one helpful hint.
Do NOT provide the complete solution or code.
Do not reveal the full algorithm.
Encourage independent thinking.

Problem Title: ${title}
Problem Statement: ${statement}`;

    const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    });

    if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();

    // Gemini's response nests the reply text inside candidates[0].content.parts[0].text
    const hintText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!hintText) {
        throw new Error("Gemini response did not contain any hint text.");
    }

    return hintText.trim();
}
