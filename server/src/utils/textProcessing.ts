import axios from 'axios';
import cheerio from 'cheerio';
import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import nlp from 'compromise';
import { PDFDocument, rgb } from 'pdf-lib';

export const extractTextFromUrl = async (url: string) => {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  return $('body').text();
};

export const cleanText = (text: string) => {
  return text.replace(/\s+/g, ' ').trim();
};

export const summarizeText = async (text: string) => {
  const model = await use.load();
  const sentences = text.split('. ');
  const embeddings = await model.embed(sentences);
  const sentenceVectors = embeddings.arraySync();

  // Simple summarization: select the first few sentences
  const summary = sentences.slice(0, 3).join('. ');
  return summary;
};

export const redactSensitiveInfo = (text: string) => {
  const doc = nlp(text);
  let redactedText = text;
  doc.people().forEach(person => {
    redactedText = redactedText.replace(person.text(), '[REDACTED]');
  });
  doc.organizations().forEach(org => {
    redactedText = redactedText.replace(org.text(), '[REDACTED]');
  });
  doc.places().forEach(place => {
    redactedText = redactedText.replace(place.text(), '[REDACTED]');
  });
  return redactedText;
};

export const anonymizeText = (text: string) => {
  const doc = nlp(text);
  let anonymizedText = text;
  doc.people().forEach(person => {
    const pseudonym = Math.random().toString(36).substring(2, 10);
    anonymizedText = anonymizedText.replace(person.text(), pseudonym);
  });
  doc.organizations().forEach(org => {
    const pseudonym = Math.random().toString(36).substring(2, 10);
    anonymizedText = anonymizedText.replace(org.text(), pseudonym);
  });
  doc.places().forEach(place => {
    const pseudonym = Math.random().toString(36).substring(2, 10);
    anonymizedText = anonymizedText.replace(place.text(), pseudonym);
  });
  return anonymizedText;
};

export const redactPdf = async (pdfBytes: Uint8Array, sensitiveWords: string[]) => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    const textContent = await page.getTextContent();
    const textItems = textContent.items;

    for (const item of textItems) {
      const text = item.str;
      for (const word of sensitiveWords) {
        if (text.includes(word)) {
          const { x, y, width, height } = item.transform;
          page.drawRectangle({
            x,
            y,
            width,
            height,
            color: rgb(0, 0, 0),
          });
        }
      }
    }
  }

  const pdfBytesRedacted = await pdfDoc.save();
  return pdfBytesRedacted;
};