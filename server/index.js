import express from 'express';
import * as dotenv from 'dotenv'
import cors from 'cors'
import { Configuration, OpenAIApi } from 'openai';

dotenv.config();
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


const app = express();
app.use(cors());
app.use(express.json())


  
app.post('/', async(req, res) => {
  
    try{
        const prompts = req.body.prompt
        console.log(prompts.length/2)
        const response = await openai.createCompletion({
            model: "text-davinci-002", 
            prompt: prompts,
            max_tokens: 1000,
            temperature: 0.3,
        }).then(function(aiResponse){
            if(aiResponse.statusText == 'OK'){
                res.status(200).send({
                    translated : aiResponse.data.choices
                })
            }
            else{
                res.status(500).send('Something went wrong')
            }
        })
    }
    catch(e){
        console.log(e.response.data)
        res.status(500).send(e || 'Something went wrong')
    }
})

app.listen(5000, ()=>console.log("server 5000"))