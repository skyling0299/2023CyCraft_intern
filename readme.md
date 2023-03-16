# Cycraft intern homework 2023

A [**Chrome Extension**](https://developer.chrome.com/docs/extensions/) designed with [Express](https://expressjs.com/zh-tw/) and [OpenAI](https://platform.openai.com/) that could：

- translate the content of current tab to traditional Chinese by one click
- translate the user selected content to traditional Chinese
- using [**OPENAI API**](https://platform.openai.com/docs) to do translation

<img src="https://github.com/skyling0299/2023CyCraft_intern/blob/main/assets/translate.gif" width='100%' height='100%'/>


<img src="https://github.com/skyling0299/2023CyCraft_intern/blob/main/assets/selected.gif" width='100%' height='100%'/>

## Overview

1. [**How To Use**](https://github.com/skyling0299/2023CyCraft_intern#how-to-use)
   - [On Your Computer](https://github.com/skyling0299/2023CyCraft_intern#on-your-computer)
2. [**Architecture Design & Explanation**](https://github.com/skyling0299/2023CyCraft_intern#architecture-design--explanation)
   - [Client side](https://github.com/skyling0299/2023CyCraft_intern#client-side-1)：frontend of Chrome extension
   - [Server side](https://github.com/skyling0299/2023CyCraft_intern#server-side-1)：send request to OpenAI
3. [**More about this project**](https://github.com/skyling0299/2023CyCraft_intern#more-about-this-project)
   - [Rate Limit](https://github.com/skyling0299/2023CyCraft_intern#rate-limit)
   - [Problems in develop](https://github.com/skyling0299/2023CyCraft_intern#problems-in-develop)
   - [To be improved](https://github.com/skyling0299/2023CyCraft_intern#to-be-improved)
   - [Conclusive and Timeline](https://github.com/skyling0299/2023CyCraft_intern#conclusive-and-timeline)

## How To Use

### On Your Computer

* Your computer should have downloaded [Node.js](https://nodejs.org/en) before

* Download this repository via `git clone` or from [Releases]("https://github.com/skyling0299/2023CyCraft_intern/blob/release")

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

<img src="https://github.com/skyling0299/2023CyCraft_intern/blob/main/assets/popup.gif" width='100%' height='100%'/>


## Architecture Design & Explanation
### Client Side

#### popup : for user update and input apikey of OpenAI and translate the website

[popup.js]("https://github.com/skyling0299/https://github.com/skyling0299/2023CyCraft_intern/blob/backend_ver/scripts/popup.js")

* Listen to two click event

 * ```save``` : check if the input length > 49, which is the key length of OpenAI API.  
 * ```translate``` : click to translate the whole page 
  
* the message and key will be sent to ```content.js``` by chrome extension's api  ```chrome.tabs.sendMessage```
 
[popup.html](https://github.com/skyling0299/2023CyCraft_intern/blob/main/client/scripts/popup.html): layout of popup


#### [content.js](https://github.com/skyling0299/2023CyCraft_intern/blob/main/client/scripts/content.js)

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

#### [index.js](https://github.com/skyling0299/2023CyCraft_intern/blob/main/server/index.js) : OpenAI api calling and api key updating

* ```POST /set``` : set api key by configure ```.env``` file, reload ```OpenAIApi``` to get latest api key

* ```POST /``` : create completion of OpenAI by ```openai.createCompletion```, send coresponding message to Client Side

 
## More about this project

### Rate Limit

OpenAI has [rate limit]("https://platform.openai.com/docs/guides/rate-limits/overview") of 60 request per minute, and max token per minute according to the model.  

Accourding the recommended soloution on the document, it says we can use exponential backoff to retry the request. During the development, I rarely encounter rate limit, so it is not **very neccessary** to me to solve the problem.  
With the new model ```GPT-4```, it can have 200 request per mininute, despite it can not be used now, but the rate limit may increase in the future.

### Problems in develop

1. Open AI translating problem

    * Batching Problem  
    
        * 問題描述:  
        
        剛開始對於翻譯的構想是可以將翻譯完的文字放回原本的位置(取代原本的語言)，因此一開始我想傳入 array 物件  
        
        根據[Open AI documet of parameters]("https://platform.openai.com/docs/api-reference/completions/create") 以及 [Open AI error mitigation]("https://platform.openai.com/docs/guides/rate-limits/error-mitigation")     這兩個文件，我認為可以嘗試傳入物件，回傳的物件將會是 array ，如此一來對照 DOM節點與翻譯出來的文字節點就能無誤差的把 Open AI 翻譯的結果帶回網頁。
 
        * 問題難點:
        
            1. 第一個碰上的問題是 ```429 too many request```，根據文件描述，使用 batch發送的資料將會算在同一筆 request 中，但實測結果是 Open AI 的一個 batch 中的句子數量(發送的請求)最大為20筆 (prompt.length <= 20, 20 是每分鐘請求最大上限數)，並沒有達到我想要個別翻譯的目標
            
            2. 另一個問題點是我無法計算 max_token 的值應該設為多少，在 batching 中將分開生成回應， max_token 獨立計算。
            
            在同一筆請求中可能存在一篇600字的文章與3個字的句子，當 max_token 過大時將會使同一個 request 可發送的 batching 數量減少(必須遷就字數較多的段落)
            如此一來同一筆 request 可能也無法理想的翻譯20個句子 個句子翻譯，不僅效率減低，也更加容易遇到 ```429 too many request```
            
            3. 最後一個問題是 OpenAI 有時會自動「完成」一個句子，舉以下為例:
            
            > this is a [test]("") sentence
            
            程式將會把以上句子作為三個 node 儲存(中間 link 處作為分隔，其標籤可能是 ```<path>``` 或``` <a> ```或任何其他tag)，利用 batch 的狀況會是 OpenAI 每次都「分開」處理每一個 batch 中的請求
            
            而我得到的回應可能是
            
            > 這是一個故事
            >
            > 這是測試
            >
            > 句子
            
            反而是一起發送(不使用 batch)的翻譯可度性更高
            
            4. 而如此做法其實與每搜尋到一段文字便發送一個請求是相同的，請求數並沒有有效的降低(最理想狀況為 文章節點數/20)，不是我認為比較好的解法

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
    
        剛開始並未設想到後端，僅認為可在 ```Content.js```頁面完成所有請求與回應，因此使用 [Webpack]("https://webpack.js.org/") 作為工具，將 node.js 的 module 與原本的 javascript 打包並嘗試使用 OpenAI api。
        
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

    
1. Front End

    * 框架
    
        剛開始寫套件的時候沒有考慮使用框架是覺得沒有過多需要切版與重複利用的地方，不過寫到最後發現如果要維護或未來功能擴充的話，使用框架會更方便。
    
        如果選擇框架會使用 React ，能夠在 js 中寫 HTML 十分方便也容易管理
    
    * CSS
        
        一開始只想把成果產出，儘管熟悉原生CSS，Tailwind CSS，Bootstrap 等，但並沒有在剛開始就刻版，甚至也沒有想要特別分離出 CSS 檔。這也導致了非常髒的 code: 
        ```
        helper.style.position = "absolute"
        helper.style.zIndex = "2147483647"
        helper.style.width = "20px"
        helper.style.height = "20px"
        helper.style.cursor = "pointer"
        helper.style.backgroundColor = "#DDDDDD"
        helper.style.padding = "3px"
        helper.style.borderRadius = "3%"
        helper.style.left = oRect.x + "px";
        helper.style.top =  window.pageYOffset + oRect.top*0.9  + "px";
        ```
        
        同時也不美觀，僅堪用而已。
        
        最後尚有一點時間，套了一點 bootstrap 的 css 在 ```popup.html```頁面中。
        
2. Back End

    正如我在延伸與問題中描述，理想中我想建立 server 並能夠提供多人使用，如此會需要資料庫、加密等技術。若之後有學習到相關技術會想再完整這個 project 
    
3. 不使用後端的方法: 

    倘若不使用後端，理應也能完成這次作業:
    * 使用 [chrome.storage](https://developer.chrome.com/docs/extensions/reference/storage/)，儲存 API KEY
    * 針對```Refused to set unsafe header "User-Agent"```的問題，我會想嘗試將字串送到 ```background.js``` 發送，或直接```fetch('https://api.openai.com/v1/completions')``` 避免這個問題。
    * ```fetch('https://api.openai.com/v1/completions')``` 在先前嘗試純前端時有試過，是能夠成功發送訊息(即不使用 node.js 的 openAI module)，可證明不使用後端應該也可以完成作業。
    
    
### Conclusive and Timeline

#### Conclusive

從拿到題目開始的初步構想到最後實踐出來充滿了期待、成就感、失落感。

起初以為 OpenAI 很萬能，先前經常使用 ChatGPT 幫忙完成許多工作，如生成程式碼、生成文章、翻譯與總結等等，也會和 ChatGPT 聊天，好奇這個模型生成的答案。不過在完成這個專案的過程中發現它也存在缺點，例如翻譯的值不甚理想、無法完全按照我的想法給出正確答案，也不禁讓我感嘆過好幾次:「怎麼聽不懂我的話呢」。

剛開始閱讀文件時我經常透過自己寫出來的 Extension 翻譯，但最後仍然是妥協於 Google translate 的 Extension；透過調整、想其他的利用方法，最終我還是覺得在大篇文章的翻譯情況下，OpenAI 的語句通順度、專有術語準確率仍舊是比 Google translate 好上許多。

Chrome Extension 是完全沒有接觸過的領域，閱讀文件時發現好在先備知識(HTML JS CSS)我都有，開發期減少了許多重頭學起的困難；限時開發的模式也讓我有一種每天都快要趕不上進度的感覺，不過也因為這樣天天都非常充實，也讓我見識了一下自己進入大學階段兩年的成長，同時顧及考試、作業、實驗室報告、社團成果發表以及專案，每天都忙得不可開交，卻也很開心自己能夠做好每件事。

開發的過程很快樂，儘管專案中依舊出現許多技術債，例如在這次專案中我使用 ```Promise```的方法不是很好，```Error handling```也有些問題，無法很直觀的提供給使用者目前狀態，在於介面設計上也應該能夠更加完善，希望下次拿起這份專案時能夠有更好的想法完整它。

#### Timeline

* 3/3 - 3/6 Web Scrapying and flitering html tags
* 3/7 - 3/8 CSP problem and get familiar to OpenAI request
* 3/9 - 3/10 building server side, streaming client side and server side
* 3/11 trying batching
* 3/12 building **selection and translate** feature
* 3/13 building popup page, let user fill in api key
* 3/14 Optimize the original translation
* 3/15 writing README file
* 3/16 fix api key storage, fix logical bugs
* 3/17 push release v1.0, FINISH
