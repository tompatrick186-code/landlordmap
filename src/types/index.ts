export interface Organisation {
  id: string
  name: string
  logo_url?: string
  plan: 'starter' | 'pro' | 'agency'
  stripe_customer_id?: string
  subdomain?: string
  created_at: string
}

export interface Property {
  id: string
  organisation_id: string
  title: string
  address: string
  area: string
  bedrooms: number
  bathrooms: number
  rent: number
  status: 'occupied' | 'vacant' | 'maintenance' | 'expiring_soon'
  photo_url?: string
  description?: string
  epc_rating?: string
  council_tax_band?: string
  lat?: number
  lng?: number
  created_at: string
}

export interface Tenant {
  id: string
  organisation_id: string
  property_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  lease_start: string
  lease_end: string
  rent_amount: number
  deposit_amount?: number
  status: 'active' | 'notice_given' | 'ended'
  notes?: string
  created_at: string
}

export interface MaintenanceRequest {
  id: string
  organisation_id: string
  property_id: string
  tenant_id?: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'urgent'
  status: 'reported' | 'in_progress' | 'resolved'
  photo_url?: string
  contractor?: string
  notes?: string
  reported_at: string
  resolved_at?: string
}

export interface RentPayment {
  id: string
  organisation_id: string
  property_id: string
  tenant_id: string
  amount: number
  period_month: number
  period_year: number
  paid_at: string
  notes?: string
}

export interface Expense {
  id: string
  organisation_id: string
  property_id?: string
  category: 'repairs' | 'insurance' | 'agent_fees' | 'utilities' | 'other'
  amount: number
  description: string
  date: string
}

export interface Document {
  id: string
  organisation_id: string
  property_id?: string
  tenant_id?: string
  name: string
  type: 'tenancy_agreement' | 'gas_safety' | 'epc' | 'inventory' | 'other'
  file_url: string
  expiry_date?: string
  created_at: string
}
