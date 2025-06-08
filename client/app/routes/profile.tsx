import { Profile } from '../components/profile';
import { ProtectedRoute } from '../components/ProtectedRoute';

export function meta() {
  return [
    { title: 'Profile Settings - Document Archive' },
    { name: 'description', content: 'Manage your profile settings and preferences' },
  ];
}

export default function ProfileRoute() {
  return (
    <ProtectedRoute requireAuth={true}>
      <Profile />
    </ProtectedRoute>
  );
} 