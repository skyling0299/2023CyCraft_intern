/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!****************************!*\
  !*** ./scripts/content.js ***!
  \****************************/
// const { Configuration, OpenAIApi } = require("openai");
// let openaiClient;
// openaiClient = new OpenAIApi(
//     new Configuration({
//       apiKey: "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",
//     }),
// );
const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + String("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")
    },
    body: JSON.stringify({
      'prompt': 'who are you',
      'temperature': 0.1,
      'max_tokens': 20,
      'top_p': 1,
      'frequency_penalty': 0,
      'presence_penalty': 0.5,
      'stop': ["\"\"\""],
    })
  };
  fetch('https://api.openai.com/v1/engines/code-davinci-001/completions', requestOptions)
      .then(response => {
            //response.json()
            console.log(response.json())
        })
      .then(data => {
            console.log(data)
        }).catch(err => {
            console.log("Ran out of tokens for today! Try tomorrow!");
        });



// const completion = async()=>{ 
//     console.log("yes")
//     return await openaiClient.createCompletion({
//         model: 'text-davinci-003',
//         prompt:
//         // 2. we explain exactly what we want (continue writing the email) 
//         // and provide context (the current email content)
//         'Continue writing the following email:\n"' + "hello, I am john" + '"',
        
//         // 3. reduced the temperature a little for better consistency (optional)
//         temperature: 0.6,
//     });
// }
// console.log(completion().data.choices[0].text)


const body = document.querySelector("body");

function getTextNodeList(dom){
    let index = 0
    const NodeList = []
    const NodeOfWeb = []
    NodeList.push(dom)
    while(NodeList.length > 0){
        const current_node = NodeList[0]
        NodeList.shift()
        if(current_node.outerHTML){
            if(current_node.outerHTML.match(/^<code[^><]*?>[\s\S]+<\/code>$/)){
            }
            else if(current_node.children.length == 0){ //node has no element child
                if((current_node.innerText != null)){
                    if(current_node.childNodes.length>0){ //node contains #text
                        NodeOfWeb.push(current_node.firstChild)
                    }
                    else{ //node is an #text its self
                        NodeOfWeb.push(current_node)
                    }
                }
                
            }
            else{
                current_node.childNodes.forEach(element => {
                    NodeList.push(element)
                });
            }
        }
        else{
            if((!current_node.nodeValue.match(/^[\s\t\n\r\f\v]+$/))){ 
                
                NodeOfWeb.push(current_node)
            }
        }
    }
    return NodeOfWeb

}
function translateNodeList(list){
    let index = 0
    let wordCount = 0
    let content = []
    list.forEach(element => {
        if(element.nodeValue == ""){
            console.log(element)
        }
        wordCount+= String(element.nodeValue).length
        if(wordCount > 600){
            wordCount = 0
            console.log(content.join("\n"))
            replaceTranslatedNodes(translatingRequest(content), list)
            content = []
        }

        content.push(String(element.nodeValue))

    });
    // index++
    // current_node.firstChild.nodeValue = index
}
async function translatingRequest(content){
    /* do openai api */
    translate = ""
    
    
}
function replaceTranslatedNodes(content, nodeList){
    /*將翻譯完的字串放進來，轉為陣列後再對照回原本的nodeList*/
}
// `document.querySelector` may return null if the selector doesn't match anything.
if (body) {

    const NodeList = getTextNodeList(body)
    translateNodeList(NodeList)


}
debugger

/*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*/
/******/ })()
;
//# sourceMappingURL=content.js.map