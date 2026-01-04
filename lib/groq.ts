import Groq from "groq-sdk";
import { getEnv } from "./env";

export const groq = new Groq({
  apiKey: getEnv("GROQ_API_KEY"),
});
