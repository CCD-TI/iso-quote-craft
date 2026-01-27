export interface ISOStandard {
  id: string;
  code: string;
  name: string;
  description: string;
  certificationPrice: number;
  followUpPrice: number;
  recertificationPrice: number;
  displayOrder?: number;
}

export interface Advisor {
  id: string;
  name: string;
  email: string;
  phone: string;
  username?: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  cci: string;
  currency: 'soles' | 'dolares';
  logo?: string;
}

export interface SelectedISO {
  isoId: string;
  certification: boolean;
  certificationPrice: number;
  followUp: boolean;
  followUpPrice: number;
  recertification: boolean;
  recertificationPrice: number;
}

export interface ClientData {
  ruc: string;
  razonSocial: string;
  representante: string;
  celular: string;
  correo: string;
  asesorId: string;
  fecha: Date;
  codigo: string;
}

export interface ImplementationData {
  enabled: boolean;
  companySize: 'pequeña' | 'mediana' | 'grande';
  unitPrice: number;
  quantity: number;
}

export interface Quotation {
  id: string;
  code: string;
  date: string;
  client: ClientData;
  selectedISOs: SelectedISO[];
  subtotal: number;
  igv: number;
  discount: number;
  total: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  includeIGV?: boolean;
  implementation?: ImplementationData;
  implementationTotal?: number;
}

export interface QuotationSummaryItem {
  isoCode: string;
  type: string;
  amount: number;
}

export interface CertificationStep {
  id: string;
  order: number;
  title: string;
}