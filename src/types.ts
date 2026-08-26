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
