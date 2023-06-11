/**********************************************
 *  Check Storage for "extensionIsActive" true/false
 *********************************************/

async function checkIfExetensionActive() {
  const result = await chrome.storage.sync.get("extensionIsActive");
  return result.extensionIsActive;
}

/**********************************************
 *  Main Script for chat.openai.com
 *  - Run only when extension is enabled inside extension-popup
 *********************************************/

async function runIfActive() {
  if (await checkIfExetensionActive()) {
    main();
  }
}
runIfActive();

async function main() {
  /**********************************************
   *   Add Own Custom Stylesheet
   *********************************************/

  const styles = `.pulseRed{background:#ff5252;box-shadow:0 0 0 0 #ff5252;animation:2s infinite pulse-red}@keyframes pulse-red{0%{transform:scale(.95);box-shadow:0 0 0 0 rgba(255,82,82,.7)}70%{transform:scale(1);box-shadow:0 0 0 10px rgba(255,82,82,0)}100%{transform:scale(.95);box-shadow:0 0 0 0 rgba(255,82,82,0)}}body,html{margin:0;height:100%;overflow:hidden}.toast,.toast .close{top:10px;position:absolute}.toast{right:10px;border-radius:12px;background:#fff;padding:10px 15px;box-shadow:0 5px 10px rgba(0,0,0,.1);border-left:6px solid #4070f4;overflow:hidden;transform:translateX(calc(100% + 30px));transition:.5s cubic-bezier(.68, -.55, .265, 1.35)}.toast.active{transform:translateX(0)}.toast .toast-content{display:flex;align-items:center}.toast-content .check{display:flex;align-items:center;justify-content:center;height:35px;width:35px;background-color:#4070f4;color:#fff;font-size:14px;border-radius:50%}.toast-content .message{display:flex;flex-direction:column;margin:0 14px}.message .text{font-size:14px;font-weight:400;color:#666}.message .text.text-1{font-weight:600;color:#333}.toast .close{right:15px;padding:5px;cursor:pointer;opacity:.7}.toast .close:hover{opacity:1}.toast .progress{position:absolute;bottom:0;left:0;height:3px;width:100%;background:#ddd}.toast .progress:before{content:'';position:absolute;bottom:0;right:0;height:100%;width:100%;background-color:#4070f4}.progress.active:before{animation:5s linear forwards progress}@keyframes progress{100%{right:100%}}`;
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);

  /**********************************************
   *   Voice Recognition
   *********************************************/

  const recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true; // Show preliminary results/words while speaking

  /**********************************************
   *   Selectors
   *********************************************/

  let inputField = document.getElementById("prompt-textarea");
  let submitButton = inputField.nextSibling;
  let submitButtonClasslist = submitButton.className;

  /**********************************************
   *   Modify ChatGPT Submit Button
   *********************************************/

  // Function to check for changes in textarea value
  let previousValue = inputField.value;

  function checkTextareaValue() {
    const currentValue = inputField.value;

    if (currentValue !== previousValue) {
      console.log("Textarea value changed:", currentValue);

      if (currentValue === "") {
        submitButton.setAttribute("disabled", "");
        submitButton.style.backgroundColor = "background-color: none;";
      } else {
        submitButton.removeAttribute("disabled");
        submitButton.style.backgroundColor =
          "background-color: rgb(25, 195, 125) !important;";
      }
      previousValue = currentValue;
    }
  }

  // Set up a timer to periodically check for changes
  setInterval(checkTextareaValue, 500);

  /**********************************************
   *   Add Mic Button
   *********************************************/

  let microphoneIsActive = false;

  const micButtonSVGInactive =
    '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 512 512"><title>Use microphone</title><line x1="192" y1="448" x2="320" y2="448" style="fill:none;stroke:#fff;stroke-linecap:square;stroke-miterlimit:10;stroke-width:32px"/><path d="M384,208v32c0,70.4-57.6,128-128,128h0c-70.4,0-128-57.6-128-128V208" style="fill:none;stroke:#fff;stroke-linecap:square;stroke-miterlimit:10;stroke-width:32px"/><line x1="256" y1="368" x2="256" y2="448" style="fill:none;stroke:#fff;stroke-linecap:square;stroke-miterlimit:10;stroke-width:32px"/><path d="M256,320a78.83,78.83,0,0,1-56.55-24.1A80.89,80.89,0,0,1,176,239V128a79.69,79.69,0,0,1,80-80c44.86,0,80,35.14,80,80V239C336,283.66,300.11,320,256,320Z" style="fill:#fff;stroke:#fff;"/></svg>';
  const micButtonSVGActive =
    '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 512 512"><title>Use microphone</title><line x1="192" y1="448" x2="320" y2="448" style="fill:none;stroke:#fff;stroke-linecap:square;stroke-miterlimit:10;stroke-width:32px"/><path d="M384,208v32c0,70.4-57.6,128-128,128h0c-70.4,0-128-57.6-128-128V208" style="fill:none;stroke:#fff;stroke-linecap:square;stroke-miterlimit:10;stroke-width:32px"/><line x1="256" y1="368" x2="256" y2="448" style="fill:none;stroke:#fff;stroke-linecap:square;stroke-miterlimit:10;stroke-width:32px"/><path d="M256,320a78.83,78.83,0,0,1-56.55-24.1A80.89,80.89,0,0,1,176,239V128a79.69,79.69,0,0,1,80-80c44.86,0,80,35.14,80,80V239C336,283.66,300.11,320,256,320Z" style="fill:#a42121;#fff:red;"/></svg>';

  const micButton = document.createElement("button");
  micButton.innerHTML = micButtonSVGInactive;
  micButton.type = "button";
  micButton.id = "micButton";
  micButton.style.cssText +=
    "right: 60px;height: 32px;width: 32px;padding: 0;display: flex;justify-content: center;align-items: center; background-color: rgb(25, 195, 125);";
  micButton.classList = submitButtonClasslist;
  submitButton.parentNode.insertBefore(micButton, submitButton);

  micButton.addEventListener("click", () => {
    if (!microphoneIsActive) {
      startRecognotion(true);
    } else {
      stopRecognotion(true);
    }
  });

  // Listen to Domain-Changes and add Mic-Button again if necessary
  // let prevUrl = undefined;
  // setInterval(() => {
  //   const currUrl = window.location.href;
  //   inputField = document.getElementById("prompt-textarea");
  //   submitButton = inputField.nextSibling;
  //   submitButtonClasslist = submitButton.className;

  //   const foundMicButton = document.getElementById("micButton");
  //   console.log("foundMicButton", foundMicButton);
  //   const foundSubmitButton = document.getElementById("micButton");
  //   console.log("foundMicButton", foundMicButton);

  //   if (!foundMicButton && currUrl != prevUrl) {
  //     console.log("no mic button");
  //     console.log("submitButton New", submitButton);
  //     // URL changed
  //     prevUrl = currUrl;
  //     console.log(`URL changed to : ${currUrl}`);
  //     submitButton.parentNode.insertBefore(micButton, submitButton);
  //   } else {
  //     console.log("mic button is there");
  //   }
  // }, 3000);

  /**********************************************
   *   Functions
   *********************************************/

  /* Start Voice Recognition */

  function startRecognotion(withNotification) {
    microphoneIsActive = true;
    recognition.start();

    inputField.placeholder = "Say something.";
    micButton.classList.add("pulseRed");
    micButton.innerHTML = micButtonSVGActive;

    withNotification
      ? newToast(toast, "Speech to Text has started")
      : undefined;
  }

  /* Stop Voice Recognition */

  function stopRecognotion(withNotification) {
    microphoneIsActive = false;
    recognition.stop();

    inputField.placeholder = "Send a message.";
    micButton.classList.remove("pulseRed");
    micButton.innerHTML = micButtonSVGInactive;

    withNotification
      ? newToast(toast, "Speech to Text has stopped")
      : undefined;
  }

  /* Clear Input Field */

  function clearInput() {
    inputField.value = "";
  }

  /**********************************************
   *   Toast
   *********************************************/

  /* Add Toast Html-Element */

  const toast = document.createElement("div");
  toast.id = "toast";
  toast.className = "toast";

  const toastContent = document.createElement("div");
  toastContent.className = "toast-content";

  const message = document.createElement("div");
  message.className = "message";

  const toastHeadline = document.createElement("span");
  toastHeadline.id = "toastHeadline";
  toastHeadline.className = "text text-1";
  message.appendChild(toastHeadline);

  toastContent.appendChild(message);
  toast.appendChild(toastContent);

  document.body.appendChild(toast);

  /* Toast Function */

  function newToast(toast, text) {
    document.getElementById("toastHeadline").innerHTML = text;
    toast.classList.add("active");

    setTimeout(() => {
      toast.classList.remove("active");
    }, 2000);
  }

  /**********************************************
   *   Run - On Speech-to-Text Result
   *********************************************/
  let previousInputValue = "";

  recognition.onstart = function(event) {
    console.log("started");
  };

  recognition.onaudioend = () => {
    previousInputValue = inputField.value + " ";
  };

  recognition.onresult = function(event) {
    let final = "";
    let finalBefore = "";
    let interim = "";
    let speechInputHistory = [];

    for (let i = 0; i < event.results.length; ++i) {
      const { transcript } = event.results[i][0];

      finalBefore = final;

      if (event.results[i].isFinal) {
        final += transcript;

        // Add final Speech-Input to Speech-History-Array
        speechInputHistory.push(transcript.trim());

        /* Speech Command: Clear Input | New Try */

        if (final.includes(commands.commandClear)) {
          // Restart Recognition
          stopRecognotion(false);
          clearInput();
          previousInputValue = "";
          setTimeout(() => {
            startRecognotion(false);
          }, 400);

          final = "";
          speechInputHistory = [];

          newToast(toast, "Input cleared.");
        }

        /* Speech Command: Enter */

        if (final.includes(commands.commandEnter)) {
          final = "";
          speechInputHistory = [];

          inputField.click();

          inputField.dispatchEvent(new Event("input", { bubbles: true }));

          const keyboardEvent = new KeyboardEvent("keydown", {
            key: "Enter",
            code: "Enter",
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true,
            composed: true,
            isTrusted: true,
          });
          inputField.dispatchEvent(keyboardEvent);

          newToast(toast, "Pressed enter.");
        }

        /* Speech Command: Stop */

        if (final.endsWith(commands.commandStop)) {
          final = final.substring(
            0,
            final.length - commands.commandStop.length
          );

          stopRecognotion(true);
        }

        /* Speech Command: Replace */

        if (
          final.includes("replace") &&
          final.includes("with") &&
          transcript.trim().split(" ").length === 4 // Check if there are 4 words "replace XXX with YYY"
        ) {
          // ToDo: Currently everything is converted to LowerCase, as strings wouldnt match otherwise.
          // There are better solutions for this tho.
          let replaceString = final.split("replace")[1];
          let wordToReplace = replaceString.split(" ")[1];
          let newWord = replaceString.split(" ")[3];

          final = final.split("replace")[0];

          if (wordToReplace && newWord) {
            wordToReplace = wordToReplace.toLowerCase();
            newWord = newWord.toLowerCase();

            final = final.toLowerCase().replaceAll(wordToReplace, newWord);

            // Remove "replace XXX with YYY" from Speech-History-Array
            speechInputHistory.pop();

            // Replace words also in Speech-History-Array
            for (let j = 0; j < speechInputHistory.length; ++j) {
              if (speechInputHistory[j].includes(wordToReplace)) {
                speechInputHistory[j] = speechInputHistory[j].replace(
                  wordToReplace,
                  newWord
                );
              }
            }

            newToast(toast, "Word successfully replaced.");
          }
        }

        /* Speech Command: One step back */

        if (final.includes(commands.commandBack)) {
          if (speechInputHistory.length > 0) {
            let lastIndexOfHistory = speechInputHistory.length - 2; // skip the last word "backwards"

            final = final.split(speechInputHistory[lastIndexOfHistory])[0];

            // Delete last Speech-Inputs form Speech-History-Array
            speechInputHistory.pop(); // remove the command "backwards"
            speechInputHistory.pop(); // remove the last speech input before "backwards"

            newToast(toast, "Last voice input removed.");
          } else {
          }
        }
      } else {
        interim += transcript;
      }
    }

    /* Logs */
    console.log("### Added to input field ###");
    console.log("# Final:", final);
    console.log("# Interim:", interim);
    // console.log("# speechInputHistory:", speechInputHistory);

    /* Add to input field in browser */
    let finalInputValue = previousInputValue + final + interim;

    inputField.value = finalInputValue.trim().replaceAll("  ", " ");

    /* Always set focus to input field after */
    inputField.focus();
  };

  /* Run Script - On Voice End */

  recognition.onend = function() {
    stopRecognotion();
  };
}

/**********************************************
 *   Listen to changes in Storage
 *********************************************/

chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    // If extensionIsActive is set to true/false, reload the page
    if (key === "extensionIsActive") {
      location.reload();
    }

    getStorageCommands();

    console.log(
      `Storage key "${key}" in namespace "${namespace}" changed.`,
      `Old value was "${oldValue}", new value is "${newValue}".`
    );
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
      // updateInputFields();
    });
}

getStorageCommands();

// Keep Storage-Commands Sync
// setInterval(() => {
//   getStorageCommands();
// }, 1000);
