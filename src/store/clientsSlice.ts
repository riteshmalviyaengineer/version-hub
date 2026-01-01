import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { clientService, Client, CreateClientPayload, UpdateClientPayload, VersionOption } from '@/services/clientService';

// State interface
interface ClientsState {
  clients: Client[];
  count: number;
  versions: VersionOption[];
  loading: boolean;
  error: string | null;
  selectedClient: Client | null;
}

// Initial state
const initialState: ClientsState = {
  clients: [],
  count: 0,
  versions: [],
  loading: false,
  error: null,
  selectedClient: null,
};

// Async thunks for client operations

export const fetchClients = createAsyncThunk(
  'clients/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await clientService.getAll();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch clients');
    }
  }
);

export const createClient = createAsyncThunk(
  'clients/create',
  async (payload: CreateClientPayload, { rejectWithValue }) => {
    try {
      const response = await clientService.create(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create client');
    }
  }
);

export const updateClient = createAsyncThunk(
  'clients/update',
  async ({ id, payload }: { id: number; payload: UpdateClientPayload }, { rejectWithValue }) => {
    try {
      const response = await clientService.update(id, payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update client');
    }
  }
);

export const deleteClient = createAsyncThunk(
  'clients/delete',
  async (clientId: number, { rejectWithValue }) => {
    try {
      await clientService.delete(clientId);
      return clientId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete client');
    }
  }
);

export const fetchVersions = createAsyncThunk(
  'clients/fetchVersions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await clientService.getVersions();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch versions');
    }
  }
);

// Slice definition
const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    setSelectedClient: (state, action: PayloadAction<Client | null>) => {
      state.selectedClient = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch clients
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = action.payload.clients;
        state.count = action.payload.count;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create client
      .addCase(createClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.loading = false;
        state.clients.push(action.payload);
        state.count += 1;
      })
      .addCase(createClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update client
      .addCase(updateClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.clients.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.clients[index] = action.payload;
        }
      })
      .addCase(updateClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete client
      .addCase(deleteClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = state.clients.filter((c) => c.id !== action.payload);
        state.count -= 1;
      })
      .addCase(deleteClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch versions
      .addCase(fetchVersions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVersions.fulfilled, (state, action) => {
        state.loading = false;
        state.versions = action.payload.versions;
      })
      .addCase(fetchVersions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedClient, clearError } = clientsSlice.actions;
export default clientsSlice.reducer;