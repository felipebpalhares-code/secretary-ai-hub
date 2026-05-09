/**
 * Cliente HTTP do módulo Contatos. Mapeia 1:1 backend/routes/contacts.py.
 */
import { request } from "./api"
import type {
  Contact,
  ContactCreate,
  ContactUpdate,
  ContactStats,
  ContactsListFilters,
  Category,
  CategoryCreate,
  CategoryUpdate,
  Tag,
} from "./contacts-types"

function buildQuery(filters: ContactsListFilters | undefined): string {
  if (!filters) return ""
  const q = new URLSearchParams()
  if (filters.category_id != null) q.set("category_id", String(filters.category_id))
  if (filters.has_email) q.set("has_email", "true")
  if (filters.has_phone) q.set("has_phone", "true")
  if (filters.has_company) q.set("has_company", "true")
  if (filters.last_30_days) q.set("last_30_days", "true")
  if (filters.search) q.set("search", filters.search)
  if (filters.tag_ids?.length) {
    for (const id of filters.tag_ids) q.append("tag_ids", String(id))
  }
  const s = q.toString()
  return s ? `?${s}` : ""
}

// ───── Contacts ─────

export async function listContacts(filters?: ContactsListFilters): Promise<Contact[]> {
  return request<Contact[]>(`/api/contacts${buildQuery(filters)}`)
}

export async function getContact(id: number): Promise<Contact> {
  return request<Contact>(`/api/contacts/${id}`)
}

export async function createContact(payload: ContactCreate): Promise<Contact> {
  return request<Contact>("/api/contacts", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function updateContact(id: number, payload: ContactUpdate): Promise<Contact> {
  return request<Contact>(`/api/contacts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export async function deleteContact(id: number): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>(`/api/contacts/${id}`, { method: "DELETE" })
}

export async function getStats(): Promise<ContactStats> {
  return request<ContactStats>("/api/contacts/stats")
}

// ───── Categories ─────

export async function listCategories(): Promise<Category[]> {
  return request<Category[]>("/api/contacts/categories")
}

export async function createCategory(payload: CategoryCreate): Promise<Category> {
  return request<Category>("/api/contacts/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function updateCategory(id: number, payload: CategoryUpdate): Promise<Category> {
  return request<Category>(`/api/contacts/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export async function deleteCategory(id: number): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>(`/api/contacts/categories/${id}`, { method: "DELETE" })
}

// ───── Tags ─────

export async function searchTags(prefix: string, limit = 10): Promise<Tag[]> {
  const q = new URLSearchParams({ q: prefix, limit: String(limit) })
  return request<Tag[]>(`/api/contacts/tags?${q.toString()}`)
}

// ───── Backup (admin) ─────

export async function backupNow(): Promise<{ ok: boolean; path: string }> {
  return request<{ ok: boolean; path: string }>("/api/contacts/backup/now", {
    method: "POST",
  })
}
