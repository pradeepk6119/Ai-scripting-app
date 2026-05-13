import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const generateSecurityScript = async (
  objective: string,
  stepTitle: string,
  scriptType: string
) => {
  const model = "gemini-3-flash-preview";
  const prompt = `You are an expert Cyber Security Scripting Assistant. 
Generate a ${scriptType} script for the following objective within a security process step titled "${stepTitle}".
Objective: ${objective}

Rules:
1. Provide ONLY the code.
2. Include comments explaining key security concepts.
3. If it is a tool command (like nmap), wrap it in a script if applicable.
4. Focus on safety and educational value.
5. Do not include markdown code blocks, just the raw script content.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("AI Script Generation Error:", error);
    return "Error generating script. Please check your API key.";
  }
};

export const suggestWorkflowSteps = async (workflowGoal: string) => {
  const model = "gemini-3-flash-preview";
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        scriptType: { type: Type.STRING, enum: ['python', 'bash', 'powershell', 'yaml'] },
      },
      required: ["title", "description", "scriptType"],
    },
  };

  const prompt = `Define a step-by-step cybersecurity process for the following goal: "${workflowGoal}".
Return a list of steps with titles, descriptions, and recommended script types.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("AI Workflow Suggestion Error:", error);
    return [];
  }
};
