export enum ItemType {
  SERVICE = 'Serviço',
  MATERIAL = 'Material'
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
}

export interface CatalogItem {
  id: string;
  name: string;
  type: ItemType;
  defaultPrice: number;
  unit: string; // e.g., 'un', 'm', 'h'
}

export interface QuoteItem extends CatalogItem {
  quantity: number;
  total: number;
}

export enum QuoteStatus {
  DRAFT = 'Rascunho',
  SENT = 'Enviado',
  APPROVED = 'Aprovado',
  COMPLETED = 'Concluído'
}

export interface Quote {
  id: string;
  clientId: string;
  date: string;
  validUntil: string;
  items: QuoteItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: QuoteStatus;
  description: string; // Job description
  notes?: string;
}

export interface AISuggestion {
  name: string;
  type: 'Serviço' | 'Material';
  estimatedPrice: number;
  quantity: number;
  unit: string;
  reasoning: string;
}
