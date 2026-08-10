import { supabaseAdmin } from '@/lib/supabase/admin'

export interface AuditLogEntry {
  action: string
  userId?: string
  details?: Record<string, any>
  ipAddress?: string
  status?: 'success' | 'failure'
}

export async function logAuditEvent(entry: AuditLogEntry) {
  const timestamp = new Date().toISOString()


  try {
    await supabaseAdmin.from('audit_logs').insert([
      {
        action: entry.action,
        user_id: entry.userId,
        details: entry.details || {},
        ip_address: entry.ipAddress || 'unknown',
        status: entry.status || 'success',
        created_at: timestamp,
      },
    ])
  } catch (err) {
    // Non-blocking fallback logging
    console.error('Audit log DB write fallback error:', err)
  }
}
