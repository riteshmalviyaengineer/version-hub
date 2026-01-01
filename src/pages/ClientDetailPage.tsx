import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { deleteClient } from '@/store/clientsSlice';
import { Client, clientService } from '@/services/clientService';
import MainLayout from '@/layouts/MainLayout';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const ClientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    const fetchClient = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const clientData = await clientService.getById(parseInt(id));
        setClient(clientData);
      } catch (err) {
        setError('Failed to load client details');
        console.error('Error fetching client:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id]);

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (client) {
      try {
        await dispatch(deleteClient(client.id)).unwrap();
        toast({
          title: 'Client deleted',
          description: `${client.agencynamelong} has been deleted successfully.`,
        });
        navigate('/clients');
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete client. Please try again.',
          variant: 'destructive',
        });
      }
    }
    setDeleteConfirmOpen(false);
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

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-96">
          <LoadingSpinner text="Loading client details..." />
        </div>
      </MainLayout>
    );
  }

  if (error || !client) {
    return (
      <MainLayout>
        <ErrorMessage
          message={error || "Client not found"}
          onRetry={() => window.location.reload()}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title={client.agencynamelong}
        description={`Client details and configuration`}
        breadcrumbs={[
          { label: 'Clients', path: '/clients' },
          { label: client.agencynamelong }
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to={`/clients/${client.id}/edit`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Client
              </Link>
            </Button>
            <Button variant="destructive" onClick={handleDeleteClick}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Client
            </Button>
          </div>
        }
      />

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Agency Name Long</label>
                <p className="text-sm font-medium">{client.agencynamelong}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Agency Name Short</label>
                <p className="text-sm">{client.agencynameshort || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Agency Name Abbrv</label>
                <p className="text-sm">{client.agencynameabbrv || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Alias 1</label>
                <p className="text-sm">{client.alias1 || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Alias 2</label>
                <p className="text-sm">{client.alias2 || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Agency State</label>
                <p className="text-sm">{client.agencystate || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">FDID</label>
                <p className="text-sm">
                  <Badge variant="secondary">{client.fdid}</Badge>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">PlugUgly FDID</label>
                <p className="text-sm">
                  <Badge variant="secondary">{client.pluguglyfdid}</Badge>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Data Source</label>
                <p className="text-sm">{client.sourcetype || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Inc Type Standard</label>
                <p className="text-sm">{client.inctypestandard}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created At</label>
                <p className="text-sm">{formatDate(client.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Edit Date</label>
                <p className="text-sm">{formatDate(client.last_edit_date)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Integration Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Data Integration Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Source Key 1</label>
                <p className="text-sm">{client.sourcekey1 || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Source Key 2</label>
                <p className="text-sm">{client.sourcekey2 || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Source Key 3</label>
                <p className="text-sm">{client.sourcekey3 || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Workflow Route</label>
                <p className="text-sm">{client.workflow_route || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">ESRI Global ID</label>
                <p className="text-sm">{client.esri_global_id || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle>Location Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Latitude</label>
                <p className="text-sm">{client.latitude}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Longitude</label>
                <p className="text-sm">{client.longitude}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Geometry</label>
                <p className="text-sm font-mono text-xs">{client.geom}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Client"
        description={`Are you sure you want to delete "${client.agencynamelong}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
      />
    </MainLayout>
  );
};

export default ClientDetailPage;