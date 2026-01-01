import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchClients, deleteClient } from '@/store/clientsSlice';
import { Client } from '@/services/clientService';
import MainLayout from '@/layouts/MainLayout';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const ClientListingPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { clients, loading, error } = useAppSelector((state) => state.clients);

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  useEffect(() => {
    dispatch(fetchClients());
  }, [dispatch]);

  const handleCreateClient = () => {
    navigate('/clients/create');
  };

  const handleClientClick = (clientId: number) => {
    navigate(`/clients/${clientId}`);
  };

  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (clientToDelete) {
      try {
        await dispatch(deleteClient(clientToDelete.id)).unwrap();
        toast({
          title: 'Client deleted',
          description: `${clientToDelete.agencynamelong} has been deleted successfully.`,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete client. Please try again.',
          variant: 'destructive',
        });
      }
    }
    setDeleteConfirmOpen(false);
    setClientToDelete(null);
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

  console.log('Rendering ClientListingPage with clients:', clients);

  return (
    <MainLayout>
      <PageHeader
        title="Clients"
        description="Manage your client catalog"
        breadcrumbs={[{ label: 'Clients' }]}
        actions={
          <Button onClick={handleCreateClient} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Client
          </Button>
        }
      />

      <div className="p-6">
        {loading && clients.length === 0 ? (
          <LoadingSpinner text="Loading clients..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={() => dispatch(fetchClients())} />
        ) : clients.length === 0 ? (
          <EmptyState
            title="No clients yet"
            description="Get started by creating your first client."
            action={
              <Button onClick={handleCreateClient} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Client
              </Button>
            }
          />
        ) : (
          <div className="bg-card rounded-lg border border-border overflow-hidden animate-fade-in">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Agency Name</th>
                  <th>Created At</th>
                  <th className="w-32 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="group">
                    <td>
                      <button
                        onClick={() => handleClientClick(client.id)}
                        className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
                      >
                        {client.agencynamelong}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </td>
                    <td className="text-muted-foreground">{formatDate(client.created_at)}</td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                            <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(client)}
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Client"
        description={`Are you sure you want to delete "${clientToDelete?.agencynamelong}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
      />
    </MainLayout>
  );
};

export default ClientListingPage;