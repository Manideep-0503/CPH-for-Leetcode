const { spawn } = require('child_process');
const os = require('os');
const path = require('path');


function runScript(scriptPath, inputData) {
    return new Promise((resolve, reject) => {
        const isWindows = os.platform() === 'win32';
        let command;
        let args = [];
  
       
        if (scriptPath.endsWith('.py')) {
            command = isWindows ? 'python' : 'python3'; 
            args.push(scriptPath);
        } else {
            command = isWindows ? scriptPath : `./${scriptPath}`;
        }
  
        const run = spawn(command, args, { shell: true });
  
     
        run.stdin.write(inputData);
        run.stdin.end();
  
        let output = '';
        let errorOutput = '';
  
      
        run.stdout.on('data', (data) => {
            output += data.toString();
        });
  
       
        run.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
  
        
        run.on('close', (code) => {
            if (code !== 0) {
                reject(`Error: ${errorOutput}`);
            } else {
                resolve(output.trim());
            }
        });
    });
  }
  
  
  async function processTestCases(scriptPath, testCases) {
    let executablePath;
  
    try {
        if (scriptPath.endsWith('.cpp')) {
       
            executablePath = await compileCpp(scriptPath);
        } else {
            executablePath = scriptPath; 
        }
  
        for (const testCase of testCases) {
            try {
                const output = await runScript(executablePath, testCase.input);
                testCase.yourOutput = output; 
            } catch (error) {
                console.error(`Failed to run test case with input "${testCase.input}": ${error}`);
                testCase.yourOutput = `Error occurred ${error}`; 
            }
        }
    } catch (error) {
        console.error(`Compilation or execution failed: ${error}`);
    }
  
    return testCases; 
  }
  
  function compileCpp(scriptPath) {
    return new Promise((resolve, reject) => {
        const isWindows = os.platform() === 'win32';
        const outputFileName = path.basename(scriptPath, path.extname(scriptPath)) + (isWindows ? '.exe' : '');
        
      
        const compile = spawn('g++', [scriptPath, '-o', outputFileName]);
  
        compile.on('close', (code) => {
            if (code !== 0) {
                reject(`Compilation failed with exit code ${code}`);
            } else {
                resolve(outputFileName);
            }
        });
    });
  }

  module.exports = {
    compileCpp,
    processTestCases,
    runScript
  }