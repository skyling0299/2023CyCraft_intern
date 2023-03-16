import express from 'express';
import * as dotenv from 'dotenv'
import cors from 'cors'
import { Configuration, OpenAIApi } from 'openai';
import fs from 'fs'
import os from 'os'

dotenv.config({ override: true });

let openai;
if(process.env.OPENAI_API_KEY != "YOUR_API_KEY"){
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    openai = new OpenAIApi(configuration);
}


function setEnvValue(key, value) {

    const ENV_VARS = fs.readFileSync("./.env", "utf8").split(os.EOL);
    const target = ENV_VARS.indexOf(ENV_VARS.find((line) => {
        return line.match(new RegExp(key));
    }));
    ENV_VARS.splice(target, 1, `${key} = "${value}"`);
    fs.writeFileSync("./.env", ENV_VARS.join(os.EOL));
    
}


const app = express();
app.use(cors());
app.use(express.json())

app.get('/set', function (req, res) {
    res.send('Running...');
 });

app.post('/set', async(req, res) =>{
    setEnvValue("OPENAI_API_KEY", req.body.key.content);
    const configuration = new Configuration({
        apiKey: req.body.key.content,
    });
    openai = new OpenAIApi(configuration);
    res.status(200).send("success")
})

app.post('/', async(req, res) => {
    try{
        const prompts = req.body.prompt
        const response = await openai.createCompletion({
            model: "text-davinci-002", 
            prompt: prompts,
            max_tokens: 1000,
            temperature: 0.3,
        }).then(function(aiResponse){
            if(aiResponse.statusText == 'OK'){
                res.status(200).send({
                    translated : aiResponse.data.choices[0]
                })
            }
            else{
                return Promise.reject
            }
        }).catch((e)=>{
            if(e.response.status == 401){
                res.status(401).send(e.response.statusText)
            }
            else if(e.response.status == 429){
                res.status(429).send(e.response.statusText)
            }
            else{
                res.status(500).send(e)
            }
        })
    }
    catch(e){
        console.log(e)
    }
    
})

app.listen(5000, ()=>console.log("server 5000"))