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

// 1) Identify Breaks
export async function requestIdentifyBreaks(nbimFile: File, custodyFile: File): Promise<any> {
  const nbimSig = buildSignature(nbimFile)
  const custodySig = buildSignature(custodyFile)

  const cached = readCache<IdentifyBreaksCache>(KEY_IDENTIFY)
  if (cached &&
      cached.fileSignatures?.nbim?.name === nbimSig.name &&
      cached.fileSignatures?.nbim?.size === nbimSig.size &&
      cached.fileSignatures?.nbim?.lastModified === nbimSig.lastModified &&
      cached.fileSignatures?.custody?.name === custodySig.name &&
      cached.fileSignatures?.custody?.size === custodySig.size &&
      cached.fileSignatures?.custody?.lastModified === custodySig.lastModified) {
    return cached.response
  }

  const formData = new FormData()
  formData.append('input_as_text', 'Identify breaks between nbim and custody files')
  formData.append('nbim_file', nbimFile)
  formData.append('custody_file', custodyFile)

  const { data } = await axios.post(`${API_BASE}/api/run-workflow`, formData)
  if (data && data.success === false) {
    throw new Error(data.error || 'Workflow failed')
  }

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
export async function requestBreaksFixer(feedback: any): Promise<any> {
  const cached = readCache<SimpleCache>(KEY_FIXER)
  if (cached) return cached.response

  const formData = new FormData()
  formData.append('input_as_text', 'Apply feedback to breaks suggestions and return updated state')
  formData.append('feedback', JSON.stringify(feedback))

  const { data } = await axios.post(`${API_BASE}/api/run-workflow`, formData)
  if (data && data.success === false) {
    throw new Error(data.error || 'Workflow failed')
  }
  writeCache(KEY_FIXER, { response: data, timestamp: Date.now() } as SimpleCache)
  return data
}

export function getCachedBreaksFixer(): any | null {
  const cached = readCache<SimpleCache>(KEY_FIXER)
  return cached?.response ?? null
}

// 3) Report Generation
export async function requestReportGeneration(): Promise<any> {
  const cached = readCache<SimpleCache>(KEY_REPORT)
  if (cached) return cached.response

  const formData = new FormData()
  formData.append('input_as_text', 'Generate a reconciliation report based on the current state')

  const { data } = await axios.post(`${API_BASE}/api/run-workflow`, formData)
  if (data && data.success === false) {
    throw new Error(data.error || 'Workflow failed')
  }
  writeCache(KEY_REPORT, { response: data, timestamp: Date.now() } as SimpleCache)
  return data
}

export function getCachedReport(): any | null {
  const cached = readCache<SimpleCache>(KEY_REPORT)
  return cached?.response ?? null
}


