# AZ Problem Tracker

A Chrome Extension for **MAANG.in** that lets users bookmark coding problems and instantly generate AI-powered hints using **Google Gemini**. The extension seamlessly integrates with MAANG.in, making it easy to organize practice problems and get guidance without revealing full solutions.

---

## ✨ Features

- 📌 Bookmark coding problems directly from MAANG.in
- 💾 Persist bookmarks using Chrome Storage Sync API
- 🔍 Search bookmarked problems by title
- ▶️ Open saved problems in a single click
- 🗑️ Delete bookmarks instantly
- 🔄 Automatically adapts to MAANG.in's Single Page Application (SPA) navigation using `MutationObserver`
- 🤖 Generate concise AI hints for the current problem using **Google Gemini 1.5 Flash**
- ⚡ Built with Chrome Extension Manifest V3

---

## 🛠️ Tech Stack

- JavaScript (ES6)
- HTML5
- CSS3
- Chrome Extension Manifest V3
- Chrome Storage API
- Google Gemini API
- DOM Manipulation
- MutationObserver

---

## 📂 Project Structure

```text
.
├── assets/
│   ├── bookmark.png
│   ├── delete.png
│   ├── play.png
│   ├── edit.png
│   ├── save.png
│   └── ext-icon.png
├── manifest.json
├── content.js
├── popup.html
├── popup.css
├── popup.js
├── background.js
├── LICENSE
└── README.md
```

---

## 🚀 How It Works

### Bookmarking

1. Detects when a MAANG.in problem page is opened.
2. Dynamically inserts a bookmark button beside the problem controls.
3. Stores bookmarked problems using Chrome Storage Sync.
4. Displays all saved problems in the extension popup.
5. Allows users to search, open, and remove bookmarks.

### AI Hint Generation

1. Opens the currently active MAANG.in problem.
2. Extracts the problem title and statement from the webpage.
3. Sends the extracted content to **Google Gemini 1.5 Flash**.
4. Displays a concise hint focused on the approach instead of revealing the complete solution.

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/<repository-name>.git
```

### 2. Get a Gemini API Key

Visit:

https://aistudio.google.com/app/apikey

Create a free API key.

---

### 3. Add your API Key

Open **popup.js** and replace

```javascript
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";
```

with

```javascript
const GEMINI_API_KEY = "YOUR_API_KEY";
```

---

### 4. Load the Extension

1. Open Chrome.
2. Go to

```
chrome://extensions/
```

3. Enable **Developer Mode**.
4. Click **Load unpacked**.
5. Select the project folder.

The extension is now ready to use.

---

## 💡 Concepts Demonstrated

- Chrome Extension Development (Manifest V3)
- Content Scripts
- Chrome Storage API
- Chrome Runtime Messaging
- DOM Manipulation
- MutationObserver
- Asynchronous JavaScript
- REST API Integration
- Dynamic UI Rendering

---

## 📌 Future Improvements

- Bookmark folders and categories
- Difficulty and topic filters
- Solved/Unsolved tracking
- Import & Export bookmarks
- Cloud synchronization
- Multiple AI providers
- Custom prompt settings

---

## 📄 License

This project is licensed under the MIT License.
