import api from './api';

// Version type definition
export interface Version {
  id: number;
  vendor_id: number;
  version_name: string;
  version_code: string;
  created_at: string;
}

export interface VersionDetail {
  id: number;
  version_id: number;
  label: string;
  numeric_value: number;
  code_content: string;
}

export interface VersionsResponse {
  versions: Version[];
  count: number;
}

export interface CreateVersionPayload {
  vendor_id: number;
  version_name: string;
  version_code: string;
}

export interface CreateVersionDetailPayload {
  version_id: number;
  label: string;
  numeric_value: number;
  code_content: string;
}

// Version API service methods
export const versionService = {
  // Get all versions for a vendor
  getByVendor: async (vendorId: number): Promise<VersionsResponse> => {
    const response = await api.get(`/versions/get_by_vendor?vendor_id=${vendorId}`);
    return response.data;
  },

  // Get version by ID
  getById: async (versionId: number): Promise<Version> => {
    const response = await api.get(`/versions/get?id=${versionId}`);
    return response.data;
  },

  // Create a new version
  create: async (payload: CreateVersionPayload): Promise<Version> => {
    const response = await api.post('/versions/create', payload);
    return response.data;
  },

  // Update an existing version
  update: async (id: number, payload: Partial<CreateVersionPayload>): Promise<Version> => {
    const response = await api.put(`/versions/update?id=${id}`, payload);
    return response.data;
  },

  // Delete a version
  delete: async (versionId: number): Promise<{ message: string; status_code: number }> => {
    const response = await api.delete(`/versions/delete?version_id=${versionId}`);
    return response.data;
  },

  // Get version details
  getDetails: async (versionId: number): Promise<VersionDetail[]> => {
    const response = await api.get(`/versions/details?version_id=${versionId}`);
    return response.data.details || [];
  },

  // Create version detail
  createDetail: async (payload: CreateVersionDetailPayload): Promise<VersionDetail> => {
    const response = await api.post('/versions/details/create', payload);
    return response.data;
  },

  // Update version detail
  updateDetail: async (id: number, payload: Partial<CreateVersionDetailPayload>): Promise<VersionDetail> => {
    const response = await api.put(`/versions/details/update?id=${id}`, payload);
    return response.data;
  },

  // Delete version detail
  deleteDetail: async (detailId: number): Promise<{ message: string; status_code: number }> => {
    const response = await api.delete(`/versions/details/delete?id=${detailId}`);
    return response.data;
  },
};
