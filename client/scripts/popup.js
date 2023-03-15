document.addEventListener("DOMContentLoaded", function(){
    document.getElementById("save").addEventListener("click", async()=>{
        key = document.getElementById("apiKey")
        if(key.value.length > 49){
            const apiKey = key.value
            key.value = ""
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {  
                chrome.tabs.sendMessage(tabs[0].id, { id: "key" , content: apiKey }, function(response) {  
                    console.log(response);  
                });  
            });  
        
        }
        else{
            key.value = ""
            key.setAttribute("placeholder", "NOT VALID")
        }
    })
    document.getElementById("translate").addEventListener("click", async()=>{
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {  
            chrome.tabs.sendMessage(tabs[0].id, { id:"translate", content: "translate" }, function(response) {  
                console.log(response);  
            });  
        });  
    })
})

chrome.action.onClicked.addListener(function(tab) {
    chrome.action.setTitle({tabId: tab.id, title: "You are on tab:" + tab.id});
});

