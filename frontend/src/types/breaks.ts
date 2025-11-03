export interface BreakItem {
  break_id: number | string
  coac_event_key?: string
  break_type?: string
  mapping_type?: string
  category?: string
  priority?: string
  confidence?: number
  recommended_action?: string
  approved_for_auto_correction?: boolean
  rationale?: string
  // acceptance-related fields
  accepted?: boolean
  accepted_by?: string
  accepted_at?: string
}


