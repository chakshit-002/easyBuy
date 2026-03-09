// const {StateGraph, MessagesAnnotation} = require("@langchain/langgraph")
//                     //boiler plate type agent ki

// const {ChatGoogleGenerativeAI}  =  require("@langchain/google-genai")

// const { ToolMessage, AIMessage, HumanMessage } = require("@langchain/core/messages")
// const tools = require('./tools')

// const model = new ChatGoogleGenerativeAI({
//     // model : "gemini-3-flash-preview",
//     model : "gemini-2.0-flash",
//     temperature: 0.5,
//     apiKey : process.env.GEMINI_API_KEY
// })

// const graph = new StateGraph(MessagesAnnotation)
//     .addNode("tools",async(state,config)=>{
//                          //data //extra data sab ke pass jaega    
//         console.log("HI")
//         const lastMessage = state.messages[ state.messages.length - 1 ]
//         const toolsCall = lastMessage.tool_calls;

//         const toolCallResults = await Promise.all(toolsCall.map(async(call)=>{

//             const tool = tools[call.name]

//             if(!tool){
//                 throw new Error(`Tool ${call.name} not found`)
//             }

//             const toolInput = call.args;
//             console.log("Invoking tool:", call.name, "with input:", call)
//             const toolResult = await tool.func({...toolInput, token:config.metadata.token})
          
//             return new ToolMessage({
//                 content:toolResult,
//                 name: call.name
//             })

//         }))
//         state.messages.push(...toolCallResults)


//         return state;
        
//     })
//     .addNode("chat",async (state,config)=>{
//         //tools yahan array of object mei bejna pdega object ki keys ko array mei convert krke pr abhi 2 hi hai toh ese kr rhe hai manually
//         const response = await model.invoke(state.messages,{tools:[tools.searchProduct,tools.addProductToCart]})

//         state.messages.push(new AIMessage({ 
//             content: response.text,
//             tool_calls : response.tool_calls
//         }))

//         return state
//     })
//     .addEdge("__start__","chat")
//     .addConditionalEdges("chat",async (state)=>{

//         const lastMessage = state.messages[state.messages.length - 1 ];

//         if(lastMessage.tool_calls && lastMessage.tool_calls.length > 0){
//             return "tools"
//         }else{
//             return "__end__"
//         }
//     })
//     .addEdge("tools","chat")


// const agent = graph.compile()


// module.exports = agent;

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