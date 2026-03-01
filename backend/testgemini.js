import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();   // ← add this

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
  );

  const data = await response.json();
  console.log(data);
}

test();