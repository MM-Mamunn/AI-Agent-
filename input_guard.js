import 'dotenv/config';
import { Agent, run, InputGuardrailTripwireTriggered } from "@openai/agents";
import { z } from "zod";
import axios from "axios";


const mathInputAgent = new Agent({
    name:"math query checker",
    instructions: `You are an expert agent that checks if the user query is related to math or not.
    Rules: 
    - The question has to be strictly a maths equation only.
    - Reject any other queries even if they are related to maths.
    `,
    outputType: z.object({
        isMathQuery: z.boolean().describe("Whether the user query is related to math or not"),
        reason: z.string().optional().describe("The reason why the query is or isn't related to math"),
    }),
});


const mathInputGuardrail = {
    name : "math_input_guardrail",
    execute:  async ({input}) => {
        const result = await run(mathInputAgent, input);
        console.log('Math Input Guardrail Result:', result.finalOutput.isMathQuery);
    return {
        outputInfo: result.finalOutput.reason || "No reason provided",
        tripwireTriggered: result.finalOutput.isMathQuery?false:true,
    };
    },
};

const mathsAgent = new Agent({
    name: "Maths Agent",
    instructions: `You are an expert maths ai agent.`,
    inputGuardrails: [mathInputGuardrail],
    // outputType: z.object({
    //     answer: z.number().describe("The numerical answer of the math query"),
    // }),
});

async function main(query= '') {
    try{
        const result = await run(mathsAgent, query);
           console.log('Result:',result.finalOutput);
           // console.log('Result:',result.history);
    } catch (error) {
        if(error instanceof InputGuardrailTripwireTriggered){
            console.log(`Input guardrail tripwire triggered for ${error.message}`);
        } else {
            console.error('Error:', error);
        }
    }
}

main('what is 2 + 2?'); // This should pass the guardrail