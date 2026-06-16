import 'dotenv/config'
import { Agent, run, MCPServerStreamableHttp } from "@openai/agents";

const githubMcpServer = new MCPServerStreamableHttp({
    url : 'https://gitmcp.io/openai/codex',
    name:'GitMCP Documentation Server',
})



const agent = new Agent({
    name: 'MCP Assistant',
    instructions:'You must always use the MCP tools to answer questions.',
    mcpServers:[githubMcpServer]
});

async function main(q:string) {
    await githubMcpServer.connect();
    const result = await run (agent,q);
    console.log(result.finalOutput);
    await githubMcpServer.close();
}

main('What is this repo is about?')