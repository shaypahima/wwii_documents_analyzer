import { Profile } from '../components/profile';
import { ProtectedRoute } from '../components/ProtectedRoute';

export function meta() {
  return [
    { title: 'Profile Settings - The Chaim Herzog Museum' },
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