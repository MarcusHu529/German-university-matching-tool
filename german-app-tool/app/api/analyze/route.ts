import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import requirements from '../../../data/requirements.json';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: Request) {
  try {
    const { courses, targetSchool } = await req.json();
    
    const schoolReqs = requirements[targetSchool as keyof typeof requirements];
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      You are an expert German university admission officer. 
      I am providing my US bachelor's transcript: ${JSON.stringify(courses)}.
      
      The target master's program has the following ECTS requirements: ${JSON.stringify(schoolReqs)}.
      
      Task:
      1. Convert my US credits to ECTS (assume 1 US credit = 2 ECTS).
      2. Categorize my courses into the required categories for the target program.
      3. Calculate the total ECTS I have for each category.
      4. Tell me if I meet the requirements, and if not, exactly which categories I am deficient in.
      
      Keep the output structured, clear, and easy to read. Use Markdown formatting.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return NextResponse.json({ result: responseText });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: 'Failed to analyze transcript' }, { status: 500 });
  }
}