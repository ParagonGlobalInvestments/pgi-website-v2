'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
import {
  FaSearch,
  FaEdit,
  FaTimes,
  FaArrowLeft,
  FaCheck,
  FaTrash,
  FaPlus,
} from 'react-icons/fa';
import {
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Link from 'next/link';
import ProtectedPage from '@/components/auth/ProtectedPage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface User {
  id: string;
  personal: {
    name: string;
    email: string;
    bio?: string;
    major?: string;
    gradYear?: number;
    isAlumni?: boolean;
    phone?: string;
  };
  org: {
    permissionLevel: string;
    track?: 'quant' | 'value';
    trackRoles: string[];
    execRoles: string[];
    status?: string;
    chapterId?: string;
    joinDate?: string;
  };
  profile?: {
    skills?: string[];
    linkedin?: string;
    avatarUrl?: string;
    github?: string;
    resumeUrl?: string;
  };
}

export default function AdminDirectoryPage() {
  const { user: supabaseUserData, isLoading } = useSupabaseUser();
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setSupabaseUser(user);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<User> | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [chapters, setChapters] = useState<
    Array<{ _id: string; name: string }>
  >([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string | null>(null);
  const [showPending, setShowPending] = useState(true);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({
    personal: {
      name: '',
      email: '',
    },
    org: {
      permissionLevel: 'member',
      trackRoles: [],
      execRoles: [],
      status: 'pending',
    },
    profile: {},
  });

  // Fetch chapters
  useEffect(() => {
    if (isLoading || !supabaseUser) return;

    const fetchChapters = async () => {
      try {
        const response = await fetch('/api/chapters');
        if (!response.ok) {
          throw new Error('Failed to fetch chapters');
        }
        const data = await response.json();
        setChapters(data);
      } catch (error) {
        console.error('Error fetching chapters:', error);
        toast.error('Failed to load chapters');
      }
    };

    fetchChapters();
  }, [supabaseUser]);

  // Fetch users
  useEffect(() => {
    if (isLoading || !supabaseUser) return;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/users', {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch users');
        }

        setUsers(data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [supabaseUser]);

  // Check admin permission
  useEffect(() => {
    if (!isLoading && supabaseUserData?.org_permission_level !== 'admin') {
      router.push('/portal/dashboard/directory');
    }
  }, [isLoading, supabaseUserData, router]);

  // Separate pending and active users
  const pendingUsers = useMemo(() => {
    return users.filter(user => user.org?.status === 'pending');
  }, [users]);

  const activeUsers = useMemo(() => {
    return users.filter(user => user.org?.status !== 'pending');
  }, [users]);

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    return activeUsers.filter(user => {
      const searchFields = [
        user.personal?.name,
        user.personal?.email,
        user.personal?.major,
        user.org?.permissionLevel,
        user.org?.track,
        ...(user.profile?.skills || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchFields.includes(searchTerm.toLowerCase());
    });
  }, [activeUsers, searchTerm]);

  const handleEdit = (user: User) => {
    setEditingUser(user.id);
    setEditForm(user);
  };

  const handleSave = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to update user');
      }

      // Update local state
      setUsers(users.map(u => (u.id === userId ? { ...u, ...editForm } : u)));
      setEditingUser(null);
      setEditForm(null);
      toast.success('User updated successfully');
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.message || 'Failed to update user');
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
    setEditForm(null);
  };

  const handleInputChange = (
    field: string,
    value: any,
    section?: 'personal' | 'org' | 'profile'
  ) => {
    if (!editForm) return;

    if (section) {
      setEditForm({
        ...editForm,
        [section]: {
          ...editForm[section],
          [field]: value,
        },
      });
    } else {
      setEditForm({
        ...editForm,
        [field]: value,
      });
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete user');
      }

      // Update local state
      setUsers(users.filter(u => u.id !== userId));
      toast.success('User deleted successfully');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
    } finally {
      setUserToDelete(null);
    }
  };

  const handleAddUser = async () => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to create user');
      }

      // Update local state
      setUsers([...users, data.user]);
      setIsAddUserDialogOpen(false);
      setNewUser({
        personal: {
          name: '',
          email: '',
        },
        org: {
          permissionLevel: 'member',
          trackRoles: [],
          execRoles: [],
          status: 'pending',
        },
        profile: {},
      });
      toast.success('User created successfully');
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Failed to create user');
    }
  };

  const handleNewUserInputChange = (
    field: string,
    value: any,
    section?: 'personal' | 'org' | 'profile'
  ) => {
    if (section) {
      setNewUser({
        ...newUser,
        [section]: {
          ...newUser[section],
          [field]: value,
        },
      });
    } else {
      setNewUser({
        ...newUser,
        [field]: value,
      });
    }
  };

  // Bulk action handlers
  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.size === 0) {
      toast.error('No users selected');
      return;
    }

    setBulkAction(action);
    const userIds = Array.from(selectedUsers);

    try {
      let updates: Partial<User> = {};
      let actionName = '';

      switch (action) {
        case 'promote-lead':
          updates = { org: { permissionLevel: 'lead' } as any };
          actionName = 'promoted to Lead';
          break;
        case 'demote-member':
          updates = { org: { permissionLevel: 'member' } as any };
          actionName = 'demoted to Member';
          break;
        case 'set-active':
          updates = { org: { status: 'active' } as any };
          actionName = 'set to Active';
          break;
        case 'set-inactive':
          updates = { org: { status: 'inactive' } as any };
          actionName = 'set to Inactive';
          break;
        default:
          toast.error('Invalid action');
          return;
      }

      // Update each user
      await Promise.all(
        userIds.map(userId =>
          fetch(`/api/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          })
        )
      );

      // Update local state
      setUsers(
        users.map(u => {
          if (userIds.includes(u.id)) {
            return { ...u, ...updates };
          }
          return u;
        })
      );

      toast.success(`${userIds.length} users ${actionName}`);
      setSelectedUsers(new Set());
    } catch (error) {
      console.error('Bulk action error:', error);
      toast.error('Failed to perform bulk action');
    } finally {
      setBulkAction(null);
    }
  };

  // Pending user actions
  const handleApprovePending = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org: { status: 'active' } }),
      });

      if (!response.ok) throw new Error('Failed to approve user');

      setUsers(
        users.map(u =>
          u.id === userId ? { ...u, org: { ...u.org, status: 'active' } } : u
        )
      );
      toast.success('User approved');
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Failed to approve user');
    }
  };

  const handleRejectPending = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org: { status: 'inactive' } }),
      });

      if (!response.ok) throw new Error('Failed to reject user');

      setUsers(
        users.map(u =>
          u.id === userId ? { ...u, org: { ...u.org, status: 'inactive' } } : u
        )
      );
      toast.success('User rejected');
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error('Failed to reject user');
    }
  };

  if (isLoading || loading || !supabaseUser) {
    return <div>Loading...</div>;
  }

  return (
    <ProtectedPage>
      <div className="space-y-6 p-6 text-navy">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 text-gray-900">
            <Button variant="ghost" asChild>
              <Link href="/portal/dashboard/directory">
                <FaArrowLeft className="mr-2" />
                Back to Directory
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">User Management</h1>
          </div>
          <Button
            onClick={() => setIsAddUserDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            Add User
          </Button>
        </div>

        {/* Pending Members Section */}
        {pendingUsers.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setShowPending(!showPending)}
              className="w-full p-4 flex justify-between items-center hover:bg-amber-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FaUsers className="text-amber-600" size={20} />
                <h2 className="text-lg font-semibold text-amber-900">
                  Pending Approvals
                </h2>
                <Badge className="bg-amber-600 text-white">
                  {pendingUsers.length}
                </Badge>
              </div>
              <FaArrowLeft
                className={`text-amber-600 transform transition-transform ${showPending ? 'rotate-90' : '-rotate-90'}`}
              />
            </button>

            {showPending && (
              <div className="p-4 border-t border-amber-200 space-y-3">
                {pendingUsers.map(user => (
                  <div
                    key={user.id}
                    className="bg-white p-4 rounded-lg border border-amber-200 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {user.personal?.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {user.personal?.email}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {user.org?.track && (
                          <Badge variant="outline">{user.org.track}</Badge>
                        )}
                        {user.org?.permissionLevel && (
                          <Badge variant="secondary">
                            {user.org.permissionLevel}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprovePending(user.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <FaCheck className="mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRejectPending(user.id)}
                      >
                        <FaTimes className="mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bulk Actions Bar */}
        {selectedUsers.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="font-medium text-blue-900">
                  {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''}{' '}
                  selected
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedUsers(new Set())}
                  className="text-blue-600"
                >
                  Clear Selection
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('promote-lead')}
                  disabled={!!bulkAction}
                >
                  Promote to Lead
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('demote-member')}
                  disabled={!!bulkAction}
                >
                  Demote to Member
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('set-active')}
                  disabled={!!bulkAction}
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  Set Active
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('set-inactive')}
                  disabled={!!bulkAction}
                  className="border-red-600 text-red-600 hover:bg-red-50"
                >
                  Set Inactive
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Add User Dialog */}
        <Dialog
          open={isAddUserDialogOpen}
          onOpenChange={setIsAddUserDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-black">Add New User</DialogTitle>
              <DialogDescription>
                Create a new user in the system. Required fields are marked with
                *.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 text-gray-700">
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">Name *</label>
                <Input
                  className="col-span-3"
                  value={newUser.personal?.name || ''}
                  onChange={e =>
                    handleNewUserInputChange('name', e.target.value, 'personal')
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">Email *</label>
                <Input
                  className="col-span-3"
                  value={newUser.personal?.email || ''}
                  onChange={e =>
                    handleNewUserInputChange(
                      'email',
                      e.target.value,
                      'personal'
                    )
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">Major</label>
                <Input
                  className="col-span-3"
                  value={newUser.personal?.major || ''}
                  onChange={e =>
                    handleNewUserInputChange(
                      'major',
                      e.target.value,
                      'personal'
                    )
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">Grad Year</label>
                <Input
                  type="number"
                  className="col-span-3"
                  value={newUser.personal?.gradYear || ''}
                  onChange={e =>
                    handleNewUserInputChange(
                      'gradYear',
                      parseInt(e.target.value),
                      'personal'
                    )
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">Permission Level</label>
                <select
                  className="col-span-3 border rounded p-2"
                  value={newUser.org?.permissionLevel || 'member'}
                  onChange={e =>
                    handleNewUserInputChange(
                      'permissionLevel',
                      e.target.value,
                      'org'
                    )
                  }
                >
                  <option value="member">Member</option>
                  <option value="lead">Lead</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">Track</label>
                <select
                  className="col-span-3 border rounded p-2"
                  value={newUser.org?.track || ''}
                  onChange={e =>
                    handleNewUserInputChange('track', e.target.value, 'org')
                  }
                >
                  <option value="">No Track</option>
                  <option value="quant">Quant</option>
                  <option value="value">Value</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">Chapter</label>
                <select
                  className="col-span-3 border rounded p-2"
                  value={newUser.org?.chapterId || ''}
                  onChange={e =>
                    handleNewUserInputChange('chapterId', e.target.value, 'org')
                  }
                >
                  <option value="">Select Chapter</option>
                  {chapters.map(chapter => (
                    <option key={chapter._id} value={chapter._id}>
                      {chapter.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">Status</label>
                <select
                  className="col-span-3 border rounded p-2"
                  value={newUser.org?.status || 'pending'}
                  onChange={e =>
                    handleNewUserInputChange('status', e.target.value, 'org')
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">Alumni</label>
                <select
                  className="col-span-3 border rounded p-2"
                  value={newUser.personal?.isAlumni ? 'true' : 'false'}
                  onChange={e =>
                    handleNewUserInputChange(
                      'isAlumni',
                      e.target.value === 'true',
                      'personal'
                    )
                  }
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setIsAddUserDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddUser}>Create User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <FaSearch className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="pl-4 pr-10 w-full text-gray-900 bg-white"
          />
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!userToDelete}
          onOpenChange={() => setUserToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                user and remove their data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={() => userToDelete && handleDelete(userToDelete)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={
                      selectedUsers.size === filteredUsers.length &&
                      filteredUsers.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Track</TableHead>
                <TableHead>Chapter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Alumni</TableHead>
                <TableHead>Track Roles</TableHead>
                <TableHead>Exec Roles</TableHead>
                <TableHead>Major</TableHead>
                <TableHead>Grad </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell>
                    {editingUser === user.id ? (
                      <Input
                        value={editForm?.personal?.name || ''}
                        onChange={e =>
                          handleInputChange('name', e.target.value, 'personal')
                        }
                        className="w-full text-gray-900"
                      />
                    ) : (
                      <span className="text-gray-900">
                        {user.personal?.name}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingUser === user.id ? (
                      <Input
                        value={editForm?.personal?.email || ''}
                        onChange={e =>
                          handleInputChange('email', e.target.value, 'personal')
                        }
                        className="w-full text-gray-900"
                      />
                    ) : (
                      <span className="text-gray-900">
                        {user.personal?.email}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingUser === user.id ? (
                      <select
                        value={editForm?.org?.permissionLevel || ''}
                        onChange={e =>
                          handleInputChange(
                            'permissionLevel',
                            e.target.value,
                            'org'
                          )
                        }
                        className="w-full border rounded p-1 text-gray-900 bg-white"
                      >
                        <option value="member">Member</option>
                        <option value="lead">Lead</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <Badge
                        variant={
                          user.org?.permissionLevel === 'admin'
                            ? 'destructive'
                            : user.org?.permissionLevel === 'lead'
                              ? 'amber'
                              : 'default'
                        }
                      >
                        {user.org?.permissionLevel}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingUser === user.id ? (
                      <select
                        value={editForm?.org?.track || ''}
                        onChange={e =>
                          handleInputChange('track', e.target.value, 'org')
                        }
                        className="w-full border rounded p-1 text-gray-900 bg-white"
                      >
                        <option value="">No Track</option>
                        <option value="quant">Quant</option>
                        <option value="value">Value</option>
                      </select>
                    ) : (
                      <Badge
                        variant={
                          user.org?.track === 'quant'
                            ? 'blue'
                            : user.org?.track === 'value'
                              ? 'purple'
                              : 'secondary'
                        }
                        className="whitespace-nowrap"
                      >
                        {user.org?.track || 'No Track'}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingUser === user.id ? (
                      <select
                        value={editForm?.org?.chapterId || ''}
                        onChange={e =>
                          handleInputChange('chapterId', e.target.value, 'org')
                        }
                        className="w-full border rounded p-1 text-gray-900 bg-white"
                      >
                        <option value="">Select Chapter</option>
                        {chapters.map(chapter => (
                          <option key={chapter._id} value={chapter._id}>
                            {chapter.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-gray-900">
                        {chapters.find(c => c._id === user.org?.chapterId)
                          ?.name || '-'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingUser === user.id ? (
                      <select
                        value={editForm?.org?.status || ''}
                        onChange={e =>
                          handleInputChange('status', e.target.value, 'org')
                        }
                        className="w-full border rounded p-1 text-gray-900 bg-white"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                      </select>
                    ) : (
                      <Badge
                        variant={
                          user.org?.status === 'active'
                            ? 'default'
                            : user.org?.status === 'inactive'
                              ? 'secondary'
                              : 'amber'
                        }
                      >
                        {user.org?.status || 'pending'}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingUser === user.id ? (
                      <select
                        value={editForm?.personal?.isAlumni ? 'true' : 'false'}
                        onChange={e =>
                          handleInputChange(
                            'isAlumni',
                            e.target.value === 'true',
                            'personal'
                          )
                        }
                        className="w-full border rounded p-1 text-gray-900 bg-white"
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    ) : (
                      <Badge
                        variant={user.personal?.isAlumni ? 'blue' : 'secondary'}
                      >
                        {user.personal?.isAlumni ? 'Alumni' : 'Student'}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingUser === user.id ? (
                      <select
                        value=""
                        onChange={e => {
                          const newRoles = [
                            ...(editForm?.org?.trackRoles || []),
                          ];
                          if (
                            e.target.value &&
                            !newRoles.includes(e.target.value)
                          ) {
                            newRoles.push(e.target.value);
                            handleInputChange('trackRoles', newRoles, 'org');
                          }
                        }}
                        className="w-full border rounded p-1 text-gray-900 bg-white"
                      >
                        <option value="">Add Role...</option>
                        <option value="QuantitativeAnalyst">
                          Quant Analyst
                        </option>
                        <option value="ValueAnalyst">Value Analyst</option>
                        <option value="PortfolioManager">
                          Portfolio Manager
                        </option>
                        <option value="QuantitativeResearchCommittee">
                          Quant Research Committee
                        </option>
                        <option value="InvestmentCommittee">
                          Investment Committee
                        </option>
                      </select>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {user.org?.trackRoles?.map((role, index) => (
                          <Badge key={index} variant="outline">
                            {role}
                          </Badge>
                        )) || '-'}
                      </div>
                    )}
                    {editingUser === user.id && editForm?.org?.trackRoles && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {editForm.org.trackRoles.map((role, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => {
                              const newRoles = editForm.org?.trackRoles?.filter(
                                (_, i) => i !== index
                              );
                              handleInputChange('trackRoles', newRoles, 'org');
                            }}
                          >
                            {role} <FaTimes className="ml-1 h-3 w-3" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingUser === user.id ? (
                      <select
                        value=""
                        onChange={e => {
                          const newRoles = [
                            ...(editForm?.org?.execRoles || []),
                          ];
                          if (
                            e.target.value &&
                            !newRoles.includes(e.target.value)
                          ) {
                            newRoles.push(e.target.value);
                            handleInputChange('execRoles', newRoles, 'org');
                          }
                        }}
                        className="w-full border rounded p-1 text-gray-900 bg-white"
                      >
                        <option value="">Add Role...</option>
                        <option value="chairman">Chairman</option>
                        <option value="ceo">CEO</option>
                        <option value="coo">COO</option>
                        <option value="cio">CIO</option>
                        <option value="cqr">CQR</option>
                        <option value="cto">CTO</option>
                        <option value="Chapter Founder">Chapter Founder</option>
                        <option value="Founder">PGI Founder</option>
                        <option value="Alumni Board">Alumni Board</option>
                      </select>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {user.org?.execRoles?.map((role, index) => (
                          <Badge
                            key={index}
                            variant="destructive"
                            className="whitespace-nowrap uppercase"
                          >
                            {role}
                          </Badge>
                        )) || '-'}
                      </div>
                    )}
                    {editingUser === user.id && editForm?.org?.execRoles && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {editForm.org.execRoles.map((role, index) => (
                          <Badge
                            key={index}
                            variant="destructive"
                            className="cursor-pointer"
                            onClick={() => {
                              const newRoles = editForm.org?.execRoles?.filter(
                                (_, i) => i !== index
                              );
                              handleInputChange('execRoles', newRoles, 'org');
                            }}
                          >
                            {role} <FaTimes className="ml-1 h-3 w-3" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingUser === user.id ? (
                      <Input
                        value={editForm?.personal?.major || ''}
                        onChange={e =>
                          handleInputChange('major', e.target.value, 'personal')
                        }
                        className="w-full text-gray-900"
                      />
                    ) : (
                      <span className="text-gray-900">
                        {user.personal?.major || '-'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingUser === user.id ? (
                      <Input
                        type="number"
                        value={editForm?.personal?.gradYear || ''}
                        onChange={e =>
                          handleInputChange(
                            'gradYear',
                            parseInt(e.target.value),
                            'personal'
                          )
                        }
                        className="w-full text-gray-900"
                      />
                    ) : (
                      <span className="text-gray-900">
                        {user.personal?.gradYear || '-'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingUser === user.id ? (
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                          onClick={() => handleSave(user.id)}
                        >
                          <FaCheck className="w-3 h-3" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex items-center gap-1"
                          onClick={handleCancel}
                        >
                          <FaTimes className="w-3 h-3" />
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex items-center gap-1"
                          onClick={() => handleEdit(user)}
                        >
                          <FaEdit className="w-3 h-3" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex items-center gap-1 text-red-600 hover:text-red-700"
                          onClick={() => setUserToDelete(user.id)}
                        >
                          <FaTrash className="w-3 h-3" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </ProtectedPage>
  );
}
