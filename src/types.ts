export type Language = "ar" | "en";

export interface AccidentCase {
  id: string;
  date: string;
  type: string;
  injuries: boolean;
  medicalBills: number;
  vehicleDamage: boolean;
  otherPartyInsured: boolean;
}

export interface Story {
  id: string;
  accidentDate: string;
  insurerName: string;
  description: string;
  outcome: string;
  isApproved: boolean;
  dateSubmitted: string;
}

export interface ComplaintContact {
  id: string;
  name: string;
  nameEn: string;
  phone: string;
  email: string;
  type: "insurer" | "cbj";
}

/** Evidence file record returned by GET /api/evidence/files */
export interface EvidenceFileRecord {
  id: string;
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  category: string;
  caseId: string | null;
  uploadedAt: string;
}

/** Contact inquiry submitted via the Complaints page */
export interface ContactInquiry {
  id: string;
  name: string;
  contact: string;
  message: string;
  createdAt: string;
}

/** Approved community story shown on the Stories page */
export interface PublishedStory {
  id: string;
  date: string;
  type: "story" | "warning";
  content: string;
  tags?: string[];
  isApproved: boolean;
}
