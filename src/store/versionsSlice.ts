import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  versionService,
  Version,
  VersionDetail,
  CreateVersionPayload,
  CreateVersionDetailPayload,
  VendorMappingVersionDetail,
  DuplicateVersionPayload,
} from "@/services/versionService";

// State interface
interface VersionsState {
  versions: Version[];
  count: number;
  loading: boolean;
  error: string | null;
  selectedVersion: Version | null;
  versionDetails: VendorMappingVersionDetail[];
  detailsLoading: boolean;
}

// Initial state
const initialState: VersionsState = {
  versions: [],
  count: 0,
  loading: false,
  error: null,
  selectedVersion: null,
  versionDetails: [],
  detailsLoading: false,
};

// Async thunks for version operations

export const fetchAllVersions = createAsyncThunk(
  "versions/fetchByVendor",
  async () => {
    try {
      const response = await versionService.Allversions();
      return response;
    } catch (error: any) {
      return;
    }
  }
);

export const fetchVersionsByVendor = createAsyncThunk(
  "versions/fetchByVendor",
  async (vendorId: number, { rejectWithValue }) => {
    try {
      const response = await versionService.getByVendor(vendorId);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch versions"
      );
    }
  }
);

export const fetchVersionById = createAsyncThunk(
  "versions/fetchById",
  async (versionId: number, { rejectWithValue }) => {
    try {
      const response = await versionService.getById(versionId);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch version"
      );
    }
  }
);

export const createVersion = createAsyncThunk(
  "versions/create",
  async (payload: CreateVersionPayload, { rejectWithValue }) => {
    try {
      const response = await versionService.create(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create version"
      );
    }
  }
);

export const updateVersion = createAsyncThunk(
  "versions/update",
  async (
    { id, payload }: { id: number; payload: Partial<CreateVersionPayload> },
    { rejectWithValue }
  ) => {
    try {
      const response = await versionService.update(id, payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update version"
      );
    }
  }
);

export const deleteVersion = createAsyncThunk(
  "versions/delete",
  async (versionId: number, { rejectWithValue }) => {
    try {
      await versionService.delete(versionId);
      return versionId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete version"
      );
    }
  }
);

export const duplicateVersion = createAsyncThunk(
  "versions/duplicate",
  async (payload: DuplicateVersionPayload, { rejectWithValue }) => {
    try {
      const response = await versionService.duplicate(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to duplicate version"
      );
    }
  }
);

export const fetchVersionDetails = createAsyncThunk(
  "versions/fetchDetails",
  async (versionId: number, { rejectWithValue }) => {
    try {
      const response = await versionService.getDetails(versionId);
      return response || [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch version details"
      );
    }
  }
);

export const createVersionDetail = createAsyncThunk(
  "versions/createDetail",
  async (payload: CreateVersionDetailPayload, { rejectWithValue }) => {
    try {
      const response = await versionService.createDetail(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create detail"
      );
    }
  }
);

export const updateVersionDetail = createAsyncThunk(
  "versions/updateDetail",
  async ({ id, payload }: { id: any; payload: any }, { rejectWithValue }) => {
    try {
      const response = await versionService.bulkupdateDetail(id, payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update detail"
      );
    }
  }
);

export const deleteVersionDetail = createAsyncThunk(
  "versions/deleteDetail",
  async (detailId: number, { rejectWithValue }) => {
    try {
      await versionService.deleteDetail(detailId);
      return detailId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete detail"
      );
    }
  }
);

// Slice definition
const versionsSlice = createSlice({
  name: "versions",
  initialState,
  reducers: {
    setSelectedVersion: (state, action: PayloadAction<Version | null>) => {
      state.selectedVersion = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearVersions: (state) => {
      state.versions = [];
      state.count = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch versions by vendor
      .addCase(fetchVersionsByVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVersionsByVendor.fulfilled, (state, action) => {
        state.loading = false;
        state.versions = action.payload.versions || [];
        state.count = action.payload.count || 0;
      })
      .addCase(fetchVersionsByVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch version by ID
      .addCase(fetchVersionById.fulfilled, (state, action) => {
        state.selectedVersion = action.payload;
      })
      // Create version
      .addCase(createVersion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVersion.fulfilled, (state, action) => {
        state.loading = false;
        state.versions.push(action.payload);
        state.count += 1;
      })
      .addCase(createVersion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update version
      .addCase(updateVersion.fulfilled, (state, action) => {
        const index = state.versions.findIndex(
          (v) => v.id === action.payload.id
        );
        if (index !== -1) {
          state.versions[index] = action.payload;
        }
      })
      // Delete version
      .addCase(deleteVersion.fulfilled, (state, action) => {
        state.versions = state.versions.filter((v) => v.id !== action.payload);
        state.count -= 1;
      })
      // Duplicate version
      .addCase(duplicateVersion.fulfilled, (state, action) => {
        state.versions.push(action.payload);
        state.count += 1;
      })
      // Fetch version details
      .addCase(fetchVersionDetails.pending, (state) => {
        state.detailsLoading = true;
      })
      .addCase(fetchVersionDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.versionDetails = action.payload;
      })
      .addCase(fetchVersionDetails.rejected, (state) => {
        state.detailsLoading = false;
      })
      // Create detail
      .addCase(createVersionDetail.fulfilled, (state, action) => {
        state.versionDetails.push(action.payload);
      })
      // Update detail
      .addCase(updateVersionDetail.fulfilled, (state, action) => {
        const index = state.versionDetails.findIndex(
          (d) => d.mapping_id === action.payload.mapping_id
        );
        if (index !== -1) {
          state.versionDetails[index] = action.payload;
        }
      })
      // Delete detail
      .addCase(deleteVersionDetail.fulfilled, (state, action) => {
        state.versionDetails = state.versionDetails.filter(
          (d) => d.mapping_id !== action.payload
        );
      });
  },
});

export const { setSelectedVersion, clearError, clearVersions } =
  versionsSlice.actions;
export default versionsSlice.reducer;
