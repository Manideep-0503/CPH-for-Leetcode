const vscode = require('vscode');
const fetch = require('node-fetch'); 
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');
const {fetchexamples} = require('./fetching');
const {runScript,processTestCases,compileCpp} = require('./Execution');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
 
  const helloWorldCommand = vscode.commands.registerCommand('cph-extension-for-leetcode.helloWorld', function () {
    vscode.window.showInformationMessage('Hello World from CPH Extension for LeetCode!');

  });

  
  const fetchTestCasesCommand = vscode.commands.registerCommand('cph-extension-for-leetcode.fetchTestCases', async function () {
    try {

      
      
      const problem_name = await vscode.window.showInputBox({
        prompt: 'Enter the LeetCode problem url ',
        placeHolder:'https://leetcode.com/problems/multiply-strings/description/',
        validateInput: (input) => (input ? null : 'problem cant be empty?!')
      });
  
      if (!problem_name) return;
      
      console.log(problem_name);
  
        const examples = await fetchexamples(problem_name.split('/')[4]);
        console.log(examples);
        examples.forEach((element, i) => {
          const directory = path.join(__dirname, 'myfiles');
      
          if (!fs.existsSync(directory)) {
              fs.mkdirSync(directory);
          }
      
          const inputFileName = path.join(directory, `input${i + 1}.txt`);
          const outputFileName = path.join(directory, `output${i + 1}.txt`);
      
          fs.writeFileSync(inputFileName, element.input);
          fs.writeFileSync(outputFileName, element.expectedOutput);
          console.log(`Test Case ${i + 1} saved to ${inputFileName} and ${outputFileName}`);
      });
  
      vscode.window.showInformationMessage(`Test cases for "${problem_name}" have been saved successfully!`);
    } catch (error) {
      vscode.window.showErrorMessage(`Error fetching test cases: ${error.message}`);
    }
  });



  const runTestCasesCommand = vscode.commands.registerCommand('cph-extension-for-leetcode.runTestCases', async function () {
    const activeEditor = vscode.window.activeTextEditor;

    if(activeEditor) {
      const filePath = activeEditor.document.fileName;

      const folderPath = path.join(__dirname, 'myfiles');
      const files = fs.readdirSync(folderPath);
      const inputFiles = files.filter(file => file.startsWith('input') && file.endsWith('.txt'));
      const outputFiles = files.filter(file => file.startsWith('output')&& file.endsWith('.txt'));

      console.log(inputFiles);
      console.log(outputFiles);

      let testCases_argument = [];

      let count = 0; 

      for (let i = 0; i < inputFiles.length; i++) {
          let inputContent = '';
          let outputContent = '';

   
          fs.readFile(path.join(folderPath, inputFiles[i]), 'utf8', (err, data) => {
              if (err) {
                  console.error('Error reading the input file: ' + err);
                  return;
              }
              inputContent = data;

              fs.readFile(path.join(folderPath, outputFiles[i]), 'utf8', (err, data) => {
                  if (err) {
                      console.error('Error reading the output file: ' + err);
                      return;
                  }
                  outputContent = data;

                  
                  testCases_argument.push({
                      input: inputContent,
                      expectedOutput: outputContent,
                      yourOutput: null 
                  });

                  count++;

                  
                  if (count === inputFiles.length) {
                      console.log(testCases_argument);
                  }
              });
          });
      }

      const updatedTest = await processTestCases(filePath, testCases_argument)
      console.log(updatedTest.expectedOutput == updatedTest.yourOutput);
      
      const results = [];
  
      for (const key in updatedTest) {
        const case_test= updatedTest[key];
        const expectedValue = case_test.expectedOutput;
        const yourValue= case_test.yourOutput;

        if (yourValue.split(/\r?\n|\r/).join('') == expectedValue.split(/\r?\n|\r/).join('')) {
          results.push(`Test case ${key}: Passed`);
        } else {
          results.push(
            `Test case ${key}: Failed (Expected: '${expected}', Your Output: '${output}')`
          );
        }
      }
      
      console.log(results);
      vscode.window.showInformationMessage('Successfully executed the code');
      vscode.window.showInformationMessage(` Answer is "${results}" `)
    }
    else{
      console.log('No file is currently is active!!');
    }

  });

  context.subscriptions.push(helloWorldCommand);
  context.subscriptions.push(fetchTestCasesCommand);
  context.subscriptions.push(runTestCasesCommand);

  const provider = new SimpleViewProvider(context.extensionUri);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(SimpleViewProvider.viewType, provider)
    );
}



class SimpleViewProvider {
  static viewType = 'cph-extension-for-leetcode.runTestCases.testsview';

  
  constructor(extensionUri) {
      this._extensionUri = extensionUri;
  }

 
  resolveWebviewView(webviewView, _context, _token) {
      this._view = webviewView;

      
      webviewView.webview.options = {
          enableScripts: true,
      };

      
      webviewView.webview.html = this._getHtmlContent(webviewView.webview);

      
      webviewView.webview.onDidReceiveMessage(async(message) => {
          switch (message.command) {
              case 'fetch':
                  const examples_from_view = await fetchexamples(message.text.split('/')[4]);
                  console.log(examples_from_view);
                  vscode.window.showInformationMessage(`Successfully fetched testcases!!`);
                  webviewView.webview.postMessage({
                      type: 'fetchResponse',
                      data: examples_from_view,
                  });
                  break;
              case 'run':
                console.log("running");
                console.log(JSON.stringify(message.text));
                const active = vscode.window.activeTextEditor;
                const scriptPath= active.document.fileName;
                
                const examples_argument = JSON.parse(JSON.stringify(message.text));

                const updatedTestCases = await processTestCases(scriptPath, examples_argument)
                console.log(updatedTestCases.expectedOutput == updatedTestCases.yourOutput);
                    
                  console.log(updatedTestCases);
                    webviewView.webview.postMessage({
                      type: 'runResponse',
                      data: updatedTestCases,
                  });
                  vscode.window.showInformationMessage(`Results are updated!!`);
                  break;
          }
      });
  }

  
  _getHtmlContent(webview) {
      const nonce = getNonce();
      const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri,'script.js'));
      const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'style.css'));


      return `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>CPH for LeetCode</title>
      </head>
      <link href="${styleUri}" rel="stylesheet">
      
			<link href="${styleUri}" rel="stylesheet">
      <body>
          
              <label for="pname">Enter Problem Url : </label><br>
              <input type = "text" id = "pname" placeholder = "https://leetcode.com/problems/longest-common-prefix/description/">
          
         <div class="button-container">
            <button id="fetchTestCases" class="add-color-button">Fetch Test Cases</button>
             <button class="add-color-button" id="addCase"> + Add Test</button>
            <button class="run-all-button" id="runAll">Run All</button>
           
        </div>

          <div id="testCasesContainer"></div>

          

          <script nonce="${nonce}" src = "${scriptUri}">
          </script>
          
      </body>
      </html>`;
  }
}


function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}



function deactivate() {}

module.exports = {
  activate,
  deactivate
};
