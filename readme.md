# Cycraft intern homework 2023

A [**Chrome Extension**](https://developer.chrome.com/docs/extensions/) designed with [Express](https://expressjs.com/zh-tw/) and [OpenAI](https://platform.openai.com/) that could：

- translate the content of current tab to traditional Chinese by one click
- translate the user selected content to traditional Chinese
- using [**OPENAI API**](https://platform.openai.com/docs) to do translation

## Overview

## How To Use

### On Your Computer

* Your computer should have downloaded [Node.js](https://nodejs.org/en) before（Node >= 14.0.0 and npm >= 5.6）

* Download this repository via `git clone` or from [Releases](https://github.com/5j54d93/Dcard-2022-Web-Frontend-Intern-Homework/releases)

```shell
git clone 
```

#### server side

2. Change directories to this repository via `cd` or drag this folder and drop in terminal

```shell
cd 
cd server
```

3. Run this React app

```shell
npm install
node index.js
```

`node index.js` will automatically made the server run at [**http://localhost:5000**](http://localhost:5000) on your computer.

#### client side

3. By following the document in [Chrome extentions]("https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked"), setting up the extension environment

##### Setting up Chrome extension :

1. Go to the Extensions page by entering ```chrome://extensions``` in a new tab.

2. Enable Developer Mode by clicking the toggle switch next to Developer mode.

3. Click the Load unpacked button and select the extension directory.

4. (Optional) Pinned the extension to get access easily

##### Setting up OpenAI API key

Due to the project translate the content using OpenAI, user have to generate a key to use the extension.

1. go to [OpenAI api-keys]("https://platform.openai.com/account/api-keys") and click ```create new secret key ```

2. copy the key and click the extension icon

3. fill in the key into the input blank

insert the picture of how to generate key here


## Architecture Design & Explanation
### Client Side

#### popup : for user update and input apikey of OpenAI and translate the website

[popup.js]("")

* Listen to two click event

 * ```save``` : check if the input length > 49, which is the key length of OpenAI API.  
 * ```translate``` : click to translate the whole page 
  
* the message and key will be sent to ```content.js``` by chrome extension's api  ```chrome.tabs.sendMessage```
 
[popup.html](""): layout of popup

insert the gifs here

#### [content.js]("")

1. collect DOM nodes, get selection text, show the translate result

2. update the api key

* get the page's DOM nodes by  ```getTextNodeList```  

 * the function will do DFS and get every text nodes
 
 * use regular expression ```^<code[^><]*?>[\s\S]+<\/code>$/``` , ```^<script[^><]*?>[\s\S]+<\/script>$``` , ```^[\s\t\n\r\f\v]+$``` to filter content that should not be changed or involved, such as ```<code>``` and  ```<script>``` , or text only contains space
 
* ```translateNodeList``` will cut text nodes to some batches to avoid token exceed  
the max token is 2049 in OpenAI model ```davinci-002```

 * the function will made an request to OpenAI to translate the content every 1000 alphabets approximately
 
* ```translatingRequest``` will use ```POST``` method to send content (type: String) to server side

 * after handling the response, the data will be sent to ```replaceTranslatedNodes```, and replace the translated content to original DOM node
 
* get selection by ```window.getSelection()``` 

 *  ```addIcon``` : show the tool icon above the selected text, listen to click event and made ```translatingRequest```
 
 * ```showTranslated```: show the translated text below the selected text by append nodes to DOM tree
 
* if received message from ```popup.js```

 * translate the webpage
 
 * update api key by using ```POST``` method to send the key to server side
 
### Server Side

#### [index.js]("") : OpenAI api calling and api key updating

* ```POST /set``` : set api key by configure ```.env``` file, reload ```OpenAIApi``` to get latest api key

* ```POST /``` : create completion of OpenAI by ```openai.createCompletion```, send coresponding message to Client Side

 
## More about this project

### Rate Limit

OpenAI has [rate limit]("https://platform.openai.com/docs/guides/rate-limits/overview") of 60 request per min, and max token per minute according to the model.  

Accourding the recommended soloution on the document, it says we can use exponential backoff to retry the request. During the development, I rarely encounter rate limit, so it is not **very neccessary** to me to solve the problem.  
With the new model ```GPT-4```, it can have 200 request per mininute, despite it can not be used now, but the rate limit may increase in the future.

### Problems in develop

1. Open AI translating problem

    * Batching Problem  
    
        * 問題描述:  
        
        剛開始對於翻譯的構想是可以將翻譯完的文字放回原本的位置(取代原本的語言        )，因此一開始我想傳入 array 物件  
        
        根據[Open AI documet of parameters]("https://platform.openai.com/docs/api-reference/completions/create") 以及 [Open AI error mitigation]("https://platform.openai.com/docs/guides/rate-limits/error-mitigation")     這兩個文件，我認為可以嘗試傳入物件，回傳的物件將會是 array ，如此一來對照 DOM     節點與翻譯出來的文字節點就能無誤差的把 Open AI 翻譯的結果帶回網頁。
 
        * 問題難點:
        
            1. 第一個碰上的問題是 ```429 too many request```，根據文件描述，使用 batch             發送的資料將會算在同一筆 request 中，但實測結果是 Open AI 將每一筆 batch               中的值分開發送，以至於達到上限
            
            2. 另一個問題點是我無法計算 max_token 的值應該設為多少，在 batching 中將分開生成回應， max_token 獨立計算。
            
            在同一筆請求中可能存在一篇600字的文章與3個字的句子，當 max_token 過大時將會使同一個 request 可發送的 batching 數量減少(必須遷就字數較多的段落)
            如此一來同一筆 request 可能僅能發送 2-3 個句子翻譯，不僅效率減低，也更加容易遇到 ```429 too many request```
            
            2. 而如此做法其實與每搜尋到一段文字便發送一個請求是相同的，請求數都是文章結點數量，並不是我認為比較好的解法

    * Using String to translate
    
        * 問題描述
        
        接續上一個問題，我參考 Chat GPT 的回應與其他類似開源的作法，將文字以 ```\n```分隔，接成一串龐大的字串。為了避免超過 max_token 的限制，我將每 1000 個字元作為切點，只要達到 1000 字元就將陣列送出，維持每次送出請求的字數穩定。
        使用 [tokenizer]("https://platform.openai.com/tokenizer") 計算 token 數可以發現，以英文字來說，每一個單字約會是一個 token ，但對其他語言(日文、韓文等)，每個字就是一個 token，因此我維持 1000 字元的設定，而非更多(儘管以英文來說，約 1300-1500 字元才會等於 1000 token)。
        
            * 問題難點:
        
                1. 遺憾的是 Open AI 對於不連貫文章的內容無法「分行翻譯」，儘管多次更改指令(使用中文、英文、不同的描述方式)，皆無法使回應每次都完整對照各行。

                尤其部分內容，Open AI 會「回覆」該內容，而非執行「翻譯」的指令，有時是按照要求翻譯完文章後在回應前後加上了與翻譯內容相關的文字，回傳後造成無法對照回原本的節點。同時我也無法判別哪些是應該被對照回節點，哪些是與無關的內容。
            
                2. 剛開始我的解決方法是「只取代前面的 n 個結果」(n 為 DOM node 和 回傳結果的較小值)；但對照出來的結果相差甚遠，於是我做了以下兩個改良:
                
                    * 「只取代當 DOM node 和 回傳結果個數相同」的翻譯結果
                    * 縮小送出翻譯的陣列大小(將1000個字元改為500個字元或更少)
                
                但這樣的結果依然不甚滿意，整個網頁經常只有 1/3 能夠被翻譯出來，大部分回傳結果個數都和傳入的個數不同
                
                3. 在暫時無解的情況下，我做了「選取文字翻譯」功能，期望透過該功能能夠稍微補足這個 extension 缺陷的部分。透過這個功能我更直觀的了解 Open AI 的翻譯有時會有不盡如意的地方，有時單純翻譯一句話也會產生非翻譯的結果。
                
            * 最終解法:
            
            距離交件還有2天時我突然想到了演算法(遞迴、divide and conquer)，於是我嘗試將翻譯有誤差(DOM node 和 回傳結果個數不同)的結果分成兩半再發送一次 request 翻譯，若依舊有誤差就再分半發送 request，直到個數正確或送入單一句子仍翻譯錯誤即停止。
            
            這是目前我想出來能夠最有效率的正確翻譯網頁的方法，其中
            
                * 不需要在剛開始就縮小送出翻譯的陣列大小，而是在回傳結果有誤差後再針對個別結果減少每次送出翻譯的量
                
                * 發送的請求數並未讓我遭遇過多 ```429 too many request ```，翻譯一個網站中通常在最後會遭遇 2-3 個 error，在我能夠接受的範圍內
                
                * 翻譯的結果達到我認為及格的標準，約 8-9 成的文字能夠成功被翻譯成中文。
            
                * 選取文字翻譯的功能，也能夠補強剩下翻譯錯誤與無法翻譯的部分
    
2.  CSP Problem

    * 問題描述:
    
        剛開始並未設想到後端，僅認為可在 ```Content.js```頁面完成所有請求與回應，因此使用 [Webpack]("") 作為工具，將 node.js 的 module 與原本的 javascript 打包並嘗試使用 OpenAI api。
        
    * 問題難點:
        
        1. 根據 CSP 的原則，Webpack 打包後的 ```eval``` 是不被允許的，因此我更改了 ``` webpack.config.js ``` ，使用 ```source map``` 輸出。
        
        2. 解決 CSP 的問題後，OpenAI 可能發現我是透過前端直接發送 API KEY，因此發出錯誤訊息
        ```
        Refused to set unsafe header "User-Agent"
        ```
        
    * 解決方法:
        
        重新閱讀作業要求發現特別提到 **backend engine**，因此著手架設後端。在前後端串接完成後，Open AI api 也運作順利。
        
    * 延伸與問題:
        
        考慮到若進度良好，想發展成建立固定的 server 並持續運作，如此一來其他人想要使用這個 extension 就更容易了，只需要將前端載入 ```chrome://extensions``` 並輸入API KEY 就可以開始使用，不需要安裝 ```node.js``` 以及其他套件
            
        於是我使用校內閒置機器建立了一個 container 來跑我的 server 端，遇到了 ```block mixed content problem``` ，將 http 改為 https 後成功運作。
        
        後來並沒有使用這台機器的原因是因為進行管理的工程過於浩大，在時間緊迫、沒有設立資料庫也對加密沒有研究的情況下我不敢貿然嘗試，不過這段小插曲依舊給我留下了深刻的印象。
        

### To be improved
    
    
 
 
 
 
 
 
 
 

 
 
 
 
 
 
