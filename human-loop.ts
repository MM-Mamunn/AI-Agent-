import 'dotenv/config'
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import axios from "axios";
import { SandboxExecError } from '@openai/agents/sandbox';
import { tr } from 'zod/v4/locales/index.js';
import readline from 'node:readline/promises'
import { read } from 'node:fs';


const getWeather = tool({
  name: "get_weather",
  description: "Get the current weather for a given location",
  parameters: z.object({
    city: z.string().describe("The location for which to get weather information")
  }),
  execute: async ({ city }) => {
    const url = `https://wttr.in/${city.toLowerCase()}?format=j1`;

    const response = await axios.get(url, {responseType: 'text'})
    return `The current weather in ${city} is ${response.data}`;
  }
});

const sendEmailTool = tool({

name: 'send email',
description:'Send the email to the user.',
parameters:z.object({
    to:z.string().describe('to email address.'),
    subject:z.string().describe ('Subject of the email.'),
    html:z.string().describe('html body of the email')
}),
needsApproval:true,
execute:async ({to, subject, html})=>{
    // console.log("To ", html);
    // console.log("To ", to);
    const API_KEY='AS_cca8dff45bb11bdf702a1e4326e1ffa2444b929b.7A95bPlwwAGuRMl8ahcYqAVSIVv1q_JyG_G0Mor6je0';
    const response = await axios.post('https://api.autosend.com/v1/emails/send',{
        from :{
            email:'c221046@ugrad.iiuc.ac.bd',
            name:'AI Weather agent'
        },
        to :{
            email :to,
        },
        subject,
        html,
    }, {headers:{
        Authorization:`Bearer ${API_KEY}`,
    },
});
return response.data
},

})
const agent = new Agent({
name: 'Weather Email Agent',
instructions:`You are an expert agent in getting weather info and sending it using email to the user.`,
tools:[getWeather,sendEmailTool]
})

async function  askForUserConfirmations(ques:string) {
 const rl= readline.createInterface({
    input:process.stdin,
    output:process.stdout,
 });
 const answer = await rl.question(`${ques} *y/n:`);
 const normalizedAnswer = answer.toLowerCase();
 rl.close();
 return normalizedAnswer ==='y' || normalizedAnswer === 'yes';
}

async function  main(q:string) {
let result = await run(agent, q);
// console.log(result.interruptions)
let hasInterruptions = result.interruptions.length > 0;
while(hasInterruptions)
{
    const currentState = result.state
    for(const interupt of  result.interruptions)
    {
        if(interupt.type === 'tool_approval_item'){
       const isAllowed = await askForUserConfirmations(
            `Agent ${interupt.agent.name} is asking for calling tool ${interupt.name} with args ${interupt.rawItem}`
        );
        if(isAllowed)
        {
            currentState.approve(interupt)
        }
        else 
        {
            currentState.reject(interupt)
        }
        result  = await run(agent, currentState);
        hasInterruptions = result.interruptions.length > 0;
     }
    }
}
}

main('What is the weather of chittagong and torronto and send me on mamunmahmud756@gmail.com')