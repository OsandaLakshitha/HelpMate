import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function testKey() {
  try {
    const models = await groq.models.list();
    console.log("Key is valid. Models accessible:");
    models.data.forEach(m => console.log(m.id));
  } catch (err) {
    console.error("Key error:", err.message);
  }
}

testKey();