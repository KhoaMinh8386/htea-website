import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// Cấu hình axios
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

const Profile = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [profile, setProfile] = useState({
        id: user?.id || '',
        username: user?.username || '',
        email: user?.email || '',
        full_name: user?.full_name || '',
        phone: user?.phone || '',
        address: user?.address || '',
        role: user?.role || '',
        is_active: user?.is_active || true
    });

    useEffect(() => {
        // Kiểm tra token và thiết lập lại nếu cần
        const token = localStorage.getItem('token');
        
        if (!token) {
            toast.error('Vui lòng đăng nhập lại');
            navigate('/login');
            return;
        }

        // Cấu hình lại axios với token mới
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        const fetchUserData = async () => {
            try {
                console.log('Fetching profile with token:', token);
                const response = await api.get('/profile');
                console.log('Profile response:', response.data);
                if (response.data) {
                    setProfile(response.data);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    dispatch({ type: 'LOGOUT' });
                    toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
                    navigate('/login');
                } else {
                    toast.error('Không thể tải thông tin người dùng');
                }
            }
        };

        fetchUserData();
    }, [user, navigate, dispatch]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value || ''
        }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            // Chỉ gửi các trường có thể cập nhật
            const updateData = {
                email: profile.email,
                full_name: profile.full_name,
                phone: profile.phone,
                address: profile.address
            };

            console.log('Updating profile with data:', updateData);
            const response = await api.put('/profile', updateData);
            console.log('Update response:', response.data);
            
            if (response.data) {
                // Cập nhật state và redux store
                setProfile(prev => ({
                    ...prev,
                    ...response.data.user
                }));
                
                // Cập nhật thông tin trong redux store
                dispatch({
                    type: 'UPDATE_USER',
                    payload: response.data.user
                });
                
                toast.success(response.data.message || 'Cập nhật thông tin thành công');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                dispatch({ type: 'LOGOUT' });
                toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
                navigate('/login');
            } else {
                toast.error(error.response?.data?.message || 'Cập nhật thông tin thất bại');
            }
        }
    };

    if (!user) {
        return <div className="text-center mt-8">Vui lòng đăng nhập để xem thông tin cá nhân</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Thông tin cá nhân</h1>
            
            <div className="bg-white rounded-lg shadow-md p-6">
                <form onSubmit={handleProfileSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
                            <input
                                type="text"
                                name="username"
                                value={profile.username}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                disabled
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={profile.email}
                                onChange={handleProfileChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
                            <input
                                type="text"
                                name="full_name"
                                value={profile.full_name}
                                onChange={handleProfileChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                            <input
                                type="tel"
                                name="phone"
                                value={profile.phone}
                                onChange={handleProfileChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                            <input
                                type="text"
                                name="address"
                                value={profile.address}
                                onChange={handleProfileChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Vai trò</label>
                            <input
                                type="text"
                                name="role"
                                value={profile.role}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                disabled
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                            <input
                                type="text"
                                name="is_active"
                                value={profile.is_active ? 'Hoạt động' : 'Không hoạt động'}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                disabled
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                        Cập nhật thông tin
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile; 