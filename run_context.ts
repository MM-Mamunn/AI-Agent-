import 'dotenv/config'
import {Agent, run} from '@openai/agents'
import { json } from 'zod';


interface MyContext {
    userId: string,
    userName : string;
}

const customerSupport = new Agent<MyContext>  ({
    name :'Customer support agent',
    instructions : ({context})=>{
        return `You are an expert customer support agent +\nContext:${JSON.stringify(context)}`
    }
});

async function main(query: string, ctx : MyContext) {
const result = await run(customerSupport,query, {
    context :ctx,
})
console.log('result:', result.finalOutput);
   
}

main('Hi', {userId: '1',userName: 'Mamun Mahmud'})