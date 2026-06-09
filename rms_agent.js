import 'dotenv/config';
import { Agent, run, InputGuardrailTripwireTriggered, tool } from "@openai/agents";
import { z } from "zod";
import axios from "axios";


///course info
const getCourseInfo = tool({
  name: "get_course_info",
  description: "Get information about a courses.",
  parameters: z.object({}),
  execute: async () => {
    const url = `http://localhost:3000/api/agent/courses`;
    const response = await axios.get(url, {responseType: 'text'})
    return response.data;
  }
});


const rmsCourseAgent = new Agent({
    name:"RMS Course Agent",
    instructions: `You are an expert agent that finds course related information based on user queries.`,
    outputType: z.object({
        courseCode: z.string().describe("The course code related to the user query"),
        courseTitle: z.string().describe("The course title related to the user query"),
        credits: z.number().describe("The number of credits for the course"),
    }),
    tools: [getCourseInfo]
});

const rmsCourseAgentAsTTool = rmsCourseAgent.asTool({
  toolName: 'find_course_info',
  toolDescription: 'Find information about courses based on its code.',
});

///Resource info 
const getResources = tool({
  name: "get_resources",
  description: "Get Resources of a specific courses.",
  parameters: z.object({
    courseCode:z.string().describe("The course Code of the Course of which the query is for.")
  }),
  execute: async ({courseCode}) => {
    const url = `http://localhost:3000/api/agent/courseresources/${courseCode}`;
    const response = await axios.get(url, {responseType: 'text'})
    console.log("response data", response.data);
    
    return response.data;
  }
});


const rmsResourcesAgent = new Agent({
    name:"RMS Resources Agent",
    instructions: `You are an expert agent that finds Resources related to a specific course by the course Code`,
    outputType: z.object({
        courseCode: z.string().describe("The course code related to the user query"),
         resources: z.array(z.string()).describe( "All resource links for the course"),
    }),
    tools: [getResources, rmsCourseAgentAsTTool]
});

const rmsResourceAgentAsTTool = rmsResourcesAgent.asTool({
  toolName: 'find_resources',
  toolDescription: 'Find Resources of a specific course',
});
const mainAgent = new Agent({
    name: "Main Agent",
    instructions: `You are an expert agent that takes student queries and helps them various information.`,
    tools: [rmsCourseAgentAsTTool, rmsResourceAgentAsTTool],
});

async function main(query= '') {
    try {
        const result = await run(mainAgent, query);
        // console.log('Result:', result.history);
        console.log('Result:', result.finalOutput);
    } catch (error) {
        if (error instanceof InputGuardrailTripwireTriggered) {
            console.error("Guardrail triggered:", error.message);
        } else {
            console.error("An error occurred:", error);
        }
    } 
}

main('Write a poem');
