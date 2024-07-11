import { parentPort, workerData } from "worker_threads";
import { chunkAndEmbedFile, processFile } from "../documentProcessor";

// let tokenizer: any;
// let model: any;

// const model_name = "sentence-transformers/all-MiniLM-L12-v2";

// async function initializeModel() {
//   const { AutoModel, AutoTokenizer } = await import("@xenova/transformers");
//   model = await AutoModel.from_pretrained(model_name);
//   tokenizer = await AutoTokenizer.from_pretrained(model_name);
// }

// async function generateEmbedding(texts: string[]): Promise<number[][]> {
//   const inputs = await tokenizer(texts, {padding: true, truncation: true, return_tensors: "pt"});
//   const outputs = await model(inputs);
//   const embeddings = outputs.last_hidden_state.mean(1).detach().cpu().numpy();
//   return embeddings;
// }

async function processFileWorker() {
  const { fileData, fileType, fileName, documentId, documentUrl } = workerData;
  try {
    const { documentContent } = await processFile(
      fileName,
      fileData,
      fileType
    );
    const { document } = await chunkAndEmbedFile(
      documentId,
      documentUrl,
      documentContent
    );
    parentPort?.postMessage({ document });
  } catch (error: any) {
    parentPort?.postMessage({ error: error.message });
  }
}

//initializeModel().then(() => processFileWorker());
processFileWorker();