import express from 'express';
import * as dotenv from 'dotenv'
import cors from 'cors'
import { Configuration, OpenAIApi } from 'openai';
import fs from 'fs'
import os from 'os'

dotenv.config({ override: true });
let configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
let openai = new OpenAIApi(configuration);

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
    res.send('Hello World');
 });

app.post('/set', async(req, res) =>{
    console.log(req.body.key.content)
    setEnvValue("OPENAI_API_KEY", req.body.key.content);
    configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    openai = new OpenAIApi(configuration);
    res.status(200).send("i got it")
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
                res.status(500).send('Something went wrong')
            }
        })
    }
    catch(e){
        console.log(e)
        
        res.status(500).send(e || 'Something went wrong')
    }
})

app.listen(5000, ()=>console.log("server 5000"))