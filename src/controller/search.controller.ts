import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_ATLAS_URI || "");
const collection = client
  .db(process.env.MONGODB_ATLAS_DB_NAME)
  .collection(process.env.MONGODB_ATLAS_COLLECTION_NAME);

export const searchVector = async (req, res, next) => {
  try {
    const question = req.body.question; // assuming the question is sent in the body

    const vectorStore = new MongoDBAtlasVectorSearch(
      new OpenAIEmbeddings({
        modelName: "text-embedding-ada-002",
        stripNewLines: true,
      }),
      {
        collection,
        indexName: "default",
        textKey: "text",
        embeddingKey: "embedding",
      }
    );

    const retriever = vectorStore.asRetriever({
      searchType: "mmr",
      searchKwargs: {
        fetchK: 20,
        lambda: 0.1,
      },
    });

    const retrieverOutput = await retriever.invoke(question);

    const TEMPLATE = `You are a very enthusiastic freeCodeCamp.org representative who loves to help people! Given the following sections from the freeCodeCamp.org contributor documentation, answer the question using only that information, outputted in markdown format. If you are unsure and the answer is not explicitly written in the documentation, say "Sorry, I don't know how to help with that."
  
    Context sections:
    ${JSON.stringify(retrieverOutput)}
  
    Question: """
    ${question}
    """
    `;

    const chat = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      streaming: true,
    });

    console.log(TEMPLATE);

    const response = await chat.invoke([new HumanMessage(TEMPLATE)], {
      callbacks: [
        {
          handleLLMNewToken(token) {
            console.log({ token });
          },
        },
      ],
    });

    //console.log(response);

    return res.json(response);
  } catch (error) {
    next(error);
    res.send(error);
  }
};
