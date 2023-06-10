/**********************************************
 *   extensionIsActive: Check Storage and handle
 *********************************************/
let extensionIsActiveCheckbox = document.getElementById("extensionIsActive");

chrome.storage.sync.get("extensionIsActive").then((result) => {
  if (result.extensionIsActive === undefined) {
    // if not in storage set the value initial to true
    chrome.storage.sync.set({
      extensionIsActive: true,
    });

    extensionIsActiveCheckbox.checked = true;
  }
  if (result.extensionIsActive === false) {
    extensionIsActiveCheckbox.checked = false;
  }
  if (result.extensionIsActive === true) {
    extensionIsActiveCheckbox.checked = true;
  }
});

/**********************************************
 *   Eventlistener for Toggle: extensionIsActive
 *********************************************/

extensionIsActiveCheckbox.addEventListener("click", (event) => {
  const isChecked = extensionIsActiveCheckbox.checked;

  if (isChecked) {
    chrome.storage.sync.set({
      extensionIsActive: true,
    });
  } else {
    chrome.storage.sync.set({
      extensionIsActive: false,
    });
  }
});

/**********************************************
 *   Custom Commands:
 *   get from localStorage or set default value
 *********************************************/

// Default commands
const defaultCommands = {
  commandEnter: "enter",
  commandBack: "backwards",
  commandReplace: "replace X with Y",
  commandClear: "clear input",
  commandStop: "stop",
};

// Custom Commands - initially set to default commands
const commands = { ...defaultCommands };

// Keys-Array of all commands
const defaultCommandIDs = [];

Object.keys(defaultCommands).forEach((key) => {
  defaultCommandIDs.push(key);
});

// Get stored custom-commands from Chrome-Storage
function getStorageCommands() {
  chrome.storage.sync
    .get(defaultCommandIDs)
    .then((result) => {
      // result returns an object with all custom commands that have been stored
      // For each stored key/value-pair, update "commands"-object to stored value
      Object.keys(result).forEach((resultKey) => {
        commands[resultKey] = result[resultKey];
      });
    })
    // Then update all input fields with all values in "commands"-Object
    .then(() => {
      // document.getElementsByTagName("body")[0].innerHTML =
      //   "commands:" + JSON.stringify(commands);

      updateInputFields();
    });
}

getStorageCommands();

/**********************************************
 *   For each key in Object, get corresponding input field with same ID
 *   and get value from localStorage + set values to input field
 *********************************************/

function updateInputFields() {
  Object.keys(commands).forEach((inputElementIdKey) => {
    const inputField = document.getElementById(inputElementIdKey);

    if (!inputField) {
      alert(`Input-Field not found: ${inputElementIdKey}`);
    }

    if (inputField) {
      inputField.value = commands[inputElementIdKey];
    }
  });
}

/**********************************************
 *   For each key in Object, get corresponding input field with same ID
 *   and add Eventlistener to set values in localStorage onChange
 *********************************************/

Object.keys(commands).forEach((inputElementIdKey) => {
  const inputField = document.getElementById(inputElementIdKey);

  if (!inputField) {
    alert(`Input-Field not found: ${inputElementIdKey}`);
  }

  if (inputField) {
    // Add EventListener
    inputField.addEventListener("change", (event) => {
      // Prevent changes for commandReplace
      if (event.target.id === "commandReplace") {
        document.getElementById(event.target.id).value = "";
        document.getElementById(event.target.id).setAttribute("disabled", "");
        alert(
          "Changes for this command are not allowed and will not take effect."
        );
        return;
      }

      // Set changed value in localStorage
      if (!event.target.value) {
        // Set to default in localStorage if no value
        chrome.storage.sync.set({
          [inputElementIdKey]: defaultCommands[inputElementIdKey],
        });
      } else {
        // Add to localStorage
        chrome.storage.sync.set({
          [inputElementIdKey]: event.target.value.trim(),
        });
      }
    });
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
