
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

export class GeminiService {
  constructor() {}

  private getClient() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  /**
   * Generates text content with intelligent model selection and optional search grounding.
   */
  async *generateTextStream(prompt: string, history: any[] = [], imageBase64?: string, mimeType?: string) {
    const ai = this.getClient();
    
    // Intelligent Routing: Use Pro for complex tasks, Flash for standard queries
    const isComplex = /code|math|analyze|research|reasoning|write a book|report/i.test(prompt) || prompt.length > 600;
    const modelName = isComplex ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

    try {
      const config: any = {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingBudget: 0 },
        temperature: 0.7,
      };

      // Enable Google Search for current events/news
      if (/news|today|recent|current|weather|latest|olympics|president|price/i.test(prompt)) {
        config.tools = [{ googleSearch: {} }];
      }

      if (imageBase64) {
        const parts: any[] = [
          { text: prompt },
          {
            inlineData: {
              data: imageBase64.split(',')[1] || imageBase64,
              mimeType: mimeType || 'image/jpeg'
            }
          }
        ];
        const result = await ai.models.generateContentStream({
          model: modelName,
          contents: { parts },
          config
        });
        for await (const chunk of result) {
          yield chunk;
        }
        return;
      }

      const chat = ai.chats.create({ model: modelName, config });
      const result = await chat.sendMessageStream({ message: prompt });
      for await (const chunk of result) {
        yield chunk as GenerateContentResponse;
      }
    } catch (err) {
      console.error("Giga Core Stream Error:", err);
      yield { text: "Neural uplink interrupted. Re-syncing systems..." } as any;
    }
  }

  /**
   * High-fidelity image generation with Pro model support for 2K/4K.
   */
  async generateImage(prompt: string, aspectRatio: string = "1:1", highQuality: boolean = false) {
    if (highQuality && window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
       await window.aistudio.openSelectKey();
    }
    
    const ai = this.getClient();
    const model = highQuality ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';

    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: { parts: [{ text: prompt }] },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
            imageSize: highQuality ? "2K" : "1K"
          }
        }
      });

      const candidate = response.candidates?.[0];
      if (!candidate) throw new Error("Synthesis failed: No candidates returned.");

      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error("Visual buffer empty.");
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) {
        if (window.aistudio) await window.aistudio.openSelectKey();
      }
      throw err;
    }
  }

  /**
   * Veo-powered video generation with status polling.
   */
  async generateVideo(prompt: string, aspectRatio: '16:9' | '9:16' = '16:9', resolution: string = '720p') {
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
      await window.aistudio.openSelectKey();
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const model = resolution === '720p' ? 'veo-3.1-fast-generate-preview' : 'veo-3.1-generate-preview';

    try {
      let operation = await ai.models.generateVideos({
        model: model,
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: resolution as any,
          aspectRatio: aspectRatio
        }
      });

      // Polling loop for long-running video generation
      let attempts = 0;
      while (!operation.done) {
        attempts++;
        if (attempts > 200) throw new Error("Cinematic rendering timeout.");
        await new Promise(resolve => setTimeout(resolve, 8000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) throw new Error("Video manifest not found.");

      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      if (!response.ok) throw new Error("Asset retrieval failure.");
      
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) {
        if (window.aistudio) await window.aistudio.openSelectKey();
      }
      throw err;
    }
  }
}

export const gemini = new GeminiService();
