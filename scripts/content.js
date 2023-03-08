
function generatePrompt(prompt){
    return `please translate this to chinese: ${prompt}`
}
const requestOptions = (prompt) =>({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + String("my_api_key")
    },
    body: JSON.stringify({
        'model': "text-davinci-003",
        'prompt': generatePrompt(prompt),
        'temperature': 0,
        'max_tokens': 20,
    })
  });
  const re = ["I am human", "I love to write code"]
  fetch('https://api.openai.com/v1/completions', requestOptions(re))
        .then(response => {
                return response.json()
            })
        .then(data => {
            console.log(data)
            console.log(data.choices[0].text)
        }).catch(err => {
            console.log(err);
        });

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

}
async function translatingRequest(content){
    /* do openai api */
    translate = ""
    
    
}
function replaceTranslatedNodes(content, nodeList){
    /*將翻譯完的字串放進來，轉為陣列後再對照回原本的nodeList*/
}

if (body) {

    const NodeList = getTextNodeList(body)
    translateNodeList(NodeList)


}
debugger
