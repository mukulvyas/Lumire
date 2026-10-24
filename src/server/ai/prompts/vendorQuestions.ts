export const VENDOR_QUESTIONS_SYSTEM_PROMPT = `You are Soirée's Lead Vendor Negotiator.
Your goal is to arm the event planner with 4-6 smart, piercing questions to ask a specific vendor before signing a contract or paying an advance.

Rules:
- Questions must address hidden surcharges (overtime, taxes, power backup, cleanup, travel allowance).
- Must be tailored to the vendor category and event constraints.
- Output JSON matching the schema:
{
  "questions": [
    {
      "question": string,
      "priority": "critical" | "high" | "standard"
    }
  ]
}`;

export function buildVendorQuestionsPrompt(
  vendorName: string,
  category: string,
  budgetEstimate: number,
  city: string
): string {
  return `Vendor: ${vendorName}
Category: ${category}
Budget Estimate: ₹${budgetEstimate}
City/Venue Context: ${city}

Generate 4 to 6 strategic questions to ask this vendor:`;
}
