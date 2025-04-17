import { 
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  ShoppingCart as ProductsIcon,
  Category as CategoryIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';

const menuItems = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/admin'
  },
  {
    text: 'Quản lý người dùng',
    icon: <PeopleIcon />,
    path: '/admin/users'
  },
  {
    text: 'Quản lý sản phẩm',
    icon: <ProductsIcon />,
    path: '/admin/products'
  },
  {
    path: '/admin/categories',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
    text: 'Quản lý danh mục',
  },
  {
    text: 'Cài đặt',
    icon: <SettingsIcon />,
    path: '/admin/settings'
  }
]; 