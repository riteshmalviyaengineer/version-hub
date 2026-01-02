import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, ExternalLink, Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchVendors, deleteVendor, createVendor, updateVendor } from '@/store/vendorsSlice';
import { Vendor, CreateVendorPayload } from '@/services/vendorService';
import MainLayout from '@/layouts/MainLayout';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import VendorFormModal from '@/features/vendors/VendorFormModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const VendorListingPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { vendors, loading, error } = useAppSelector((state) => state.vendors);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchVendors());
  }, [dispatch]);

  const handleCreateVendor = () => {
    setEditingVendor(null);
    setIsFormOpen(true);
  };

  const handleEditVendor = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (vendor: Vendor) => {
    setVendorToDelete(vendor);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (vendorToDelete) {
      try {
        await dispatch(deleteVendor(vendorToDelete.id)).unwrap();
        toast({
          title: 'Vendor deleted',
          description: `${vendorToDelete.vendor_name} has been deleted successfully.`,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete vendor. Please try again.',
          variant: 'destructive',
        });
      }
    }
    setDeleteConfirmOpen(false);
    setVendorToDelete(null);
  };

  const handleFormSubmit = async (data: CreateVendorPayload) => {
    try {
      if (editingVendor) {
        await dispatch(updateVendor({ id: editingVendor.id, payload: data })).unwrap();
        toast({
          title: 'Vendor updated',
          description: `${data.vendor_name} has been updated successfully.`,
        });
      } else {
        await dispatch(createVendor(data)).unwrap();
        toast({
          title: 'Vendor created',
          description: `${data.vendor_name} has been created successfully.`,
        });
      }
      dispatch(fetchVendors());
      setIsFormOpen(false);
      setEditingVendor(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${editingVendor ? 'update' : 'create'} vendor. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  const handleVendorClick = (vendorId: number) => {
    navigate(`/vendors/${vendorId}/versions`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter vendors based on search term
  const filteredVendors = vendors.filter(vendor =>
    vendor.vendor_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <PageHeader
        title="Vendors"
        description="Manage your vendor catalog and their versions"
        breadcrumbs={[{ label: 'Vendors' }]}
        actions={
          <Button onClick={handleCreateVendor} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Vendor
          </Button>
        }
      />

      <div className="p-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search vendors by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading && vendors.length === 0 ? (
          <LoadingSpinner text="Loading vendors..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={() => dispatch(fetchVendors())} />
        ) : filteredVendors.length === 0 ? (
          <EmptyState
            title={searchTerm ? "No vendors found" : "No vendors yet"}
            description={searchTerm ? `No vendors match "${searchTerm}". Try a different search term.` : "Get started by creating your first vendor."}
            action={
              <Button onClick={handleCreateVendor} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Vendor
              </Button>
            }
          />
        ) : (
          <div className="bg-card rounded-lg border border-border overflow-hidden animate-fade-in">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vendor Name</th>
                  <th>Vendor Code</th>
                  <th>Created At</th>
                  <th className="w-32 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="group">
                    <td>
                      <button
                        onClick={() => handleVendorClick(vendor.id)}
                        className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
                      >
                        {vendor.vendor_name}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </td>
                    <td>
                      <code className="px-2 py-1 bg-secondary rounded text-xs font-mono">
                        {vendor.vendor_code}
                      </code>
                    </td>
                    <td className="text-muted-foreground">{formatDate(vendor.created_at)}</td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditVendor(vendor)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(vendor)}
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

      {/* Create/Edit Vendor Modal */}
      <VendorFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingVendor(null);
        }}
        onSubmit={handleFormSubmit}
        vendor={editingVendor}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Vendor"
        description={`Are you sure you want to delete "${vendorToDelete?.vendor_name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
      />
    </MainLayout>
  );
};

export default VendorListingPage;
