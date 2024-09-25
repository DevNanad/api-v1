import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.OPENAI_KEY;

//environment variable is not getting read by this function   TODO
const openai = new OpenAI({
  apiKey: apiKey,
});

export const getResponse = async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: "Good Day chat GPT",
        },
      ],
      model: "gpt-4o",
    });

    console.log(completion);

    res.status(200).json(completion);
  } catch (error) {
    console.log("Error in getResponse: ", error);
    res.send(error);
  }
};
