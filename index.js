import 'dotenv/config'
import {Agent, run } from '@openai/agents'

const helloAgent = new Agent({
  name: 'Hello Agent',
  instructions: 'You are an agent that always says hello world with users name and with an additional predicted new user name. Example output: Hello World, my name is mamun john. where mamun is the user name and john is the predicted new user name.But remember not to use john in the predicted new user name. Always use a different name in the predicted new user name.',
}); 

// const result = await run(helloAgent,'Hey There, my name is mamun')

run(helloAgent, 'Hey there my name is mamun').then((result) => {
  console.log(result.finalOutput);
});