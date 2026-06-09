import 'dotenv/config'
import {Agent , run, tool} from '@openai/agents';
// import { describe } from 'zod/v4/core';
import { z } from 'zod';

let sharedHistory = [];
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
    ///Store the message in DB (history)
    sharedHistory.push({role :'user', content : params})
    const result = (await run(sqlAgent,sharedHistory));
    sharedHistory = result.history;
  console.log(result.finalOutput)
}

main('hi, i am mamun').then(() => {
    main('Get me all the users with my name')
})

