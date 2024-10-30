import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

function Profile() {
  const { user } = useAuth0();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">הפרופיל שלי</h1>
      {user && (
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <img
              src={user.picture}
              alt={user.name}
              className="w-16 h-16 rounded-full"
            />
            <div>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;