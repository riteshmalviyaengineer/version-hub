import api from './api';

// Client type definition (matches listing API response)
export interface Client {
  id: number;
  version_id: number;
  plugugly_uuid: string;
  pluguglyfdid: string;
  agencynamelong: string;
  agencynameshort: string;
  agencynameabbrv: string;
  alias1: string;
  alias2: string;
  agencystate: string;
  fdid: string;
  longitude: string;
  latitude: string;
  esri_global_id: string | null;
  created_date: string;
  last_edit_date: string;
  geom: string;
  sourcetype: string;
  sourcekey1: string;
  sourcekey2: string | null;
  sourcekey3: string | null;
  workflow_route: string | null;
  inctypestandard: number;
  created_at: string;
}

export interface ClientsResponse {
  clients: Client[];
  count: number;
}

export interface CreateClientPayload {
  agencynameabbrv: string;
  agencynamelong: string;
  agencynameshort: string;
  agencystate: string;
  alias1: string;
  alias2: string;
  created_date: string;
  esri_global_id: string;
  fdid: string;
  geom: string;
  inctypestandard: number;
  last_edit_date: string;
  latitude: string;
  longitude: string;
  plugugly_uuid: string;
  pluguglyfdid: string;
  sourcekey1: string;
  sourcekey2: string;
  sourcekey3: string;
  sourcetype: string;
  version_id: number;
  workflow_route: string;
}

export interface UpdateClientPayload {
  AgencyNameLong: string;
  DataSource: string;
  PlugUglyFDID: string;
  RecordUseType: number;
  version_id: number;
}

// Version type for dropdown
export interface VersionOption {
  id: number;
  version_name: string;
  vendor_name: string;
}

export interface VersionsResponse {
  versions: VersionOption[];
  count: number;
}

export interface DeleteResponse {
  message: string;
  status_code: number;
}

// Client API service methods
export const clientService = {
  // Get all clients
  getAll: async (): Promise<ClientsResponse> => {
    const response = await api.get('/clients/get_all');
    return response.data;
  },

  // Get a single client by ID
  getById: async (id: number): Promise<Client> => {
    const response = await api.get(`/clients/get?id=${id}`);
    return response.data;
  },

  // Create a new client
  create: async (payload: CreateClientPayload): Promise<Client> => {
    const response = await api.post('/clients/create', payload);
    return response.data;
  },

  // Update an existing client
  update: async (id: number, payload: UpdateClientPayload): Promise<Client> => {
    const response = await api.put(`/clients/update?id=${id}`, payload);
    return response.data;
  },

  // Delete a client
  delete: async (clientId: number): Promise<DeleteResponse> => {
    const response = await api.delete(`/clients/delete?client_id=${clientId}`);
    return response.data;
  },

  // Get all versions for dropdown
  getVersions: async (): Promise<VersionsResponse> => {
    const response = await api.get('/vendor-versions/get_all');
    return response.data;
  },
};