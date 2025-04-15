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
    text: 'Quản lý danh mục',
    icon: <CategoryIcon />,
    path: '/admin/categories'
  },
  {
    text: 'Cài đặt',
    icon: <SettingsIcon />,
    path: '/admin/settings'
  }
]; 