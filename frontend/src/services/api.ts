import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// EDPS API
export interface EDPS {
  id: string
  normNumber: string
  title: string
  description: string
  target: string
  images: string[]
  createdAt: string
  updatedAt: string
  status: string
}

export interface CreateEDPSData {
  normNumber: string
  title: string
  description?: string
  target?: string
  images?: string[]
}

export const edpsAPI = {
  getAll: () => api.get<{ success: boolean; data: EDPS[] }>('/edps'),
  getById: (id: string) => api.get<{ success: boolean; data: EDPS }>(`/edps/${id}`),
  create: (data: CreateEDPSData) => api.post<{ success: boolean; data: EDPS }>('/edps', data),
  update: (id: string, data: Partial<CreateEDPSData>) => api.put<{ success: boolean; data: EDPS }>(`/edps/${id}`, data),
  delete: (id: string) => api.delete<{ success: boolean }>(`/edps/${id}`),
}

// DVP API
export interface DVP {
  id: string
  procedureId: string
  procedureType: string
  performanceObjective: string
  testName: string
  acceptanceCriteria: string
  responsible: string
  parameterRange: string
  createdAt: string
  updatedAt: string
  status: string
}

export interface CreateDVPData {
  procedureId: string
  procedureType?: string
  performanceObjective?: string
  testName: string
  acceptanceCriteria?: string
  responsible?: string
  parameterRange?: string
}

export const dvpAPI = {
  getAll: () => api.get<{ success: boolean; data: DVP[] }>('/dvp'),
  getById: (id: string) => api.get<{ success: boolean; data: DVP }>(`/dvp/${id}`),
  create: (data: CreateDVPData) => api.post<{ success: boolean; data: DVP }>('/dvp', data),
  update: (id: string, data: Partial<CreateDVPData>) => api.put<{ success: boolean; data: DVP }>(`/dvp/${id}`, data),
  delete: (id: string) => api.delete<{ success: boolean }>(`/dvp/${id}`),
}

// DFMEA API
export interface DFMEA {
  id: string
  genericFailure: string
  failureMode: string
  cause: string
  preventionControl: {
    type: string
    edpsId: string
    description: string
    edpsData?: EDPS
  } | null
  detectionControl: {
    type: string
    dvpId: string
    description: string
    dvpData?: DVP
  } | null
  severity: number | null
  occurrence: number | null
  detection: number | null
  rpn: number
  createdAt: string
  updatedAt: string
  status: string
}

export interface CreateDFMEAData {
  genericFailure: string
  failureMode: string
  cause?: string
  preventionControl?: {
    type: string
    edpsId: string
    description: string
  }
  detectionControl?: {
    type: string
    dvpId: string
    description: string
  }
  severity?: number
  occurrence?: number
  detection?: number
}

export const dfmeaAPI = {
  getAll: () => api.get<{ success: boolean; data: DFMEA[] }>('/dfmea'),
  getById: (id: string) => api.get<{ success: boolean; data: DFMEA }>(`/dfmea/${id}`),
  create: (data: CreateDFMEAData) => api.post<{ success: boolean; data: DFMEA }>('/dfmea', data),
  update: (id: string, data: Partial<CreateDFMEAData>) => api.put<{ success: boolean; data: DFMEA }>(`/dfmea/${id}`, data),
  delete: (id: string) => api.delete<{ success: boolean }>(`/dfmea/${id}`),
}

// Export API
export const exportAPI = {
  exportDFMEAToExcel: (id: string) => {
    window.open(`${API_BASE_URL}/export/dfmea/${id}/excel`, '_blank')
  },
  exportDFMEAToPDF: (id: string) => {
    window.open(`${API_BASE_URL}/export/dfmea/${id}/pdf`, '_blank')
  },
  exportAllDFMEAToExcel: () => {
    window.open(`${API_BASE_URL}/export/dfmea/all/excel`, '_blank')
  },
}

export default api




