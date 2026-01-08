import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, ExternalLink, ArrowLeft } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchVersionsByVendor, deleteVersion, createVersion, updateVersion } from '@/store/versionsSlice';
import { fetchVendors } from '@/store/vendorsSlice';
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

 const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

const VersionListingPage = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  
  const { versions, loading, error } = useAppSelector((state) => state.versions);
  const { vendors } = useAppSelector((state) => state.vendors);
  
  const vendor = vendors.find((v) => v.id === Number(vendorId));

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVersion, setEditingVersion] = useState<Version | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [versionToDelete, setVersionToDelete] = useState<Version | null>(null);

  useEffect(() => {
    if (vendorId) {
      dispatch(fetchVersionsByVendor(Number(vendorId)));
      // Fetch vendors if not loaded (for breadcrumb display)
      if (vendors.length === 0) {
        dispatch(fetchVendors());
      }
    }
  }, [dispatch, vendorId, vendors.length]);

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
    if (versionToDelete) {
      try {
        await dispatch(deleteVersion(versionToDelete.id)).unwrap();
        toast({
          title: 'Version deleted',
          description: `${versionToDelete.version_name} has been deleted successfully.`,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete version. Please try again.',
          variant: 'destructive',
        });
      }
    }
    setDeleteConfirmOpen(false);
    setVersionToDelete(null);
  };

  const handleFormSubmit = async (data: Omit<CreateVersionPayload, 'vendor_id'>) => {
    try {
      if (editingVersion) {
        await dispatch(updateVersion({ id: editingVersion.id, payload: data })).unwrap();
        toast({
          title: 'Version updated',
          description: `${data.version_name} has been updated successfully.`,
        });
      } else {
        await dispatch(createVersion({ ...data, vendor_id: Number(vendorId) })).unwrap();
        toast({
          title: 'Version created',
          description: `${data.version_name} has been created successfully.`,
        });
      }
      await dispatch(fetchVersionsByVendor(Number(vendorId)));
      setIsFormOpen(false);
      setEditingVersion(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${editingVersion ? 'update' : 'create'} version. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  const handleVersionClick = (versionId: number) => {
    navigate(`/vendors/${vendorId}/versions/${versionId}`);
  };

  return (
    <MainLayout>
      <PageHeader
        title={`Versions${vendor ? ` - ${vendor.vendor_name} (${vendor.vendor_type})` : ''}`}
        description="Manage versions for this vendor"
        breadcrumbs={[
          { label: 'Vendors', path: '/vendors' },
          { label: vendor?.vendor_name || 'Versions' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/vendors')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button onClick={handleCreateVersion} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Version
            </Button>
          </div>
        }
      />

      <div className="p-6">
        {loading && versions.length === 0 ? (
          <LoadingSpinner text="Loading versions..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={() => dispatch(fetchVersionsByVendor(Number(vendorId)))} />
        ) : versions.length === 0 ? (
          <EmptyState
            title="No versions yet"
            description="Get started by creating your first version for this vendor."
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
                  <th>Vendor Code</th>
                  <th>Created At</th>
                  <th className="w-32 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {versions.map((version) => (
                  <tr key={version.id} className="group">
                    <td>
                      <button
                        onClick={() => handleVersionClick(version.id)}
                        className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
                      >
                        {version.version_name}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </td>
                    <td>
                      <code className="px-2 py-1 bg-secondary rounded text-xs font-mono">
                        {version.vendor_code}
                      </code>
                    </td>
                    
                    <td className="text-muted-foreground">{formatDate(version.created_at)}</td>

                    <td>
                      <div className="flex items-center justify-end gap-1">
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
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
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

      {/* Create/Edit Version Modal */}
      <VersionFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingVersion(null);
        }}
        onSubmit={handleFormSubmit}
        version={editingVersion}
      />

      {/* Delete Confirmation Dialog */}
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

export default VersionListingPage;
