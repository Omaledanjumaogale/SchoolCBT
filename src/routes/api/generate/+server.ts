// src/routes/api/generate/+server.ts
// AI Question Generation API — SchoolCBT RaaS Engine
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GenerateQuestionsSchema } from '$lib/validation';

// ── Rate limiting (in-memory; use KV in production) ──────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, maxReqs = 10, windowMs = 60_000): boolean {
  const now  = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxReqs) return false;
  entry.count++;
  return true;
}

// ── Types ────────────────────────────────────────────────────
interface GenerateRequest {
  subject:    string;
  examType:   string;
  topics?:    string[];
  difficulty?: 'Easy' | 'Medium' | 'Hard' | 'Mixed';
  count?:     number;
  uid?:       string;
}

// ── Static fallback question bank (used when AI unavailable) ─
const FALLBACK_BANK: Record<string, unknown[]> = {
  Physics: [
    { id:'ph001', q:"Newton's Third Law states:", opts:["F=ma","Every action has an equal and opposite reaction","Energy is conserved","Work = Force × Distance"], correct:1, bloom:"Knowledge", exp:"Newton's Third Law: For every action there is an equal and opposite reaction.", subject:"Physics", topic:"Mechanics", examType:"WAEC", difficulty:"Easy" },
    { id:'ph002', q:"The unit of electrical resistance is:", opts:["Ampere","Volt","Ohm","Watt"], correct:2, bloom:"Knowledge", exp:"The Ohm (Ω) is the SI unit of electrical resistance (Ohm's Law: V = IR).", subject:"Physics", topic:"Electricity", examType:"WAEC", difficulty:"Easy" },
    { id:'ph003', q:"Which of the following is electromagnetic radiation?", opts:["Sound waves","Seismic waves","Light waves","Water waves"], correct:2, bloom:"Knowledge", exp:"Light (and radio waves, X-rays, gamma rays) are electromagnetic — they don't need a medium.", subject:"Physics", topic:"Waves", examType:"WAEC", difficulty:"Easy" },
    { id:'ph004', q:"A car accelerates from rest at 3 m/s² for 5 seconds. Final velocity =", opts:["8 m/s","15 m/s","3 m/s","10 m/s"], correct:1, bloom:"Application", exp:"v = u + at = 0 + 3×5 = 15 m/s", subject:"Physics", topic:"Motion", examType:"JAMB", difficulty:"Medium" },
    { id:'ph005', q:"The process by which a liquid changes to gas below its boiling point is:", opts:["Condensation","Evaporation","Sublimation","Melting"], correct:1, bloom:"Knowledge", exp:"Evaporation occurs at the surface of a liquid at any temperature below its boiling point.", subject:"Physics", topic:"Thermal Physics", examType:"NECO", difficulty:"Easy" }
  ],
  Mathematics: [
    { id:'m001', q:"Evaluate: ²log 64", opts:["8","6","4","5"], correct:1, bloom:"Application", exp:"2^x = 64 → x=6. log₂(64) = 6.", subject:"Mathematics", topic:"Logarithms", examType:"WAEC", difficulty:"Medium" },
    { id:'m002', q:"The gradient of y = 4x³ − 2x at x=1 is:", opts:["10","8","6","12"], correct:0, bloom:"Application", exp:"dy/dx = 12x² − 2. At x=1: 12(1)−2 = 10.", subject:"Mathematics", topic:"Calculus", examType:"JAMB", difficulty:"Hard" },
    { id:'m003', q:"Factorize: 6x² + 7x − 3", opts:["(6x−1)(x+3)","(3x−1)(2x+3)","(2x+3)(3x−1)","(6x+1)(x−3)"], correct:1, bloom:"Analysis", exp:"6x² + 7x − 3 = (3x − 1)(2x + 3)", subject:"Mathematics", topic:"Algebra", examType:"WAEC", difficulty:"Medium" },
    { id:'m004', q:"A sector of a circle has radius 7 cm and angle 60°. Its area (π=22/7) =", opts:["25.67 cm²","25.67 cm²","25.7 cm²","51.3 cm²"], correct:0, bloom:"Application", exp:"Area = (θ/360) × πr² = (60/360) × (22/7) × 49 = 25.67 cm²", subject:"Mathematics", topic:"Geometry", examType:"NECO", difficulty:"Medium" },
    { id:'m005', q:"If P = {1,2,3,4,5} and Q = {2,4,6,8}, find P∩Q", opts:["{2,4}","{1,3,5}","{6,8}","{1,2,3,4,5,6,8}"], correct:0, bloom:"Knowledge", exp:"P∩Q = elements in both P and Q = {2,4}", subject:"Mathematics", topic:"Sets", examType:"JAMB", difficulty:"Easy" }
  ]
};

// ── GET handler: health check ────────────────────────────────
export const GET: RequestHandler = async () => {
  return json({
    status:  'ok',
    service: 'SchoolCBT Question Generation API',
    version: '2.0.0',
    models:  ['gemini-1.5-pro', 'fallback-static'],
    exams:   ['JAMB', 'WAEC', 'NECO', 'NABTEB'],
    subjects: Object.keys(FALLBACK_BANK)
  });
};

// ── POST handler: generate questions ────────────────────────
export const POST: RequestHandler = async ({ request, getClientAddress, platform }) => {
  // Rate limiting
  const ip = getClientAddress();
  if (!checkRateLimit(ip)) {
    throw error(429, 'Too many requests. Please wait a moment.');
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw error(400, 'Invalid JSON body');
  }

  const parsed = GenerateQuestionsSchema.safeParse(body);
  if (!parsed.success) {
    throw error(400, parsed.error.issues.map(i => i.message).join(', '));
  }

  const { subject = 'Physics', examType = 'WAEC', count = 5 } = parsed.data;

  // Validate
  if (!subject || typeof subject !== 'string') throw error(400, 'subject is required');
  if (count < 1 || count > 50)               throw error(400, 'count must be 1–50');

  // Try AI generation first (Vertex AI / Gemini)
  const apiKey = platform?.env?.GEMINI_API_KEY as string | undefined;
  
  if (apiKey) {
    try {
      const aiQuestions = await generateWithGemini({ subject, examType, count }, apiKey);
      return json({ questions: aiQuestions, source: 'gemini', subject, examType });
    } catch (e) {
      console.error('Gemini generation failed, using fallback:', e);
    }
  }

  // Fallback to static bank
  const bank = FALLBACK_BANK[subject] ?? FALLBACK_BANK['Physics'];
  const questions = bank.slice(0, Math.min(count, bank.length));

  return json({
    questions,
    source:   'static-fallback',
    subject,
    examType,
    note:     'Using static question bank. AI generation requires GEMINI_API_KEY.'
  });
};

// ── Gemini AI generation ─────────────────────────────────────
async function generateWithGemini(
  params: { subject: string; examType: string; count: number },
  apiKey: string
) {
  const { subject, examType, count } = params;

  const systemPrompt = `You are an expert Nigerian secondary school examiner with 20+ years experience setting ${examType} (${subject}) questions. You generate curriculum-accurate multiple choice questions grounded against the NERDC-approved Nigerian Secondary School Curriculum.

RULES:
- Each question must be 100% aligned with ${examType} ${subject} syllabus
- 4 options (A-D), exactly one correct answer
- Include Bloom's Taxonomy level: Knowledge, Comprehension, Application, or Analysis
- Include a concise explanation (1-2 sentences)
- Vary difficulty: 40% Easy, 40% Medium, 20% Hard
- NEVER include opinions, current events, or non-curriculum content
- Output ONLY valid JSON array, no markdown, no extra text`;

  const userPrompt = `Generate exactly ${count} multiple choice questions for ${examType} ${subject} exam preparation. Return ONLY a JSON array like:
[{"id":"q1","q":"question text","opts":["A","B","C","D"],"correct":0,"bloom":"Knowledge","exp":"brief explanation","subject":"${subject}","topic":"topic name","examType":"${examType}","difficulty":"Easy"}]`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature:     0.7,
          maxOutputTokens: 4096,
          responseMimeType: 'application/json'
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
        ]
      })
    }
  );

  if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Failed to parse Gemini response as JSON');
  }
}
