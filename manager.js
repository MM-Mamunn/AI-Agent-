import 'dotenv/config';
import { Agent, run, tool } from "@openai/agents";

import { z } from "zod";
import axios from "axios";

import fs from 'node:fs/promises';


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
    instructions: `You are an expert issueing refund to the customer`,
    tools: [processRefund]
});

const salesAgent = new Agent({
    name: "Sales Agent",
    instructions: `You are an expert sales agent for an Internet broadband company. Talk to the user and help them with what they need`,
    tools: [fetchAvailablePlanes, refundAgent.asTool({
        toolName: "refund expert",
        toolDescription: "This tool is for processing refunds for customers. If the user needs a refund, use this tool to process it."
    })]
});

async function runAgent(query= '') {
const result = await run(salesAgent, query);
console.log('Results:',result.finalOutput);
}

runAgent(' I need a refund now. My customer id is 231');