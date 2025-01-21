// import { AIMessage, HumanMessage } from "@langchain/core/messages";
// import { ChatOpenAI } from "@langchain/openai";
// import { StreamingTextResponse, LangChainStream, Message } from "ai/prompts";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

import { ValidationError } from "../modules/errors.module";

const apiKey = process.env.OPENAI_API_KEY;

//environment variable is not getting read by this function   TODO
const openai = new OpenAI({
  apiKey: apiKey,
});

export const sendResponse = async (req, res, next) => {
  try {
    const { promt, input } = req.body;
    if (!promt) return next(new ValidationError());

    const command = input ?? "";
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `${command} ${promt}`,
        },
      ],
      model: "gpt-4o",
    });

    //console.log(completion);

    res.status(200).json({ message: "helloooo world" });
  } catch (error) {
    next(error);
    res.send(error);
  }
};
