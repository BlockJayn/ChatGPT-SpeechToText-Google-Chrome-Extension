/**********************************************
 *   Custom Commands:
 *   get from localStorage or set default value
 *********************************************/

const commands = {
  commandEnter: localStorage.getItem("commandEnter")
    ? localStorage.getItem("commandEnter")
    : "enter",

  commandBack: localStorage.getItem("commandBack")
    ? localStorage.getItem("commandBack")
    : "backwards",

  commandReplace: "replace X with Y", // Changes for commandReplace are not allowed

  commandClear: localStorage.getItem("commandClear")
    ? localStorage.getItem("commandClear")
    : "clear input",

  commandStop: localStorage.getItem("commandStop")
    ? localStorage.getItem("commandStop")
    : "stop",
};

// TEST COMMAND
let testCommand;
let nochnTest = chrome.storage.sync.get("commandTest").then((result) => {
  testCommand = result.commandTest;
  console.log("RESULT", result.commandTest);
  return result.commandTest;
});
console.log();
setTimeout(() => {
  console.log("testCommand", testCommand);
  console.log("nochnTest", nochnTest);
}, 2000);

/**********************************************
 *   Add Own Custom Stylesheet
 *********************************************/

const styles = `
.pulseRed {
    background: rgba(255, 82, 82, 1);
    box-shadow: 0 0 0 0 rgba(255, 82, 82, 1);
    animation: pulse-red 2s infinite;
  }
  
  @keyframes pulse-red {
    0% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.7);
    }
    
    70% {
      transform: scale(1);
      box-shadow: 0 0 0 10px rgba(255, 82, 82, 0);
    }
    
    100% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(255, 82, 82, 0);
    }
  }

html, body {margin: 0; height: 100%; overflow: hidden}.toast,.toast .close{top:10px;position:absolute}.toast{right:10px;border-radius:12px;background:#fff;padding:10px 15px;box-shadow:0 5px 10px rgba(0,0,0,.1);border-left:6px solid #4070f4;overflow:hidden;transform:translateX(calc(100% + 30px));transition:.5s cubic-bezier(.68, -.55, .265, 1.35)}.toast.active{transform:translateX(0)}.toast .toast-content{display:flex;align-items:center}.toast-content .check{display:flex;align-items:center;justify-content:center;height:35px;width:35px;background-color:#4070f4;color:#fff;font-size:14px;border-radius:50%}.toast-content .message{display:flex;flex-direction:column;margin:0 14px}.message .text{font-size:14px;font-weight:400;color:#666}.message .text.text-1{font-weight:600;color:#333}.toast .close{right:15px;padding:5px;cursor:pointer;opacity:.7}.toast .close:hover{opacity:1}.toast .progress{position:absolute;bottom:0;left:0;height:3px;width:100%;background:#ddd}.toast .progress:before{content:'';position:absolute;bottom:0;right:0;height:100%;width:100%;background-color:#4070f4}.progress.active:before{animation:5s linear forwards progress}@keyframes progress{100%{right:100%}}`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

/**********************************************
 *   Voice Recognition
 *********************************************/

const recognition = new webkitSpeechRecognition();
recognition.continuous = true; //
recognition.interimResults = true; // Show preliminary results/words while speaking
//   reset(); // Reset on every new start
//   recognition.onend = reset;

/**********************************************
 *   Selectors
 *********************************************/

let inputField = document.getElementById("prompt-textarea");
let submitButton = inputField.nextSibling;
let submitButtonClasslist = submitButton.className;

/**********************************************
 *   Modify ChatGPT Submit Button
 *********************************************/

submitButton.style.cssText += "background-color: rgb(25, 195, 125);";
submitButton.removeAttribute("disabled");

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

  withNotification ? newToast(toast, "Speech to Text has started") : undefined;
}

/* Stop Voice Recognition */

function stopRecognotion(withNotification) {
  microphoneIsActive = false;
  recognition.stop();

  inputField.placeholder = "Send a message.";
  micButton.classList.remove("pulseRed");
  micButton.innerHTML = micButtonSVGInactive;

  withNotification ? newToast(toast, "Speech to Text has stopped") : undefined;
}

/* Clear Input Field */

function clearInput() {
  inputField.value = "";
}

/**********************************************
 *   Toast
 *********************************************/

/* Add Toast Html-Element */

document.body.insertAdjacentHTML(
  "beforeend",
  `<div id="toast" class="toast">
      <div class="toast-content">
          <div class="message">
              <span id="toastHeadline" class="text text-1">Success</span>
          </div>
      </div>
    
      <div id="progress" class="progress"></div>
    </div>`
);

const toast = document.getElementById("toast");

/* Toast Function */

function newToast(toast, text) {
  document.getElementById("toastHeadline").innerHTML = text;
  toast.classList.add("active");

  setTimeout(() => {
    toast.classList.remove("active");
  }, 2000);
}

/**********************************************
 *   Run Script -
 *********************************************/

// console.clear();

/* Run Script - On Speech-to-Text Result */

recognition.onresult = function(event) {
  let final = "";
  let finalBefore = "";
  let interim = "";
  let speechInputHistory = [];

  /* Enable Submit Button */
  submitButton.removeAttribute("disabled");

  for (let i = 0; i < event.results.length; ++i) {
    finalBefore = final;

    if (event.results[i].isFinal) {
      final += event.results[i][0].transcript;

      // Add final Speech-Input to Speech-History-Array
      speechInputHistory.push(event.results[i][0].transcript.trim());

      /* Speech Command: Clear Input | New Try */

      if (final.includes("clear input")) {
        // Restart Recognition
        stopRecognotion(false);
        setTimeout(() => {
          startRecognotion(false);
        }, 400);

        final = "";
        speechInputHistory = [];

        newToast(toast, "Input cleared.");
      }

      /* Speech Command: Enter */

      if (final.includes("enter")) {
        final = "";
        speechInputHistory = [];

        console.log(submitButton);

        // submitButton.click();

        let keyboardEvent_enter = new KeyboardEvent("keydown", {
          code: "Enter",
          key: "Enter",
          charCode: 13,
          keyCode: 13,
          view: window,
          bubbles: true,
        });
        inputField.dispatchEvent(keyboardEvent_enter);

        newToast(toast, "Pressed enter.");
      }

      /* Speech Command: Stop */

      if (final.includes(testCommand)) {
        console.log(
          "################################stop command:",
          testCommand
        );

        final = final.split(commands.commandStop)[0];
        stopRecognotion(true);
      }

      /* Speech Command: Replace */

      if (
        final.includes("replace") &&
        final.includes("with") &&
        event.results[i][0].transcript.trim().split(" ").length === 4 // Check if there are 4 words "replace XXX with YYY"
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

      if (final.includes("backwards")) {
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
      interim += event.results[i][0].transcript;
    }
  }

  /* Logs */
  console.log("### Added to input field ###");
  console.log("# Final:", final);
  console.log("# Interim:", interim);
  // console.log("# speechInputHistory:", speechInputHistory);

  /* Add to input field in browser */
  let finalInputValue = final + interim;
  inputField.value = finalInputValue.trim().replaceAll("  ", " ");

  /* Always set focus to input field after */
  inputField.focus();
};

/* Run Script - On Voice End */

recognition.onend = function() {
  stopRecognotion();
};
