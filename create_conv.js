import 'dotenv/config'
import {OpenAI} from 'openai' 
import {Agent , run, tool} from '@openai/agents';
import { z } from 'zod';

// const client = new OpenAI()


// client.conversations.create({}).then(e=>{
//     console.log(`Conv thread created id = `, e.id)
// });



const executeSQL = tool ({
    name:'execute_sql',
    description :'This executes the SQL Query.',
    parameters: z.object ({
        sql: z.string().describe('the sql query'),
    }),
    execute : async  function (sql){
        console.log(`[SQL] : execute ${sql}`)
        return 'done'
    }
})

const sqlAgent = new Agent({
    name:'SQL expert agent',
    tools:[executeSQL],
    instructions:`you are and expert agent in generating SQL queries as per user request.
    postgres Schema:
Table: employees
Columns:
- id (integer, primary key)
    `,
});

async function main(params) {

    const result = (await run(sqlAgent,params ,{conversationId:'conv_6a284b0dfb248193b5aa5a6f28464f920b733f23474f0132'}));
  console.log(result.finalOutput)
}

main('Write a query to get all user with my name')
