const {HumanMessage, AIMessage, SystemMessage} = require("langchain/schema");
const {res, req} = require("enconvo/bridge");
const {CallbackManager} = require("langchain/callbacks");
const {ChatOpenAI} = require("enconvo/llm/openai");


(async () => {
    const {context, options} = req.body();
    console.log(`process begin...${JSON.stringify(options)} `)

    const chat = new ChatOpenAI({
        streaming: true,
        modelName: options.model,
        temperature: +options.temperature,
        openAIApiKey: options.apiKey,
        verbose: true
    }, {
        basePath: `${options.basePath}/v1`,
        baseOptions: {
            headers: {
                "Http-Referer": "https://enconvo.com",
                "X-Title": "enconvo"
            }
        }
    });

    const messages = context.messages.map((item) => {
        if (item.role === "assistant") {
            return new AIMessage(item.content)
        } else if (item.role === "system") {
            return new SystemMessage(item.content)
        }
        return new HumanMessage(item.content)
    });

    await chat.call(messages, {}, CallbackManager.fromHandlers({
        handleLLMNewToken(token, idx, runId, parentRunId, tags) {
            res.write(token);
        }
    }));
    res.end()
})();
