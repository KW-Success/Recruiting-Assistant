import { GoogleGenAI, Type } from "@google/genai";
import { AgentData, AnalysisResult, SynthesisResult } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY || '' });

/**
 * Stage 1: Extraction logic for scanning production prints.
 */
export const extractAgentData = async (base64Image: string): Promise<Partial<AgentData>> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: 'Extract real estate agent production data from this image. Map it to JSON fields: agentName, currentBrokerage, closedVolume, closedUnits, listingsTaken, gci, commissionRate, buySideUnits, sellSideUnits, yearsInBusiness, primaryServiceArea, marketShare, averageDaysOnMarket, productionTrend. If a field is not found, leave it empty. Return ONLY valid JSON.' }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            agentName: { type: Type.STRING },
            currentBrokerage: { type: Type.STRING },
            closedVolume: { type: Type.STRING },
            closedUnits: { type: Type.STRING },
            listingsTaken: { type: Type.STRING },
            gci: { type: Type.STRING },
            commissionRate: { type: Type.STRING },
            buySideUnits: { type: Type.STRING },
            sellSideUnits: { type: Type.STRING },
            yearsInBusiness: { type: Type.STRING },
            primaryServiceArea: { type: Type.STRING },
            marketShare: { type: Type.STRING },
            averageDaysOnMarket: { type: Type.STRING },
            productionTrend: { type: Type.STRING },
          }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Extraction error:", e);
    return {};
  }
};

/**
 * Stage 2: Gap analysis using the KW Business Consultant persona.
 */
export const analyzeGaps = async (data: AgentData): Promise<AnalysisResult> => {
  const ai = getAI();
  const prompt = `You are a world-class KW Business Consultant. 
  Perform a deep gap analysis for: ${data.agentName}
  Production Data:
  - Brokerage: ${data.currentBrokerage}
  - Volume: ${data.closedVolume}
  - Listings: ${data.listingsTaken}
  - Trend: ${data.productionTrend}
  
  Focus on identifying business gaps and providing 3-5 high-impact recruiting questions using the Needs Analysis framework (Goals, Why, Reality, Gaps).
  Return as JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          gapAnalysis: { type: Type.STRING, description: "Professional text analysis of gaps." },
          recruitingQuestions: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "A list of 3-5 consulting questions."
          }
        },
        required: ["gapAnalysis", "recruitingQuestions"]
      }
    }
  });

  return JSON.parse(response.text || '{"gapAnalysis": "Error generating analysis.", "recruitingQuestions": []}');
};

/**
 * Stage 4: Synthesis of all gathered data into an executive summary.
 */
export const synthesizeMeeting = async (
  agentData: AgentData, 
  analysis: AnalysisResult, 
  appointmentNotes: string,
  noteImageBase64?: string
): Promise<SynthesisResult> => {
  const ai = getAI();
  
  const contents: any[] = [
    { text: `Synthesize a business consultation summary.
    Agent: ${agentData.agentName}
    Initial Analysis: ${analysis.gapAnalysis}
    Meeting Notes: ${appointmentNotes}
    
    Structure the response into: 
    1. Current Structure (Production and status)
    2. Primary Gaps (Missed opportunities)
    3. Appointment Breakthroughs (Key realizations during the meeting)
    4. Next Actions (Specific commitments/next steps)
    
    Return as JSON.` }
  ];

  if (noteImageBase64) {
    contents.unshift({ inlineData: { mimeType: 'image/jpeg', data: noteImageBase64 } });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: { parts: contents },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          currentStructure: { type: Type.STRING },
          primaryGaps: { type: Type.STRING },
          breakthroughs: { type: Type.STRING },
          nextActions: { type: Type.STRING }
        },
        required: ["currentStructure", "primaryGaps", "breakthroughs", "nextActions"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};
