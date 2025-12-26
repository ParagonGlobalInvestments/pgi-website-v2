'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Edit, Trash2, Upload } from 'lucide-react';

interface Pitch {
  id: string;
  ticker: string;
  team: 'value' | 'quant';
  pitch_date: string;
  excel_model_path?: string;
  pdf_report_path?: string;
  github_url?: string;
  created_at: string;
  updated_at: string;
}

interface PitchFormData {
  ticker: string;
  team: 'value' | 'quant';
  pitch_date: string;
  excel_model_path: string;
  pdf_report_path: string;
  github_url: string;
}

export default function PitchesAdminPage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useSupabaseUser();
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPitch, setEditingPitch] = useState<Pitch | null>(null);
  const [deletingPitchId, setDeletingPitchId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PitchFormData>({
    ticker: '',
    team: 'value',
    pitch_date: '',
    excel_model_path: '',
    pdf_report_path: '',
    github_url: '',
  });

  useEffect(() => {
    if (!userLoading) {
      if (!user || user.org_permission_level !== 'admin') {
        toast.error('Access denied. Admin privileges required.');
        router.push('/portal/dashboard/pitches');
      } else {
        fetchPitches();
      }
    }
  }, [user, userLoading, router]);

  const fetchPitches = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/pitches');
      const data = await res.json();
      setPitches(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching pitches:', error);
      toast.error('Failed to load pitches');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.ticker || !formData.team || !formData.pitch_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const url = editingPitch
        ? `/api/pitches/${editingPitch.id}`
        : '/api/pitches';
      const method = editingPitch ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: formData.ticker.toUpperCase(),
          team: formData.team,
          pitch_date: formData.pitch_date,
          excel_model_path: formData.excel_model_path || undefined,
          pdf_report_path: formData.pdf_report_path || undefined,
          github_url: formData.github_url || undefined,
        }),
      });

      if (res.ok) {
        toast.success(
          editingPitch
            ? 'Pitch updated successfully'
            : 'Pitch created successfully'
        );
        setIsDialogOpen(false);
        resetForm();
        fetchPitches();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to save pitch');
      }
    } catch (error) {
      console.error('Error saving pitch:', error);
      toast.error('An error occurred while saving the pitch');
    }
  };

  const handleEdit = (pitch: Pitch) => {
    setEditingPitch(pitch);
    setFormData({
      ticker: pitch.ticker,
      team: pitch.team,
      pitch_date: pitch.pitch_date,
      excel_model_path: pitch.excel_model_path || '',
      pdf_report_path: pitch.pdf_report_path || '',
      github_url: pitch.github_url || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingPitchId) return;

    try {
      const res = await fetch(`/api/pitches/${deletingPitchId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Pitch deleted successfully');
        fetchPitches();
      } else {
        toast.error('Failed to delete pitch');
      }
    } catch (error) {
      console.error('Error deleting pitch:', error);
      toast.error('An error occurred while deleting the pitch');
    } finally {
      setDeletingPitchId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      ticker: '',
      team: 'value',
      pitch_date: '',
      excel_model_path: '',
      pdf_report_path: '',
      github_url: '',
    });
    setEditingPitch(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (userLoading || isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen text-pgi-dark-blue pt-20 lg:pt-0">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push('/portal/dashboard/pitches')}
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>

          <Dialog
            open={isDialogOpen}
            onOpenChange={open => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-[#003E6B] hover:bg-[#002C4D]">
                <Plus className="h-4 w-4 mr-2" />
                Add Pitch
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto text-black">
              <DialogHeader>
                <DialogTitle>
                  {editingPitch ? 'Edit Pitch' : 'Add New Pitch'}
                </DialogTitle>
                <DialogDescription>
                  {editingPitch
                    ? 'Update the pitch information below.'
                    : 'Enter the details for the new pitch.'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ticker">
                      Ticker <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="ticker"
                      value={formData.ticker}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          ticker: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="AAPL"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="team">
                      Team <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.team}
                      onValueChange={(value: 'value' | 'quant') =>
                        setFormData({ ...formData, team: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="value">VALUE</SelectItem>
                        <SelectItem value="quant">QUANT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pitch_date">
                    Pitch Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="pitch_date"
                    type="date"
                    value={formData.pitch_date}
                    onChange={e =>
                      setFormData({ ...formData, pitch_date: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pdf_report_path">PDF Report Path</Label>
                  <Input
                    id="pdf_report_path"
                    value={formData.pdf_report_path}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        pdf_report_path: e.target.value,
                      })
                    }
                    placeholder="/resources/pitches/value/ticker-report.pdf"
                  />
                  <p className="text-xs text-gray-500">
                    Path relative to /public (e.g.,
                    /resources/pitches/value/AAPL-report.pdf)
                  </p>
                </div>

                {formData.team === 'value' && (
                  <div className="space-y-2">
                    <Label htmlFor="excel_model_path">Excel Model Path</Label>
                    <Input
                      id="excel_model_path"
                      value={formData.excel_model_path}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          excel_model_path: e.target.value,
                        })
                      }
                      placeholder="/resources/pitches/value/ticker-model.xlsx"
                    />
                    <p className="text-xs text-gray-500">
                      Path relative to /public (e.g.,
                      /resources/pitches/value/AAPL-model.xlsx)
                    </p>
                  </div>
                )}

                {formData.team === 'quant' && (
                  <div className="space-y-2">
                    <Label htmlFor="github_url">GitHub Repository URL</Label>
                    <Input
                      id="github_url"
                      value={formData.github_url}
                      onChange={e =>
                        setFormData({ ...formData, github_url: e.target.value })
                      }
                      placeholder="https://github.com/username/repo"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#003E6B] hover:bg-[#002C4D]"
                  >
                    {editingPitch ? 'Update Pitch' : 'Create Pitch'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Pitches Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Pitches ({pitches.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ticker
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Team
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date Pitched
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Files
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pitches.map(pitch => (
                    <tr key={pitch.id}>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold">
                        {pitch.ticker}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs uppercase">
                          {pitch.team}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {formatDate(pitch.pitch_date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {pitch.pdf_report_path && <span>PDF ✓</span>}
                        {pitch.excel_model_path && (
                          <span className="ml-2">Excel ✓</span>
                        )}
                        {pitch.github_url && (
                          <span className="ml-2">GitHub ✓</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(pitch)}
                          className="mr-2"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingPitchId(pitch.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {pitches.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p>No pitches found. Click &quot;Add Pitch&quot; to create one.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!deletingPitchId}
          onOpenChange={() => setDeletingPitchId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                pitch.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
