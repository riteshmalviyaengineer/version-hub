import api from "./api";

// Version type definition
export interface Version {
  id: number;
  vendor_id?: number;
  vendor_name?: string;
  vendor_code?: string;
  version_name?: string;
  version_code?: string;
  created_at?: string;
}

export interface VersionDetail {
  id: number;
  version_id: number;
  label: string;
  numeric_value: number;
  code_content: string;
}

export interface VendorMappingVersionDetail {
  code: string;
  column_name: string;
  mapping_id: number;
  source_column_name: string;
  vendor_system_column_id: number;
  vendor_system_column_name: string | null;
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
  Allversions: async (): Promise<VersionsResponse> => {
    const response = await api.get("/vendor-versions/get_all");
    return response.data;
  },

  // Get all versions for a vendor
  getByVendor: async (vendorId: number): Promise<VersionsResponse> => {
    const response = await api.get(
      `/vendor-versions/get_by_vendor/${vendorId}`
    );
    return response.data;
  },

  // Get version by ID
  getById: async (versionId: number): Promise<Version> => {
    const response = await api.get(`/versions/get?id=${versionId}`);
    return response.data;
  },

  // Create a new version
  create: async (payload: CreateVersionPayload): Promise<Version> => {
    const response = await api.post("/vendor-versions/create", payload);
    return response.data;
  },

  // Update an existing version
  update: async (
    id: number,
    payload: Partial<CreateVersionPayload>
  ): Promise<Version> => {
    const response = await api.put(`/vendor-versions/update?id=${id}`, payload);
    return response.data;
  },

  // Delete a version
  delete: async (
    versionId: number
  ): Promise<{ message: string; status_code: number }> => {
    const response = await api.delete(
      `/vendor-versions/delete?version_id=${versionId}`
    );
    return response.data;
  },

  // Get version details
  // getDetails: async (versionId: number): Promise<VersionDetail[]> => {
  //   const response = await api.get(`/versions/details?version_id=${versionId}`);
  //   return response.data.details || [];
  // },
  getDetails: async (versionId: number) => {
    const [vendorMappingResponse, systemColumnsResponse] = await Promise.all([
      api.get(`/vendor-mappings/setup/${versionId}`),
      api.get(`/vendor-mappings/system-columns`),
    ]);

    const vendorMappingData = vendorMappingResponse.data;
    const systemColumns = systemColumnsResponse.data?.columns || [];

    const systemColumnMap = new Map<number, string>(
      systemColumns.map((col: any) => [col.id, col.column_name])
    );

    const normalizedColumns = (vendorMappingData.columns || []).map(
      (col: any) => ({
        vendor_system_column_id: col.vendor_system_column_id,
        column_name: col.column_name,
        mapping_id: col.mapping_id,
        source_column_name: col.source_column_name,
        code: col.code,
        vendor_system_column_name:
          systemColumnMap.get(col.vendor_system_column_id) || null,
      })
    );

    return normalizedColumns;
  },

  // Create version detail
  createDetail: async (
    payload: CreateVersionDetailPayload
  ): Promise<VendorMappingVersionDetail> => {
    const response = await api.post("/versions/details/create", payload);
    return response.data;
  },

  // Update version detail
  updateDetail: async (
    id: number,
    payload: Partial<CreateVersionDetailPayload>
  ): Promise<VendorMappingVersionDetail> => {
    const response = await api.put(
      `/versions/details/update?id=${id}`,
      payload
    );
    return response.data;
  },

  // Delete version detail
  deleteDetail: async (
    detailId: number
  ): Promise<{ message: string; status_code: number }> => {
    const response = await api.delete(
      `/versions/details/delete?id=${detailId}`
    );
    return response.data;
  },
};
