const body = document.querySelector("body");
let lastRecord = Date.now();

function getTextNodeList(dom){
    const NodeList = []
    const NodeOfWeb = []
    NodeList.push(dom)
    while(NodeList.length > 0){
        const current_node = NodeList[0]
        NodeList.shift()
        if(current_node.outerHTML){
            if(current_node.outerHTML.match(/^<code[^><]*?>[\s\S]+<\/code>$/) ){
            }
            else if(current_node.children.length == 0){ //node has no element child
                if((current_node.innerText != null)){
                    if(current_node.childNodes.length>0){ //node contains #text
                        if(current_node.textContent != ""){
                            NodeOfWeb.push(current_node.firstChild)
                        }   
                    }
                    else{ //node is an #text its self
                        if(current_node.textContent != ""){
                            NodeOfWeb.push(current_node)
                        }
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
            if((!current_node.nodeValue.match(/^[\s\t\n\r\f\v]+$/)) && (current_node.nodeValue != "")){ 
                NodeOfWeb.push(current_node)
            }
        }
        
    }
    return NodeOfWeb

}
function translateNodeList(list){

    let wordCount = 0
    let content = []
    let subList = []
    list.forEach(element => {
        if(element.textContent == ""){
            console.log(element)
        }
        wordCount+= String(element.nodeValue).length
        content.push(String(element.nodeValue).trim())
        subList.push(element)

        if(wordCount > 300){
            wordCount = 0
            let current = Date.now();
            while(current-lastRecord < 1500){
                current = Date.now();
            }
            lastRecord = Date.now()
            console.log(content)
            
            translatingRequest(content.join("\n"), subList)
            console.log("finish")
            
            content = []
            subList = []
        }       

    });

}
function generatePrompt(prompt){
    return `Translate the following sentence from any languages to traditional Chinese:\n ${prompt} \n`
}

async function translatingRequest(content, subList){
    /* do openai api */
    let translate = await fetch('http://localhost:5000/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            'prompt': generatePrompt(content),
        })
    }).then(function(response){
        if(response.ok){
            let data = response.json()
            return data
        }
        else{
            let data = response.statusText
            return data
        }
    }).then((function(data){
        let parsed = data.translated[0].text.trim().split('\n')
        let c = []
        subList.forEach(element => {
            c.push(element.nodeValue)
        });
        console.log(parsed, c)
        replaceTranslatedNodes(parsed, subList)
        return parsed //get string successfull
    }))
    return translate
}
function replaceTranslatedNodes(content, nodeList){
    /*將翻譯完的字串放進來，轉為陣列後再對照回原本的nodeList*/
    for(let i = 0; i< nodeList.length; i++){
        try{
            nodeList[i].nodeValue = content[i]
        }
        catch(e){
            nodeList[i] = '0'
        }
    }
}

if (body) {

    const NodeList = getTextNodeList(body)
    translateNodeList(NodeList)


}
