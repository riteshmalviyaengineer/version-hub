import api from './api';

// Column type definition
export interface Column {
  id: number;
  column_name: string;
  created_at: string;
}

export interface ColumnsResponse {
  columns: Column[];
  count: number;
}

export interface CreateColumnPayload {
  column_name: string;
}

export interface UpdateColumnPayload {
  column_name: string;
}

export interface DeleteResponse {
  message: string;
  status_code: number;
}

// Column API service methods
export const columnService = {
  // Get all columns
  getAll: async (): Promise<ColumnsResponse> => {
    const response = await api.get('/vendor-columns/get_all');
    return response.data;
  },

  // Create a new column
  create: async (payload: CreateColumnPayload): Promise<Column> => {
    const response = await api.post('/vendor-columns/create', payload);
    return response.data;
  },

  // Update an existing column
  update: async (id: number, payload: UpdateColumnPayload): Promise<Column> => {
    const response = await api.put(`/vendor-columns/update?id=${id}`, payload);
    return response.data;
  },

  // Delete a column
  delete: async (columnId: number): Promise<DeleteResponse> => {
    const response = await api.delete(`/vendor-columns/delete?column_id=${columnId}`);
    return response.data;
  },
};