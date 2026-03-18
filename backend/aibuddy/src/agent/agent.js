const { StateGraph, MessagesAnnotation } = require("@langchain/langgraph");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ToolMessage } = require("@langchain/core/messages");
const tools = require('./tools');

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0, 
    apiKey: process.env.GEMINI_API_KEY,
    maxRetries: 2,
});

const graph = new StateGraph(MessagesAnnotation)
    .addNode("tools", async (state, config) => {
        const lastMessage = state.messages[state.messages.length - 1];
        const toolCalls = lastMessage.tool_calls || [];

        const toolCallResults = await Promise.all(toolCalls.map(async (call) => {
            // Humne tools.js se pure objects export kiye hain (searchProduct, addProductToCart)
            const tool = tools[call.name];
            
            if (!tool) {
                return new ToolMessage({
                    content: `Error: Tool ${call.name} not found`,
                    tool_call_id: call.id,
                });
            }

            console.log("Executing Tool:", call.name);

            // IMPORTANT: LangChain tools ko call karne ka sahi tarika unka invoke method hai
            // ya fir seedha func ko context ke saath call karna
            try {
                const toolResult = await tool.invoke({ ...call.args }, config);

                return new ToolMessage({
                    content: typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult),
                    tool_call_id: call.id,
                    name: call.name
                });
            } catch (err) {
                return new ToolMessage({
                    content: `Tool Error: ${err.message}`,
                    tool_call_id: call.id,
                });
            }
        }));

        return { messages: toolCallResults }; 
    })
    .addNode("chat", async (state, config) => {
        // Saare tools ko array mein convert karke pass karna
        const toolList = Object.values(tools); 
        const response = await model.invoke(state.messages, {
            tools: toolList,
        });

        return { messages: [response] };
            })
    .addEdge("__start__", "chat")
    .addConditionalEdges("chat", (state) => {
        const lastMessage = state.messages[state.messages.length - 1];
        if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
            return "tools";
        }
        return "__end__";
    })
    .addEdge("tools", "chat");

const agent = graph.compile();
module.exports = agent;