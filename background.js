// Change icon dependend on current tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url.includes("chat.openai.com")) {
    chrome.action.setIcon({
      tabId: tabId,
      path: {
        "16": "images/icons/icon-16.png",
        "48": "images/icons/icon-48.png",
        "128": "images/icons/icon-128.png",
      },
    });
  } else {
    chrome.action.setIcon({
      tabId: tabId,
      path: {
        "16": "images/icons/icon-gray-16.png",
        "48": "images/icons/icon-gray-48.png",
        "128": "images/icons/icon-gray-128.png",
      },
    });
  }
});
