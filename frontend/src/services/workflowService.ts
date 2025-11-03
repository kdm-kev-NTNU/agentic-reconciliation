import axios from 'axios'

type FileSignature = { name: string; size: number; lastModified: number }

type IdentifyBreaksCache = {
  response: any
  fileSignatures: { nbim: FileSignature; custody: FileSignature }
  timestamp: number
}

type SimpleCache = {
  response: any
  timestamp: number
}

const API_BASE = 'http://127.0.0.1:8000'
const KEY_IDENTIFY = 'workflow:identify_breaks'
const KEY_FIXER = 'workflow:breaks_fixer'
const KEY_REPORT = 'workflow:report_generation'

// Per-stage persistence keys
const LS_VALIDATION = 'validation_results'
const LS_BREAKS = 'breaks_found_global'
const LS_CLASSIFIED = 'classified_breaks'
const LS_CORRECTIONS = 'corrections_list'
const LS_AUDIT = 'audit_trail'
const LS_NBIM_TEXT = 'nbim_csv_text'
const LS_CUSTODY_TEXT = 'custody_csv_text'

const buildSignature = (file: File): FileSignature => ({
  name: file.name,
  size: file.size,
  lastModified: file.lastModified
})

const readCache = <T = any>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

const writeCache = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore storage errors
  }
}

const clearAllCache = (): void => {
  try {
    localStorage.clear()
  } catch {
    // ignore storage errors
  }
}

// Safe JSON reader with diagnostics
const readJsonKey = <T = any>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    try {
      return JSON.parse(raw) as T
    } catch (e) {
      console.log(`[workflow] Failed to parse localStorage key ${key}`, e)
      return null
    }
  } catch {
    return null
  }
}

// Build context object from any available saved stage results
const buildContext = (): Record<string, any> => {
  const ctx: Record<string, any> = {}
  const included: string[] = []

  const maybeAdd = (storageKey: string, fieldName: string) => {
    const val = readJsonKey(storageKey)
    if (val && typeof val === 'object') {
      ctx[fieldName] = val
      included.push(fieldName)
    }
  }

  // Only include the four keys required for request context
  maybeAdd(LS_VALIDATION, 'validation_results')
  maybeAdd(LS_BREAKS, 'breaks_found_global')
  maybeAdd(LS_CLASSIFIED, 'classified_breaks')
  maybeAdd(LS_CORRECTIONS, 'corrections_list')

  if (included.length) {
    console.log('[workflow] Including context keys:', included)
  } else {
    console.log('[workflow] No context keys found to include')
  }
  return ctx
}

// Save any stage outputs found in the response
const saveStageOutputs = (resp: any): void => {
  try {
    const result = resp?.result
    let parsed: any = result?.output_parsed
    if (!parsed && result?.output_text) {
      try {
        parsed = JSON.parse(result.output_text)
      } catch {
        // ignore parse error
      }
    }
    if (!parsed || typeof parsed !== 'object') return

    const saveIfPresent = (fieldName: string, storageKey: string) => {
      const val = parsed?.[fieldName]
      if (val && typeof val === 'object') {
        try {
          localStorage.setItem(storageKey, JSON.stringify(val))
          console.log(`[workflow] Saved ${fieldName} to localStorage`)
        } catch {
          // ignore storage errors
        }
      }
    }

    saveIfPresent('validation_results', LS_VALIDATION)
    saveIfPresent('breaks_found_global', LS_BREAKS)
    saveIfPresent('classified_breaks', LS_CLASSIFIED)
    saveIfPresent('corrections_list', LS_CORRECTIONS)
    saveIfPresent('audit_trail', LS_AUDIT)
  } catch {
    // swallow errors
  }
}

// 1) Identify Breaks
export async function requestIdentifyBreaks(nbimFile: File, custodyFile: File): Promise<any> {
  const nbimSig = buildSignature(nbimFile)
  const custodySig = buildSignature(custodyFile)
  clearAllCache()

  const formData = new FormData()
  formData.append('input_as_text', 'Identify breaks between nbim and custody files')
  formData.append('nbim_file', nbimFile)
  formData.append('custody_file', custodyFile)
  // Persist raw CSV texts for later stages (e.g., Fixer)
  try {
    const [nbimText, custodyText] = await Promise.all([nbimFile.text(), custodyFile.text()])
    try { localStorage.setItem(LS_NBIM_TEXT, nbimText) } catch {}
    try { localStorage.setItem(LS_CUSTODY_TEXT, custodyText) } catch {}
    console.log('[workflow] Saved NBIM and Custody CSV contents to localStorage')
  } catch (e) {
    console.log('[workflow] Failed to read file text for persistence', e)
  }
  // Build and include any existing context (will typically be empty after clear)
  const ctx = buildContext()
  if (Object.keys(ctx).length) {
    formData.append('context', JSON.stringify(ctx))
  }

  const { data } = await axios.post(`${API_BASE}/api/run-workflow`, formData)
  if (data && data.success === false) {
    throw new Error(data.error || 'Workflow failed')
  }

  // Persist any stage outputs returned by this request
  saveStageOutputs(data)

  const toStore: IdentifyBreaksCache = {
    response: data,
    fileSignatures: { nbim: nbimSig, custody: custodySig },
    timestamp: Date.now()
  }
  writeCache(KEY_IDENTIFY, toStore)
  return data
}

export function getCachedIdentifyBreaks(): any | null {
  const cached = readCache<IdentifyBreaksCache>(KEY_IDENTIFY)
  return cached?.response ?? null
}

// 2) Breaks Fixer (feedback flow)
export async function requestBreaksFixer(): Promise<any> {
  const formData = new FormData()
  // Build input text by appending saved CSVs to the user instruction
  let inputText = 'can u fix the breaks based on the breaks provided below? the original csv files are also provided as context'
  try {
    const nbimCsv = localStorage.getItem(LS_NBIM_TEXT) || ''
    const custodyCsv = localStorage.getItem(LS_CUSTODY_TEXT) || ''
    console.log('[workflow] Loaded CSVs for Fixer:', { hasNbim: !!nbimCsv, hasCustody: !!custodyCsv })
    if (nbimCsv) {
      inputText += `\n\n--- NBIM CSV START ---\n${nbimCsv}\n--- NBIM CSV END ---\n`
    }
    if (custodyCsv) {
      inputText += `\n\n--- CUSTODY CSV START ---\n${custodyCsv}\n--- CUSTODY CSV END ---\n`
    }
  } catch {}
  formData.append('input_as_text', inputText)
  const cls = readJsonKey(LS_CLASSIFIED)
  console.log('[workflow] Using classified_breaks for Fixer context:', cls)
  if (cls && typeof cls === 'object') {
    formData.append('context', JSON.stringify({ classified_breaks: cls }))
  }

  const { data } = await axios.post(`${API_BASE}/api/run-workflow`, formData)
  if (data && data.success === false) {
    throw new Error(data.error || 'Workflow failed')
  }
  saveStageOutputs(data)
  writeCache(KEY_FIXER, { response: data, timestamp: Date.now() } as SimpleCache)
  return data
}

export function getCachedBreaksFixer(): any | null {
  const cached = readCache<SimpleCache>(KEY_FIXER)
  return cached?.response ?? null
}

// 3) Report Generation
export async function requestReportGeneration(): Promise<any> {
  const formData = new FormData()
  formData.append('input_as_text', 'Generate a reconciliation report based on the current state')
  const ctx = buildContext()
  if (Object.keys(ctx).length) {
    formData.append('context', JSON.stringify(ctx))
  }

  const { data } = await axios.post(`${API_BASE}/api/run-workflow`, formData)
  if (data && data.success === false) {
    throw new Error(data.error || 'Workflow failed')
  }
  saveStageOutputs(data)
  writeCache(KEY_REPORT, { response: data, timestamp: Date.now() } as SimpleCache)
  return data
}

export function getCachedReport(): any | null {
  const cached = readCache<SimpleCache>(KEY_REPORT)
  return cached?.response ?? null
}


