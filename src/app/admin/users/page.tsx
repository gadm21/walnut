'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

// Aligned with backend's UserResponse schema + a string 'id' for React keys
interface User {
  id: string; // For React key, derived from userId
  userId: number;
  username: string;
  role: number; // Backend sends number
  phoneNumber?: number | null; // Backend sends number or null
}

interface ApiError {
  detail: string;
}

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7050').replace(/\/$/, '');

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      // Assuming role '2' is admin, based on backend logic.
      // next-auth.d.ts ensures session.user.role is typed as number?.
      if (!session || !session.user || session.user.role !== 2) { 
        setIsLoading(false);
        setError('Access Denied. You do not have permission to view this page.');
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
          }
        }); 
        if (!response.ok) {
          const errorData: ApiError = await response.json(); 
          throw new Error(errorData.detail || 'Failed to fetch users');
        }
        const data: Omit<User, 'id'>[] = await response.json(); // Backend sends UserResponse items
        setUsers(data.map(u => ({ ...u, id: u.userId.toString() })));
      } catch (err) { 
        if (err instanceof Error) {
          setError(err.message);
        } else if (typeof err === 'string') {
          setError(err);
        } else {
          setError('An unexpected error occurred while fetching users.');
        }
      }
      setIsLoading(false);
    };

    if (status === 'authenticated') {
      fetchUsers();
    }
  }, [session, status]);

  const handleDeleteUser = async (userIdToDelete: number) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }
    if (!session || !session.user || session.user.role !== 2 || !session.accessToken) {
      setError('Action not allowed or session expired.');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userIdToDelete}`, {
         method: 'DELETE',
         headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        }
      });
      if (!response.ok && response.status !== 204) { // Check for not ok AND not 204
        const errorData: ApiError = await response.json(); 
        throw new Error(errorData.detail || 'Failed to delete user');
      }
      // If response is 204 (typical for successful DELETE), or other ok status:
      setUsers(users.filter(user => user.userId !== userIdToDelete));
      alert(`User ${userIdToDelete} deleted successfully.`);
    } catch (err) { 
      let message = 'An unexpected error occurred while deleting the user.';
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      }
      setError(`Failed to delete user: ${message}`);
    }
  };

  if (status === 'loading' || isLoading) {
    return <div className="container-custom py-12 text-center">Loading...</div>;
  }

  if (status === 'unauthenticated' || !session || !session.user ) {
    return <div className="container-custom py-12 text-center">Access Denied. Please log in.</div>;
  }
  // Assuming role '2' is admin
  if (session.user.role !== 2) {
    return <div className="container-custom py-12 text-center">Access Denied. You do not have permission to view this page.</div>;
  }

  if (error) {
    return <div className="container-custom py-12 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <section className="bg-secondary/30 py-8">
          <div className="container-custom">
            <h1 className="font-bold mb-2">Admin - User Management</h1>
            <p className="text-muted-foreground">
              View, and delete users.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container-custom">
            {users.length > 0 ? (
              <div className="overflow-x-auto bg-card rounded-xl border border-border/40">
                <table className="min-w-full divide-y divide-border/40">
                  <thead className="bg-muted/50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        User ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Username
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Phone Number
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                          {user.userId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                          {user.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {user.role} { /* Display role as number, or map to string e.g., getRoleName(user.role) */}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {user.phoneNumber?.toString() || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDeleteUser(user.userId)}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            // session.user.id is String(userId), user.userId is number from backend
                            disabled={session.user.id === user.userId.toString()} 
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-xl border border-border/40">
                <h3 className="text-xl font-medium mb-2">No users found.</h3>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
