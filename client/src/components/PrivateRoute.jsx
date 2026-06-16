import { Outlet, Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function PrivateRoute() {
  const { user: User } = useUser();
  return User ? <Outlet /> : <Navigate to='/signin' />;
}