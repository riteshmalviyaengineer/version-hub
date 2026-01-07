import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { columnService, Column, CreateColumnPayload, UpdateColumnPayload } from '@/services/columnService';

// State interface
interface ColumnsState {
  columns: Column[];
  count: number;
  loading: boolean;
  error: string | null;
  selectedColumn: Column | null;
}

// Initial state
const initialState: ColumnsState = {
  columns: [],
  count: 0,
  loading: false,
  error: null,
  selectedColumn: null,
};

// Async thunks for column operations

export const fetchColumns = createAsyncThunk(
  'columns/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await columnService.getAll();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch columns');
    }
  }
);

export const createColumn = createAsyncThunk(
  'columns/create',
  async (payload: CreateColumnPayload, { rejectWithValue }) => {
    try {
      const response = await columnService.create(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create column');
    }
  }
);

export const updateColumn = createAsyncThunk(
  'columns/update',
  async ({ id, payload }: { id: number; payload: UpdateColumnPayload }, { rejectWithValue }) => {
    try {
      const response = await columnService.update(id, payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update column');
    }
  }
);

export const deleteColumn = createAsyncThunk(
  'columns/delete',
  async (columnId: number, { rejectWithValue }) => {
    try {
      await columnService.delete(columnId);
      return columnId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete column');
    }
  }
);

// Slice definition
const columnsSlice = createSlice({
  name: 'columns',
  initialState,
  reducers: {
    setSelectedColumn: (state, action: PayloadAction<Column | null>) => {
      state.selectedColumn = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch columns
      .addCase(fetchColumns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchColumns.fulfilled, (state, action) => {
        state.loading = false;
        state.columns = action.payload.columns;
        state.count = action.payload.count;
      })
      .addCase(fetchColumns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create column
      .addCase(createColumn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createColumn.fulfilled, (state, action) => {
        state.loading = false;
        // Note: The page handles refetching after create
      })
      .addCase(createColumn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update column
      .addCase(updateColumn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateColumn.fulfilled, (state, action) => {
        state.loading = false;
        // Note: The page handles refetching after update
      })
      .addCase(updateColumn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete column
      .addCase(deleteColumn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteColumn.fulfilled, (state, action) => {
        state.loading = false;
        state.columns = state.columns.filter((c) => c.id !== action.payload);
        state.count -= 1;
      })
      .addCase(deleteColumn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedColumn, clearError } = columnsSlice.actions;
export default columnsSlice.reducer;