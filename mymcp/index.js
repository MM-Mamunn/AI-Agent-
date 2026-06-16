import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
const server = new McpServer({
    name:'Weather Data Fetcher',
    version:'1.0.0',
});

async function getWeatherByCity(city ='') {
    if(city.toLowerCase() === 'chittagong')
    {return {temp:'30C', forecast:'Chances of rain'};
    }
    else if(city.toLowerCase() === 'dhaka')
    {return {temp:'40C', forecast:'Cloudy'};
    }
    return {temp:null, forecast:'Unable'};
    
}

server.tool('getWeatherDataByCityName', {
    city:z.string()
  }, async({city}) =>{
    return {content : [{ type:'text', text:JSON.stringify(await getWeatherByCity(city))}]};
  }
);

async function init()
{
const transport = new StdioServerTransport();
await server.connect(transport);
}

init();