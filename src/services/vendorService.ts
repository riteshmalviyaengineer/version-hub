import api from './api';

// Vendor type definition
export interface Vendor {
  id: number;
  vendor_name: string;
  vendor_code: string;
  created_at: string;
}

export interface VendorsResponse {
  vendors: Vendor[];
  count: number;
}

export interface CreateVendorPayload {
  vendor_name: string;
  vendor_code: string;
}

export interface DeleteResponse {
  message: string;
  status_code: number;
}

// Vendor API service methods
export const vendorService = {
  // Get all vendors
  getAll: async (): Promise<VendorsResponse> => {
    const response = await api.get('/vendors/get_all');
    return response.data;
  },

  // Create a new vendor
  create: async (payload: CreateVendorPayload): Promise<Vendor> => {
    const response = await api.post('/vendors/create', payload);
    return response.data;
  },

  // Update an existing vendor
  update: async (id: number, payload: CreateVendorPayload): Promise<Vendor> => {
    const response = await api.put(`/vendors/update?id=${id}`, payload);
    return response.data;
  },

  // Delete a vendor
  delete: async (vendorId: number): Promise<DeleteResponse> => {
    const response = await api.delete(`/vendors/delete?vendor_id=${vendorId}`);
    return response.data;
  },
};
