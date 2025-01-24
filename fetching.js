const fetch = require('node-fetch'); 
const cheerio = require('cheerio');


async function fetchexamples(problem_name) {
  try {

    const testCases = [];
   
    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query questionContent($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
              content
            }
          }
        `,
        variables: { titleSlug: problem_name },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch problem: ${response.statusText}`);
    }

    const data = await response.json();
    const htmlstring = data?.data?.question?.content;
    if (!htmlstring) {
      throw new Error("No content found for the given problem name.");
    }

 
    const docfile= cheerio.load(htmlstring);
    const examples = docfile("pre");


    examples.each((i, element) => {
      const testCase = docfile(element).text();
      const lines = testCase.split("\n");

      const inputLine = lines[0].replace("Input: ", "").trim();
      const outputLine = lines[1].replace("Output: ", "").trim();

      function formatInputLine(line) {
        return line
          .replace(/\b\w+(?=\s*=\s*)/g, (match) => `"${match}"`)
          .replace(/\s*=\s*/g, ":");
      }

      const formattedStringInput = `{${formatInputLine(inputLine)}}`;
      const formattedStringOutput = `{"output": ${formatInputLine(outputLine)}}`;
      const test_input = JSON.parse(formattedStringInput);
      const test_output = JSON.parse(formattedStringOutput);

      let result="";
      for (const key in test_input) {
        if (test_input.hasOwnProperty(key)) {
          const val = test_input[key];
      
       
          if (Array.isArray(val) && val.every(Array.isArray)) {
            const numRows = val.length; 
            const numCols = val[0].length; 
      
         
            result += `${numRows} ${numCols}\n`;
      
          
            val.forEach(row => {
              result += `${row.join(' ')}\n`;
            });
          } else if (Array.isArray(val)) {
         
            const size = val.length;
            result +=`${size}\n`
            result += `${val.join(' ')}\n`;
          } else {
  
            result += `${val}\n`;
          }
        }
      }

      let output_result="";

      for (const key in test_output) {
        if (test_output.hasOwnProperty(key)) {
          const val = test_output[key];
      
        
          if (Array.isArray(val) && val.every(Array.isArray)) {
            val.forEach(row => {
              output_result += `${row.join(' ')}\n`;
            });
          } else if (Array.isArray(val)) {
            
            output_result += `${val.join(' ')}\n`;
          } else {
            output_result += `${val}\n`;
          }
        }
      }
      testCases.push({input: result, expectedOutput: output_result, yourOutput: 'Your Output 1'});
    });

    console.log("All examples processed and saved.");
    console.log(testCases);
    return testCases;
  } catch (error) {
    console.error("An error occurred:", error.message);
    return [];
  }
}

module.exports= {
    fetchexamples
};