const body = document.querySelector("body");

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {  
    console.log(message);  
    if(message.id == "translate" ){
        if(body){
            const NodeList = getTextNodeList(body)
            translateNodeList(NodeList)
        }
    }
    else if(message.id == "key")
        fetch('http://localhost:5000/set', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'key': message,
            })
        }).then((res)=>{
            console.log(res)
            sendResponse({ status: res});  
        })
});
function getTextNodeList(dom){
    const NodeList = []
    const NodeOfWeb = []
    NodeList.push(dom)
    while(NodeList.length > 0){
        const current_node = NodeList[0]
        NodeList.shift()
        if(current_node.outerHTML){
            if(current_node.outerHTML.match(/^<code[^><]*?>[\s\S]+<\/code>$/) || current_node.outerHTML.match(/^<script[^><]*?>[\s\S]+<\/script>$/) || current_node.outerHTML.match(/^<style[^><]*?>[\s\S]+<\/style>$/) ){
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
        if(element.textContent != ""){
            if(String(element.nodeValue).length > 20){
                wordCount+= String(element.nodeValue).length
                content.push(String(element.nodeValue).trim())
                subList.push(element)
            }
            if(wordCount > 1000){
                wordCount = 0
                translatingRequest(content, subList)
                content = []
                subList = []
            }       
        }
    })
    if(subList.length > 0){
        translatingRequest(content, subList)
    }

}
function generatePrompt(prompt){
    return `Translate the following sentence from any languages to traditional Chinese:\n ${prompt.join("\n")} \n`
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
            return Promise.reject
        }
    }).then((function(data){
        let parsed = []
        try{
            parsed = data.translated.text.trim().split('\n')
            replaceTranslatedNodes(parsed, subList, content)
            return parsed //get string successfull
        }
        catch(e){
            return Promise.reject
        }
    })).catch(err=>{
        if(response.status == 401){
            console.log(response.statusText)
            console.log(err)
        }
        else{
            console.log(err)
        }
    })
}
function replaceTranslatedNodes(content, nodeList, original){
    if(content){
        if(content.length === nodeList.length){
            for(let i = 0; i< nodeList.length; i++){
                try{
                    nodeList[i].nodeValue = content[i]
                }
                catch(e){
                    console.log(e)
                }
            }
        }
        else if(nodeList.length > 1){
            translatingRequest(original.slice(0, Math.floor(original.length/2)), nodeList.slice(0, Math.floor(nodeList.length/2)))
            translatingRequest(original.slice(Math.floor(original.length/2), original.length), nodeList.slice(Math.floor(nodeList.length/2), nodeList.length))
        }
        
        
    }
    
}

function getSelectedText(){
    let selected = ""
    if(window.getSelection){
        selected = window.getSelection()
    }
    else if(document.getSelection){
        selected = document.getSelection()
    }
    return selected
}

function showTranslated(text, oRect){
    const translateHelper = document.createElement("div")
    const translateText = document.createElement("p")
    translateText.innerText = text
    translateHelper.style.position = "absolute"
    translateHelper.style.left = oRect.left + oRect.width/2 - 100 + "px";
    translateHelper.style.top =  window.pageYOffset + oRect.top + oRect.height + "px";
    translateHelper.style.zIndex = "2147483647"
    translateHelper.style.width = "400px"
    translateHelper.style.padding = "10px"
    translateHelper.style.borderWidth = "4px"
    translateHelper.style.borderColor = "#FFFFFF"
    translateHelper.style.backgroundColor = "#E8FFF5"
    translateHelper.style.borderRadius = "3%"
    translateHelper.style.overflow = "scroll"
    translateHelper.id = "translator_show"  
    translateHelper.appendChild(translateText)
    body.appendChild(translateHelper)
}

function addIcon(selection, text){
    
    const helper = document.createElement("div")

    helper.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24" width="20px" height="20px"><path d="M23.707,22.293l-5.969-5.969a10.016,10.016,0,1,0-1.414,1.414l5.969,5.969a1,1,0,0,0,1.414-1.414ZM10,18a8,8,0,1,1,8-8A8.009,8.009,0,0,1,10,18Z"/></svg>`
    
    const oRange = selection.getRangeAt(0); //get the text range
    const oRect = oRange.getBoundingClientRect();
    helper.style.position = "absolute"
    helper.style.zIndex = "2147483647"
    helper.style.width = "25px"
    helper.style.height = "25px"
    helper.style.cursor = "pointer"
    helper.style.backgroundColor = "#ADFEDC"
    helper.style.padding = "5px"
    helper.style.borderRadius = "10%"
    helper.style.left = oRect.x + "px";
    helper.style.top =  window.pageYOffset + oRect.top*0.9  + "px";
    helper.id = "translator_openai"
    body.appendChild(helper)

    if(helper){
        helper.addEventListener("click", async()=>{
            if(text.length > 0){
                const prompt = "Translate the following sentence from any languages to traditional Chinese:\n"+text
                let translate = await fetch('http://localhost:5000/', {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        'prompt': prompt,
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
                }).then(function(data){
                    try{
                        const parsed = data.translated.text.trim()
                        showTranslated(parsed, oRect)
                    }
                    catch(e){
                        console.log(e)
                    }
                })
            }
        })
    }
}



if (body) {
    document.addEventListener("mouseup", () => {
        const selected = getSelectedText();
        const selectedText = selected.toString()
        if (selected && selectedText.length > 0 && selectedText.length < 1000) {
            addIcon(selected, selectedText)
        }
        setTimeout(()=>{
            const helper = document.querySelector("div#translator_openai")
            if(helper) helper.remove()
        }, 3000)
        
    });
    document.addEventListener("mousedown", ()=>{
        const translateTextHelper = document.querySelector("div#translator_show")
        if(translateTextHelper){
            translateTextHelper.remove()
        }
    })
    
}
