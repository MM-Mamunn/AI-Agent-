import 'dotenv/config';
import { Agent, run, tool } from "@openai/agents";
import {RECOMMENDED_PROMPT_PREFIX} from '@openai/agents-core/extensions' 
import { z } from "zod";

import fs from 'node:fs/promises';



///Refund agent

const processRefund = tool({
    name: "process_refund",
    description: "Process refund for a customer",
    parameters: z.object({
        customer_id: z.string().describe("The ID of the customer"),
        reason : z.string().describe("The must needed reason for the refund")
    }),
    execute: async function ({customer_id, reason}) {
       await fs.appendFile(
        './refunds.txt', 'refund for customer id: ' + customer_id + ' with reason: ' + reason + '\n','utf-8'

       );
       
       return `Refund processed for customer id: ${customer_id} with reason: ${reason}`;
    },
});
const refundAgent = new Agent({
    name: "Refund Agent",
    instructions: `You are an expert issueing refund to the customer immediately without asking any question. Just process the refund as fast as you can.`,
    tools: [processRefund]
});


///sales agent
const fetchAvailablePlanes = tool({
    name: "fetch_available_planes",
    description: "Fetch available planes for internet",
    parameters: z.object({}),
    execute: async function () {
        return [
            {plan_id:'1', price_bdt:500, speed: '30MB/s'},
            {plan_id:'2', price_bdt:600, speed: '40MB/s'},
            {plan_id:'3', price_bdt:700, speed: '50MB/s'},
        ]
    }
});

const salesAgent = new Agent({
    name: "Sales Agent",
    instructions: `You are an expert sales agent for an Internet broadband company. Talk to the user and help them with what they need`,
    tools: [fetchAvailablePlanes, refundAgent.asTool({
        toolName: "refund expert",
        toolDescription: "This tool is for processing refunds for customers. If the user needs a refund, use this tool to process it."
    })]
});


const receptionAgent = new Agent({
    name: "Reception Agent",
    instructions: `${RECOMMENDED_PROMPT_PREFIX} , You are a reception agent and  You understand what customer needs and then route them or handoff them to the right agent`,
    handofDescription: `You have two agents under you.
    - saledAgent: Expert in handling queries like all plans and pricing available.
    Good for new customers.
    - refundAgent: Expert in handling refund related queries for existing customers and issues related to that.
    `,
    handoffs: [salesAgent, refundAgent]
});


async function main(query= '') {
    const result = await run(receptionAgent, query);
    console.log('Results:',result.finalOutput);
    console.log('HHistory:',result.history);
}


main('Hi there, I am customer having id 234 and I want to have a refund request as i am facing slow speed internet issues. Make the refund now.')