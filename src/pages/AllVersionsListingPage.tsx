import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  fetchAllVersions,
  createVersion,
  updateVersion,
  deleteVersion,
} from '@/store/versionsSlice';

import { Version, CreateVersionPayload } from '@/services/versionService';

import MainLayout from '@/layouts/MainLayout';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import VersionFormModal from '@/features/versions/VersionFormModal';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const AllVersionsListingPage = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const { versions, loading, error } = useAppSelector(
    (state) => state.versions
  );

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVersion, setEditingVersion] = useState<Version | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [versionToDelete, setVersionToDelete] = useState<Version | null>(null);

  /**
   * Fetch ALL versions of ALL vendors
   * Runs on first render
   */
  useEffect(() => {
    dispatch(fetchAllVersions());
  }, [dispatch]);

  const handleCreateVersion = () => {
    setEditingVersion(null);
    setIsFormOpen(true);
  };

  const handleEditVersion = (version: Version) => {
    setEditingVersion(version);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (version: Version) => {
    setVersionToDelete(version);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!versionToDelete) return;

    try {
      await dispatch(deleteVersion(versionToDelete.id)).unwrap();
      toast({
        title: 'Version deleted',
        description: `${versionToDelete.version_name} has been deleted successfully.`,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete version. Please try again.',
        variant: 'destructive',
      });
    }

    setDeleteConfirmOpen(false);
    setVersionToDelete(null);
  };

  const handleFormSubmit = async (data: CreateVersionPayload) => {
    try {
      if (editingVersion) {
        await dispatch(
          updateVersion({ id: editingVersion.id, payload: data })
        ).unwrap();

        toast({
          title: 'Version updated',
          description: `${data.version_name} has been updated successfully.`,
        });
      } else {
        await dispatch(createVersion(data)).unwrap();

        toast({
          title: 'Version created',
          description: `${data.version_name} has been created successfully.`,
        });
      }

      dispatch(fetchAllVersions());
      setIsFormOpen(false);
      setEditingVersion(null);
    } catch {
      toast({
        title: 'Error',
        description: `Failed to ${
          editingVersion ? 'update' : 'create'
        } version.`,
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <MainLayout>
      <PageHeader
        title="All Versions"
        description="Manage versions across all vendors"
        breadcrumbs={[{ label: 'Versions' }]}
        actions={
          <Button onClick={handleCreateVersion} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Version
          </Button>
        }
      />

      <div className="p-6">
        {loading && versions.length === 0 ? (
          <LoadingSpinner text="Loading versions..." />
        ) : error ? (
          <ErrorMessage
            message={error}
            onRetry={() => dispatch(fetchAllVersions())}
          />
        ) : versions.length === 0 ? (
          <EmptyState
            title="No versions found"
            description="Start by creating your first version."
            action={
              <Button onClick={handleCreateVersion} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Version
              </Button>
            }
          />
        ) : (
          <div className="bg-card rounded-lg border border-border overflow-hidden animate-fade-in">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Version Name</th>
                  <th>Vendor Name</th>
                  <th>Vendor Code</th>
                  <th>Created At</th>
                  <th className="w-32 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {versions.map((version) => (
                  <tr key={version.id}>
                    <td className="font-medium">{version.version_name}</td>
                    <td>
                      <code className="px-2 py-1 bg-secondary rounded text-xs font-mono">
                        {version.vendor_name}
                      </code>
                    </td>
                    <td>
                      <code className="px-2 py-1 bg-secondary rounded text-xs font-mono">
                        {version.vendor_code}
                      </code>
                    </td>
                    <td className="text-muted-foreground">
                      {formatDate(version.created_at)}
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditVersion(version)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(version)}
                          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Version Modal */}
      <VersionFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingVersion(null);
        }}
        onSubmit={handleFormSubmit}
        version={editingVersion}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Version"
        description={`Are you sure you want to delete "${versionToDelete?.version_name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
      />
    </MainLayout>
  );
};

export default AllVersionsListingPage;
