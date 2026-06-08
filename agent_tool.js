import 'dotenv/config'
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import axios from "axios";


const getWeatherResultSchema = z.object({
    city: z.string().describe("The location for which to get weather information"),
    degree_c : z.number().describe("The current temperature in degree celsius"),
    condition: z.string().optional().describe("The current weather condition (e.g., sunny, rainy, etc.)"),
});

const getWeather = tool({
  name: "get_weather",
  description: "Get the current weather for a given location",
  parameters: z.object({
    city: z.string().describe("The location for which to get weather information")
  }),
  execute: async ({ city }) => {
    const url = `https://wttr.in/${city.toLowerCase()}?format=j1`;

    const response = await axios.get(url, {responseType: 'text'})
    return `The current weather in ${city} is ${response.data}`;
  }
});

const agent = new Agent({
  name: "Suggestion Agent",
  instructions: "You are an expert weather agent that helps user to tell wheather it's good for playing cricket today or not based on the  weather report",
  tools: [getWeather],
  outputType: getWeatherResultSchema
});

async function main(query= '') {
 const result = await run(agent, query);
    console.log('Result:',result.finalOutput.degree_c);
}


main('Is it ok to play cricket in Dhaka?');