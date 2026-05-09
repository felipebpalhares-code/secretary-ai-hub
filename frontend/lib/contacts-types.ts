/**
 * Tipos do módulo Contatos — espelham os schemas Pydantic em
 * backend/schemas/contact.py.
 *
 * `birthday` chega do backend como ISO date string (YYYY-MM-DD).
 * `created_at`/`updated_at` chegam como ISO datetime.
 */

export type Tag = {
  id: number
  name: string
}

export type Category = {
  id: number
  name: string
  color: string | null
  is_default: boolean
  sort_order: number
}

export type Organization = {
  id: number
  name: string
  trade_name: string | null
  cnpj: string | null
  industry: string | null
  website: string | null
  notes: string | null
  enriched_at: string | null
  created_at: string
  updated_at: string
  contact_count: number
}

export type OrganizationStats = {
  total: number
  with_cnpj: number
  enriched: number
  without_contacts: number
}

export type OrganizationCreate = {
  name: string
  trade_name?: string | null
  cnpj?: string | null
  industry?: string | null
  website?: string | null
  notes?: string | null
}

export type OrganizationUpdate = Partial<OrganizationCreate>

export type Contact = {
  id: number
  name: string | null
  email: string | null
  phone: string | null
  role: string | null
  category_id: number | null
  organization_id: number | null
  organization: Organization | null
  notes: string | null
  photo_url: string | null
  birthday: string | null
  is_starred: boolean
  created_at: string
  updated_at: string
  tags: Tag[]
}

export type ContactCreate = {
  name?: string | null
  email?: string | null
  phone?: string | null
  role?: string | null
  category_id?: number | null
  organization_id?: number | null
  notes?: string | null
  photo_url?: string | null
  birthday?: string | null
  is_starred?: boolean
  tags?: string[]
}

export type ContactUpdate = Partial<ContactCreate>

export type ContactStats = {
  total: number
  with_email: number
  with_phone: number
  with_company: number
  by_category: { category_id: number | null; count: number }[]
}

export type CategoryCreate = {
  name: string
  color?: string | null
}

export type CategoryUpdate = Partial<CategoryCreate>

export type ContactsListFilters = {
  category_id?: number | null
  has_email?: boolean
  has_phone?: boolean
  has_company?: boolean
  last_30_days?: boolean
  search?: string
  tag_ids?: number[]
}
