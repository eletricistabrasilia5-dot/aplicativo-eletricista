import { GoogleGenAI, Type } from "@google/genai";
import { AISuggestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSmartEstimate = async (jobDescription: string): Promise<AISuggestion[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Atue como um eletricista sênior experiente. Baseado na descrição do serviço abaixo, gere uma lista detalhada de materiais prováveis e etapas de mão-de-obra (serviços) necessários. Estime preços médios de mercado no Brasil (em BRL).
      
      Descrição do serviço: "${jobDescription}"`,
      config: {
        systemInstruction: "Você é um assistente de orçamentos para eletricistas. Seja técnico e preciso.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Nome do item ou serviço" },
              type: { type: Type.STRING, enum: ["Material", "Serviço"] },
              quantity: { type: Type.NUMBER, description: "Quantidade estimada necessária" },
              unit: { type: Type.STRING, description: "Unidade de medida (ex: m, un, h, kit)" },
              estimatedPrice: { type: Type.NUMBER, description: "Preço unitário estimado em R$" },
              reasoning: { type: Type.STRING, description: "Breve explicação do porquê este item é necessário" }
            },
            required: ["name", "type", "quantity", "unit", "estimatedPrice", "reasoning"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AISuggestion[];
    }
    return [];
  } catch (error) {
    console.error("Erro ao gerar estimativa com IA:", error);
    throw error;
  }
};
