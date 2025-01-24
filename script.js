
const vscode = acquireVsCodeApi();

document.getElementById('fetchTestCases').addEventListener('click', () =>{
    let inputfield = document.getElementById('pname');
    let value = inputfield.value;


    
    vscode.postMessage({
        command: 'fetch',
        text : value
    });
});

document.getElementById('runAll').addEventListener('click',() => {
    const run_testCases = [];
    
   
    const run_testCaseElements = document.querySelectorAll('.test-case');

   
    run_testCaseElements.forEach((testCaseElement) => {
        const input = testCaseElement.querySelector('.testCases_input').value;
        const expectedOutput = testCaseElement.querySelector('.testCases_expected').value;
        const yourOutput = testCaseElement.querySelector('.testCases_yourOutput').value;

        
        run_testCases.push({
            input: input,
            expectedOutput: expectedOutput,
            yourOutput: yourOutput
        });
    });

    vscode.postMessage({
        command: 'run',
        text : run_testCases
    });

});


document.getElementById('addCase').addEventListener('click',() => {
    const container = document.getElementById('testCasesContainer');
    const testCaseDiv = document.createElement('div');
        testCaseDiv.className = 'test-case';

        const content_example = document.createElement('div');
        content_example.className = 'hidden-content';

        const inputLabel = document.createElement('div');
        inputLabel.className = 'label';
        inputLabel.innerHTML = '<strong>Input:</strong>';
    
    
       
        const inputBox = document.createElement('textarea');
        inputBox.className = 'testCases_input';
        inputBox.placeholder = 'Enter Input';
        inputBox.rows = 5;
        inputBox.cols = 28; 
    
        
        
        const expOutLabel = document.createElement('div');
        expOutLabel.className = 'label';
        expOutLabel.innerHTML = '<strong>Expected Output:</strong>';
    
        
        const expectedOutputBox = document.createElement('textarea');
        expectedOutputBox.className = 'testCases_expected';
  
        expectedOutputBox.placeholder = 'Enter Output';
        expectedOutputBox.rows = 2;
        expectedOutputBox.cols = 28;
    
        const yourOutLabel = document.createElement('div');
        yourOutLabel.className = 'label';
        yourOutLabel.innerHTML = '<strong>Your Output :</strong>';
        
   
        const yourOutputBox = document.createElement('textarea');
        yourOutputBox.className = 'testCases_yourOutput';
       
        yourOutputBox.rows = 2;
        yourOutputBox.cols = 28;
        

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.innerText = String.fromCodePoint(0x1F5D1);

        
        
        deleteButton.addEventListener('click', () => {
            container.removeChild(testCaseDiv); 
        });
    
        
        content_example.appendChild(inputLabel);
        content_example.appendChild(inputBox);
        content_example.appendChild(expOutLabel);
        content_example.appendChild(expectedOutputBox);
        content_example.appendChild(yourOutLabel);
        content_example.appendChild(yourOutputBox);
        
        const title = document.createElement('div');
        title.className = 'testCases_title';
        title.innerText = `TestCase ${container.children.length + 1}`;

        content_example.style.display = 'none';

        title.addEventListener('click', () => {
            content_example.style.display = content_example.style.display === 'none' ? 'block' : 'none';
        });

        const head = document.createElement('div');
        head.className = 'head-test';

        head.appendChild(title);
        head.appendChild(deleteButton);

        testCaseDiv.appendChild(head);
      
        testCaseDiv.appendChild(content_example);

        container.appendChild(testCaseDiv);

});

window.addEventListener('message', (event) => {
    const message = event.data;

    switch (message.type) {
        case 'fetchResponse':
            renderexamples(message.data);
            break;
        case 'runResponse':
            runrenderexamples(message.data);
    
    
                break;
        default:
            console.warn('Unknown message type:', message.type);
    }
});



function renderexamples(testCases) {
    
    const container = document.getElementById('testCasesContainer');
    container.innerHTML = ''; 
    
    testCases.forEach((testCase, index) => {
        const testCaseDiv = document.createElement('div');
        testCaseDiv.className = 'test-case';

        const content_example = document.createElement('div');
        content_example.className = 'hidden-content';
    
        const inputLabel = document.createElement('div');
        inputLabel.className = 'label';
        inputLabel.innerHTML = '<strong>Input:</strong>';
    
    
       
        const inputBox = document.createElement('textarea');
        inputBox.className = 'testCases_input';
        inputBox.value = testCase.input; 
        inputBox.placeholder = 'Enter Input';
        inputBox.rows = 5; 
        inputBox.cols = 20; 
    
        
        
        const expOutLabel = document.createElement('div');
        expOutLabel.className = 'label';
        expOutLabel.innerHTML = '<strong>Expected Output:</strong>';
    
       
        const expectedOutputBox = document.createElement('textarea');
        expectedOutputBox.className = 'testCases_expected';
        expectedOutputBox.value = testCase.expectedOutput;
        expectedOutputBox.placeholder = 'Enter Output';
        expectedOutputBox.rows = 2;
        expectedOutputBox.cols = 20;
    
        const yourOutLabel = document.createElement('div');
        yourOutLabel.className = 'label';
        yourOutLabel.innerHTML = '<strong>Your Output :</strong>';
        
       
        const yourOutputBox = document.createElement('textarea');
        yourOutputBox.className = 'testCases_yourOutput';
        yourOutputBox.value = testCase.yourOutput;
        yourOutputBox.rows = 2;
        yourOutputBox.cols = 20;

        const deleteButton = document.createElement('button');
        deleteButton.innerText = String.fromCodePoint(0x1F5D1);
        deleteButton.className = 'delete-button';
        
        deleteButton.addEventListener('click', () => {
            container.removeChild(testCaseDiv); 
        });
        
    
      
        content_example.appendChild(inputLabel);
        content_example.appendChild(inputBox);
        content_example.appendChild(expOutLabel);
        content_example.appendChild(expectedOutputBox);
        content_example.appendChild(yourOutLabel);
        content_example.appendChild(yourOutputBox);
        
        const title = document.createElement('div');
        title.className = 'testCases_title';
        title.innerText = `TestCase ${container.children.length + 1}`;

        content_example.style.display = 'none';

        title.addEventListener('click', () => {
            content_example.style.display = content_example.style.display === 'none' ? 'block' : 'none';
        });

        const head = document.createElement('div');
        head.className = 'head-test';

        head.appendChild(title);
        head.appendChild(deleteButton);

        testCaseDiv.appendChild(head);

        testCaseDiv.appendChild(content_example);

        container.appendChild(testCaseDiv);
    });
}

function runrenderexamples(testCases) {
    
    const container = document.getElementById('testCasesContainer');
    container.innerHTML = ''; 
    
    testCases.forEach((testCase, index) => {
        const testCaseDiv = document.createElement('div');
        testCaseDiv.className = 'test-case';

        const content_example = document.createElement('div');
        content_example.className = 'hidden-content';
    
        const inputLabel = document.createElement('div');
        inputLabel.className = 'label';
        inputLabel.innerHTML = '<strong>Input:</strong>';
    
    
   
        const inputBox = document.createElement('textarea');
        inputBox.className = 'testCases_input';
        inputBox.value = testCase.input; 
        inputBox.placeholder = 'Enter Input';
        inputBox.rows = 5; 
        inputBox.cols = 20; 
    
        
        
        const expOutLabel = document.createElement('div');
        expOutLabel.className = 'label';
        expOutLabel.innerHTML = '<strong>Expected Output:</strong>';
    
        const expectedOutputBox = document.createElement('textarea');
        expectedOutputBox.className = 'testCases_expected';
        expectedOutputBox.value = testCase.expectedOutput;
        expectedOutputBox.placeholder = 'Enter Output';
        expectedOutputBox.rows = 2;
        expectedOutputBox.cols = 20;
    
        const yourOutLabel = document.createElement('div');
        yourOutLabel.className = 'label';
        yourOutLabel.innerHTML = '<strong>Your Output :</strong>';
        
        
        const yourOutputBox = document.createElement('textarea');
        yourOutputBox.className = 'testCases_yourOutput';
        yourOutputBox.value = testCase.yourOutput;
        yourOutputBox.rows = 2;
        yourOutputBox.cols = 20;

        const deleteButton = document.createElement('button');
        deleteButton.innerText = String.fromCodePoint(0x1F5D1);
        deleteButton.className = 'delete-button';
        
        deleteButton.addEventListener('click', () => {
            container.removeChild(testCaseDiv); 
        });
        
    
     
        content_example.appendChild(inputLabel);
        content_example.appendChild(inputBox);
        content_example.appendChild(expOutLabel);
        content_example.appendChild(expectedOutputBox);
        content_example.appendChild(yourOutLabel);
        content_example.appendChild(yourOutputBox);
        
        const title = document.createElement('div');
        title.className = 'testCases_title';
        title.innerText = `TestCase ${container.children.length + 1}`;

        content_example.style.display = 'none';

        title.addEventListener('click', () => {
            content_example.style.display = content_example.style.display === 'none' ? 'block' : 'none';
        });

        const tickIcon = document.createElement('span');
        tickIcon.className = 'status-icon';
        tickIcon.innerText = String.fromCodePoint(0x2714);
        tickIcon.style.color = 'green'; 
        tickIcon.style.display = 'none';

        const crossIcon = document.createElement('span');
        crossIcon.className = 'status-icon';
        crossIcon.innerText = String.fromCodePoint(0x2716);
        crossIcon.style.color = 'red'; 
        crossIcon.style.display = 'none'; 

        const head = document.createElement('div');
        head.className = 'head-test';

        head.appendChild(title);
        head.appendChild(tickIcon);
        head.appendChild(crossIcon);
        head.appendChild(deleteButton);
        

            const expectedValue = expectedOutputBox.value;
            const yourValue = yourOutputBox.value;
     
            if (yourValue.split(/\r?\n|\r/).join('') == expectedValue.split(/\r?\n|\r/).join('')) {
                tickIcon.style.display = 'inline'; 
                crossIcon.style.display = 'none';  
            } else {
                tickIcon.style.display = 'none';  
                crossIcon.style.display = 'inline';  
            }

       

        testCaseDiv.appendChild(head);

        testCaseDiv.appendChild(content_example);

        container.appendChild(testCaseDiv);
    });
}