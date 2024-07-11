import dotenv from "dotenv";
dotenv.config();

interface Config {
  pineconeApiKey: string;
  pineconeIndexName: string;
  pineconeHost: string;
  openAiApiKey: string;
  openAiOrganizationId: string;
}

const config: Config = {
  pineconeApiKey: process.env.PINECONE_API_KEY || "",
  pineconeIndexName: process.env.PINECONE_INDEX_NAME || "namespace-notes",
  pineconeHost: process.env.PINECONE_HOST || "",
  openAiApiKey: process.env.OPENAI_API_KEY || "",
  openAiOrganizationId: process.env.OPENAI_ORGANIZATION_ID || ""
};

export default config;
