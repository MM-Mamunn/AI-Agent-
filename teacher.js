import 'dotenv/config'
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import axios from "axios";


const getTeacher = tool({
  name: "get_teacher",
  description: "Get information about all the teacher in the university",
  parameters: z.object({
    // city: z.string().describe("The location for which to get weather information")
  }),
  execute: async () => {
    const url = `https://iiuc-resources-management-api.vercel.app/api/info/teacher/?page=1&limit=10000`;

    const response = await axios.get(url, {responseType: 'json'})
    const teachers = response.data.rows ?? response.data.data ?? response.data;

  const readable = Array.isArray(teachers)
    ? teachers.map((t, i) => {
        return `${i + 1}. ${t.name || "N/A"}\n` +
               `   Code: ${t.code || "N/A"}\n` +
               `   Designation: ${t.desig || "N/A"}\n` +
               `   Phone: ${t.phone || "N/A"}\n` +
               `   Email: ${t.email || "N/A"}\n` +
               `   Type: ${t.type || "N/A"}`;
      }).join("\n\n")
    : JSON.stringify(teachers, null, 2);
console.log(readable);

  return `Teacher information:\n\n${readable}`;
  }
});

const agent = new Agent({
  name: "Teacher Agent",
  instructions: "You are an expert teacher agent that helps user to get information about any teacher in the university, You get all the information of all the teacher in the university and then you can answer any question about any teacher in the university based on the information you have.",
  tools: [getTeacher]
});

async function main(query= '') {
 const result = await run(agent, query);
    console.log('Result:',result.finalOutput);
}


main('I want to know about any two teacher in the university');