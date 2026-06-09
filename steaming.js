import 'dotenv/config'
import {Agent, run} from '@openai/agents'
import { json } from 'zod';


const agent = new Agent ({
    name :'Storyteller',
    instructions:'You are a story teller.'
})

async function* streamOutput (q)
{
const result = await run(agent, q, {stream : true})
const stream = result.toTextStream()

for await(const val of stream){
 yield {isCompleted: false,value : val}
}

yield {isCompleted:true, value : result.finalOutput}
}

async function main(params) {
  for await(const o of streamOutput(params))
  {
    console.log(o);
    
  }
}

main('In 300 words tell me story about macbook')