export type EvidenceType = "testimonial" | "case-study" | "review" | "quote" | "video";
export type EvidenceStatus = "pending" | "approved" | "published" | "archived";
export type ProductType = "platform" | "analytics" | "integration" | "api" | "other";

export interface Evidence {
  id: string;
  customerName: string;
  company: string;
  email: string;
  jobTitle?: string;
  evidenceType: EvidenceType;
  product: ProductType;
  title: string;
  content: string;
  results?: string;
  useCases?: string;
  status: EvidenceStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}
