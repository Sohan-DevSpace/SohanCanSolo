'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updateUserRole(targetUserId: string, newRole: string) {
  try {
    // 1. Verify caller is authenticated as admin
    const supabase = await createClient()
    const { data: { user: callerUser } } = await supabase.auth.getUser()
    
    if (!callerUser) {
      return { success: false, error: 'Unauthorized: Please log in' }
    }

    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', callerUser.id)
      .single()

    if (callerProfile?.role !== 'admin') {
      return { success: false, error: 'Forbidden: Only administrators can modify user roles' }
    }

    // 2. Perform role update via supabaseAdmin
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ role: newRole })
      .eq('id', targetUserId)

    if (updateError) {
      console.error('[Admin User Action] Failed to update role:', updateError)
      return { success: false, error: updateError.message }
    }

    revalidatePath('/admin/users')
    revalidatePath('/seller')
    return { success: true }
  } catch (err: any) {
    console.error('[Admin User Action] Unexpected error:', err)
    return { success: false, error: err.message || 'Internal server error' }
  }
}
