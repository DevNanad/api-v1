import { promises as fsp } from "fs";
import fs from "fs";
import mammoth from "mammoth";
//import pdf from "pdf-parse";
import xlsx from "xlsx";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import { MongoClient } from "mongodb";
import "dotenv/config";

const client = new MongoClient(process.env.MONGODB_ATLAS_URI || "");
const collection = client
  .db(process.env.MONGODB_ATLAS_DB_NAME)
  .collection(process.env.MONGODB_ATLAS_COLLECTION_NAME);

const docs_dir = "./src/assets/";

async function extractTextFromDocx(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value; // The plain text content
}

async function extractTextFromPdf(filePath) {
  const dataBuffer = await fsp.readFile(filePath);
  const data = await pdf(dataBuffer);
  return data.text; // The plain text content
}

async function extractTextFromXlsx(filePath) {
  const workbook = xlsx.readFile(filePath);

  const sheetNames = workbook.SheetNames;
  let text = "";

  for (const sheetName of sheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    text += xlsx.utils.sheet_to_json(worksheet);
  }
  return text;
}

// Function to split text into chunks
// function splitTextIntoChunks(text, chunkSize, chunkOverlap) {
//   const chunks = [];
//   const words = text.split(/\s+/); // Split by whitespace

//   for (let i = 0; i < words.length; i += chunkSize - chunkOverlap) {
//     const chunk = words.slice(i, i + chunkSize).join(" ");
//     if (chunk.trim()) {
//       // Ensure chunk is not just whitespace
//       chunks.push(chunk);
//     }
//   }

//   return chunks;
// }

async function vectorizeDocuments() {
  console.log("Current working directory:", process.cwd()); // Log current directory
  await client.connect();
  const fileNames = await fsp.readdir(docs_dir);
  console.log("Files found in assets directory:", fileNames); // Log found files

  for (const fileName of fileNames) {
    const filePath = `${docs_dir}/${fileName}`;
    console.log(`Attempting to read file at: ${filePath}`); // Log the path

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File does not exist: ${filePath}`);
      continue; // Skip to the next file
    }

    let document;

    try {
      if (fileName.endsWith(".docx")) {
        document = await extractTextFromDocx(filePath);
        console.log("Extracted document text:", document);
      } else if (fileName.endsWith(".pdf")) {
        document = await extractTextFromPdf(filePath);
      } else if (fileName.endsWith(".xlsx")) {
        console.log("HIi");
        document = await extractTextFromXlsx(filePath);
      } else {
        console.warn(`Unsupported file type for ${fileName}`);
        continue; // Skip unsupported file types
      }

      console.log(`Vectorizing ${fileName}`);

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 50,
        chunkOverlap: 1,
        // separators: ["|", "##", ">", "-", ":"],
        separators: [":"],
      });

      const docOutput = await splitter.splitDocuments([
        new Document({ pageContent: document }),
      ]);
      console.log(docOutput);

      // Ensure output is not empty
      if (docOutput.length === 0) {
        console.warn(`No chunks to vectorize for ${fileName}`);
        continue; // Skip empty documents
      }

      // Perform vectorization
      await MongoDBAtlasVectorSearch.fromDocuments(
        docOutput,
        new OpenAIEmbeddings(),
        {
          collection,
          indexName: "default",
          textKey: "text",
          embeddingKey: "embedding",
        }
      );
    } catch (error) {
      console.error(`Error processing ${fileName}:`, error);
    }
  }

  console.log("Done: Closing Connection");
  await client.close();
}

// Run vectorization if this script is executed directly
if (import.meta.url === new URL(import.meta.url).href) {
  vectorizeDocuments().catch((error) => {
    console.error("Error during vectorization:", error);
    process.exit(1);
  });
}
