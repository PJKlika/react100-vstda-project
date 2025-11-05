import axios from "axios";

export async function parseTodoWithAI(inputText) {
  try {
    const res = await axios.post("/api/ai/parse-todo", { text: inputText });
    return res.data;
  } catch (err) {
    console.error("AI parse error:", err);
    return null;
  }
}
