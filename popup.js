// PopUp.js

const btn = document.getElementById("btn");

const callStuff = (tab) => {
  const { id, url } = tab;
  //   if (url.indexOf("https://github.com/") > -1) {
  chrome.scripting.executeScript({
    target: { tabId: id, allFrames: true },
    files: ["popup-content.js"],
  });
  console.log(`Loading: ${url}`);
  //   }
};

const getCurrentTab = async () => {
  let queryOptions = { active: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
};

// btn.onclick = function() {
//   // alert("Button is clicked");
//   btn.innerHTML = "Running";

//   getCurrentTab().then((tab) => {
//     callStuff(tab);
//   });
// };
