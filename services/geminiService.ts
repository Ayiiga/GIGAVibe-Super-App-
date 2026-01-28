
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Fix: Using process.env.API_KEY directly as per guidelines
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateViralCaption(input: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a viral, engaging GIGAVibe-style caption and 5 trending hashtags for this topic: ${input}`,
        config: {
          temperature: 0.8,
          thinkingConfig: { thinkingBudget: 0 }
        }
      });
      return response.text || "Failed to generate caption.";
    } catch (error) {
      console.error("Caption error:", error);
      return "Error connecting to AI Lab.";
    }
  }

  async generateGroupDescription(name: string, category: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Write a short, engaging, and welcoming community description for a group named "${name}" in the category "${category}". Keep it under 50 words. Use emojis.`,
        config: {
          temperature: 0.7,
        }
      });
      return response.text || "Welcome to our community! Join us to connect and share.";
    } catch (error) {
      console.error("Group desc error:", error);
      return "Welcome to our community! Join us to connect and share.";
    }
  }

  async generateProductDescription(name: string, category: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Write a short, persuasive, viral product description for a "${name}" in the category "${category}". Use emojis and keep it under 50 words. Focus on benefits.`,
        config: {
          temperature: 0.7,
        }
      });
      return response.text || "Experience premium quality with this verified item. Limited stock available!";
    } catch (error) {
      console.error("Description error:", error);
      return "Experience premium quality with this verified item. Limited stock available!";
    }
  }

  async generateGrowthStrategy(profileStats: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze these social media stats and provide a personalized growth strategy.
        Stats: ${profileStats}
        
        Output format:
        Use emojis.
        1. 📊 Insight: [One sentence analysis]
        2. 🎯 Action Plan: [3 specific, actionable bullet points]
        3. 🏷️ Hashtags: [5 relevant hashtags]
        4. ⏰ Best Posting Time: [Time and rationale]
        
        Keep it concise and encouraging.`,
        config: {
          temperature: 0.7,
        }
      });
      return response.text || "Could not generate strategy.";
    } catch (error) {
      console.error("Strategy error:", error);
      return "Unable to analyze profile at this time.";
    }
  }

  async generateAdVisual(prompt: string, base64Image?: string): Promise<string | null> {
    try {
      const parts: any[] = [];
      
      if (base64Image) {
        // Strip data:image/jpeg;base64, prefix
        const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: 'image/jpeg'
          }
        });
      }

      parts.push({ 
        text: base64Image 
          ? `Modify this image to look like a high-end cinematic advertisement based on this instruction: ${prompt || 'Professional minimalist branding'}`
          : `High quality cinematic advertising visual for: ${prompt}. Minimalist, modern, professional branding.`
      });

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: {
          imageConfig: { aspectRatio: "1:1" }
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (error) {
      console.error("Image gen error:", error);
      return null;
    }
  }

  async generateImage(prompt: string, base64Image?: string, aspectRatio: string = "1:1"): Promise<string | null> {
    try {
      const parts: any[] = [];
      
      if (base64Image) {
        const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: 'image/jpeg'
          }
        });
      }

      parts.push({ 
        text: prompt || "Generate a creative image."
      });

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: {
          imageConfig: { aspectRatio: aspectRatio }
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (error) {
      console.error("Image gen error:", error);
      return null;
    }
  }

  async generateVideo(prompt: string, aspectRatio: string = "9:16"): Promise<string | null> {
    try {
      // Fix: Create new instance before API call to ensure current key is used
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Veo supports 16:9 and 9:16. Map existing UI options to these.
      let targetRatio: '16:9' | '9:16' = '9:16';
      if (aspectRatio === '16:9' || aspectRatio === '4:3') {
        targetRatio = '16:9';
      }
      // 1:1, 9:16, 3:4 default to 9:16

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: targetRatio
        }
      });

      // Poll for completion
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({operation: operation});
      }

      const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (videoUri) {
          // Fix: Append current process.env.API_KEY to fetch link
          const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
          const arrayBuffer = await response.arrayBuffer();
          // Explicitly create a video/mp4 blob to ensure device gallery compatibility
          const blob = new Blob([arrayBuffer], { type: 'video/mp4' });
          return URL.createObjectURL(blob);
      }
      return null;
    } catch (error) {
      console.error("Video gen error:", error);
      return null;
    }
  }
}

export const gemini = new GeminiService();
