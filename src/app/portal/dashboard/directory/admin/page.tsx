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

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
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
  }, [users, searchTerm]);

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
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
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
