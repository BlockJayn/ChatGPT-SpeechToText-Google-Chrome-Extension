const extensionIsActiveCheckbox = document.getElementById("extensionIsActive");

// Initialize extensionIsActive in storage if not present
chrome.storage.sync.get("extensionIsActive", ({ extensionIsActive }) => {
  const isChecked = extensionIsActive !== false;
  extensionIsActiveCheckbox.checked = isChecked;
  chrome.storage.sync.set({ extensionIsActive: isChecked });
});

// Event listener for extensionIsActive toggle
extensionIsActiveCheckbox.addEventListener("click", () => {
  const isChecked = extensionIsActiveCheckbox.checked;
  chrome.storage.sync.set({ extensionIsActive: isChecked });
});

// Default commands
const defaultCommands = {
  commandEnter: "enter",
  commandBack: "backwards",
  commandReplace: "replace X with Y",
  commandClear: "clear input",
  commandStop: "stop",
};

// Custom commands - initially set to default commands
const commands = { ...defaultCommands };

// Get stored custom commands from Chrome storage
function getStorageCommands() {
  chrome.storage.sync.get(defaultCommands, (result) => {
    Object.assign(commands, result);
    updateInputFields();
  });
}

getStorageCommands();

// Update input fields with corresponding command values
function updateInputFields() {
  for (const [commandKey, commandValue] of Object.entries(commands)) {
    const inputField = document.getElementById(commandKey);
    if (!inputField) {
      console.error(`Input field not found: ${commandKey}`);
      continue;
    }
    inputField.value = commandValue;
    inputField.addEventListener("change", handleInputChange);
  }
}

// Handle input field change event
function handleInputChange(event) {
  const inputElementIdKey = event.target.id;

  if (inputElementIdKey === "commandReplace") {
    event.target.value = "";
    event.target.setAttribute("disabled", "");
    alert("Changes for this command are not allowed and will not take effect.");
    return;
  }

  const inputValue =
    event.target.value.trim() || defaultCommands[inputElementIdKey];
  chrome.storage.sync.set({ [inputElementIdKey]: inputValue });
}

/**********************************************
 *   For each key in Object, get corresponding input field with same ID
 *   and add Eventlistener to set values in localStorage onChange
 *********************************************/

Object.keys(commands).forEach((inputElementIdKey) => {
  const inputField = document.getElementById(inputElementIdKey);

  if (!inputField) {
    alert(`Input-Field not found: ${inputElementIdKey}`);
  } else {
    inputField.addEventListener("change", handleInputChange);
  }
});

/////////////////////// Unused /////////////////////////////

// const btn = document.getElementById("btn");

// const callStuff = (tab) => {
//   const { id, url } = tab;
//   //   if (url.indexOf("https://github.com/") > -1) {
//   chrome.scripting.executeScript({
//     target: { tabId: id, allFrames: true },
//     files: ["popup-content.js"],
//   });
//   console.log(`Loading: ${url}`);
//   //   }
// };

// const getCurrentTab = async () => {
//   let queryOptions = { active: true };
//   let [tab] = await chrome.tabs.query(queryOptions);
//   return tab;
// };

// // btn.onclick = function() {
// //   // alert("Button is clicked");
// //   btn.innerHTML = "Running";

// //   getCurrentTab().then((tab) => {
// //     callStuff(tab);
// //   });
// // };
