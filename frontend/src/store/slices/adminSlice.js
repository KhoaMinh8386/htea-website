import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';

// Fetch dashboard stats
export const fetchStats = createAsyncThunk(
  'admin/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/admin/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Fetch all users (staff and admin)
export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/users');
      console.log('Users response:', response.data);
      
      if (!response.data || !response.data.success || !Array.isArray(response.data.data?.users)) {
        return rejectWithValue('Dữ liệu người dùng không hợp lệ');
      }

      return response.data.data.users;
    } catch (error) {
      console.error('Error fetching users:', error);
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải danh sách người dùng');
    }
  }
);

// Create new user (staff or admin)
export const createUser = createAsyncThunk(
  'admin/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tạo người dùng');
    }
  }
);

// Update user
export const updateUser = createAsyncThunk(
  'admin/updateUser',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('Updating user with data:', userData);
      const response = await axiosInstance.put(`/users/${userData.id}`, {
        full_name: userData.full_name,
        email: userData.email,
        role: userData.role,
        ...(userData.password && { password: userData.password })
      });
      console.log('Update response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Cập nhật thất bại');
      }

      return response.data.user;
    } catch (error) {
      console.error('Error updating user:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Không thể cập nhật người dùng');
    }
  }
);

// Delete user
export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/users/${userId}`);
      return userId;
    } catch (error) {
      console.error('Error deleting user:', error);
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa người dùng');
    }
  }
);

// Fetch revenue stats
export const fetchRevenueStats = createAsyncThunk(
  'admin/fetchRevenueStats',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/admin/revenue', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  stats: null,
  users: [],
  revenueStats: null,
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload || [];
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.users = [];
      })
      // Create User
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.users.push(action.payload);
        }
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update User
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.users.findIndex(user => user.id === action.payload.id);
          if (index !== -1) {
            state.users[index] = action.payload;
          }
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Dashboard Stats
      .addCase(fetchStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch dashboard stats';
      })
      // Fetch Revenue Stats
      .addCase(fetchRevenueStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRevenueStats.fulfilled, (state, action) => {
        state.loading = false;
        state.revenueStats = action.payload;
      })
      .addCase(fetchRevenueStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch revenue stats';
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer; 