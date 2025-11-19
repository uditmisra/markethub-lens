import { Evidence } from "@/types/evidence";

export interface CompletenessResult {
  score: number; // 0-100
  percentage: number; // 0-100
  filledFields: number;
  totalFields: number;
  missingFields: string[];
}

export const calculateCompleteness = (evidence: Evidence): CompletenessResult => {
  const fields = [
    { name: "Customer Name", value: evidence.customerName, isDefault: evidence.customerName === "Anonymous" },
    { name: "Company", value: evidence.company, isDefault: evidence.company === "Not specified" },
    { name: "Email", value: evidence.email, isDefault: evidence.email === "imported@g2.com" },
    { name: "Job Title", value: evidence.jobTitle },
    { name: "Content", value: evidence.content, weight: 2 }, // Higher weight for important fields
    { name: "Results", value: evidence.results },
    { name: "Use Cases", value: evidence.useCases },
    { name: "Company Size", value: evidence.company_size },
    { name: "Industry", value: evidence.industry },
    { name: "Rating", value: evidence.rating },
    { name: "Review Date", value: evidence.review_date },
    { name: "Reviewer Avatar", value: evidence.reviewer_avatar },
    { name: "External URL", value: evidence.external_url },
  ];

  let totalWeight = 0;
  let filledWeight = 0;
  const missingFields: string[] = [];

  fields.forEach(field => {
    const weight = field.weight || 1;
    totalWeight += weight;

    // Check if field is filled and not a default value
    const isFilled = field.value && 
                     (!field.isDefault) && 
                     (typeof field.value === "string" ? field.value.trim().length > 0 : true);

    if (isFilled) {
      filledWeight += weight;
    } else {
      missingFields.push(field.name);
    }
  });

  const percentage = Math.round((filledWeight / totalWeight) * 100);

  return {
    score: percentage,
    percentage,
    filledFields: fields.length - missingFields.length,
    totalFields: fields.length,
    missingFields,
  };
};

export const getCompletenessLabel = (score: number): { label: string; color: string } => {
  if (score >= 90) return { label: "Excellent", color: "text-green-600" };
  if (score >= 70) return { label: "Good", color: "text-blue-600" };
  if (score >= 50) return { label: "Fair", color: "text-yellow-600" };
  return { label: "Incomplete", color: "text-red-600" };
};

export const getCompletenessColor = (score: number): string => {
  if (score >= 90) return "bg-green-500";
  if (score >= 70) return "bg-blue-500";
  if (score >= 50) return "bg-yellow-500";
  return "bg-red-500";
};
