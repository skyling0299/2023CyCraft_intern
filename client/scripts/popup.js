document.addEventListener("DOMContentLoaded", function(){
    console.log("hihi")
    document.getElementById("save").addEventListener("click", async()=>{
        key = document.getElementById("apiKey")
        console.log(key.value)
        if(key.value.length > 49){
            const apiKey = key.value
            key.value = ""
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {  
                chrome.tabs.sendMessage(tabs[0].id, { content: apiKey }, function(response) {  
                    console.log(response);  
                });  
            });  
        
        }
        else{
            key.value = ""
            key.setAttribute("placeholder", "NOT VALID")
        }
    })
})

chrome.action.onClicked.addListener(function(tab) {
    chrome.action.setTitle({tabId: tab.id, title: "You are on tab:" + tab.id});
});

