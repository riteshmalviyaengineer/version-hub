import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchClients, updateClient, fetchVersions } from '@/store/clientsSlice';
import { CreateClientPayload, UpdateClientPayload, VersionOption, Client } from '@/services/clientService';
import MainLayout from '@/layouts/MainLayout';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const ClientEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { clients, versions } = useAppSelector((state) => state.clients);

  const [client, setClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<UpdateClientPayload>({
    AgencyNameLong: '',
    DataSource: '',
    PlugUglyFDID: '',
    RecordUseType: 1,
    version_id: 0,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UpdateClientPayload, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data when component mounts
  useEffect(() => {
    if (clients.length === 0) {
      dispatch(fetchClients());
    }
    if (versions.length === 0) {
      dispatch(fetchVersions());
    }
  }, [clients.length, versions.length, dispatch]);

  // Set client data when available
  useEffect(() => {
    if (clients.length > 0 && id) {
      const foundClient = clients.find(c => c.id === parseInt(id));
      if (foundClient) {
        setClient(foundClient);
        setFormData({
          AgencyNameLong: foundClient.agencynamelong,
          DataSource: foundClient.sourcetype,
          PlugUglyFDID: foundClient.pluguglyfdid,
          RecordUseType: foundClient.inctypestandard,
          version_id: foundClient.version_id,
        });
      } else {
        navigate('/clients');
      }
    }
  }, [clients, id, navigate]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof UpdateClientPayload, string>> = {};

    if (!formData.AgencyNameLong.trim()) {
      newErrors.AgencyNameLong = 'Agency name is required';
    }

    if (!formData.PlugUglyFDID.trim()) {
      newErrors.PlugUglyFDID = 'PlugUgly FDID is required';
    }

    if (formData.version_id === 0) {
      newErrors.version_id = 'Version is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate() && client) {
      setIsSubmitting(true);
      try {
        await dispatch(updateClient({ id: client.id, payload: formData })).unwrap();
        toast({
          title: 'Client updated',
          description: `${formData.AgencyNameLong} has been updated successfully.`,
        });
        navigate(`/clients/${client.id}`);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to update client. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (client) {
      navigate(`/clients/${client.id}`);
    } else {
      navigate('/clients');
    }
  };

  if (!client) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-96">
          <LoadingSpinner text="Loading client..." />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title={"Edit " + (client?.agencynamelong || 'Client')}
        description="Update client details and configuration"
        breadcrumbs={[
          { label: 'Clients', path: '/clients' },
          { label: 'Edit' }
        ]}
        actions={
          <Button variant="outline" onClick={handleBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Client
          </Button>
        }
      />

      <div className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="AgencyNameLong">Agency Name Long *</Label>
                <Input
                  id="AgencyNameLong"
                  value={formData.AgencyNameLong}
                  onChange={(e) => setFormData({ ...formData, AgencyNameLong: e.target.value })}
                  placeholder="Fire Department of Example City"
                  className={errors.AgencyNameLong ? 'border-destructive' : ''}
                />
                {errors.AgencyNameLong && (
                  <p className="text-sm text-destructive">{errors.AgencyNameLong}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="PlugUglyFDID">PlugUgly FDID *</Label>
                <Input
                  id="PlugUglyFDID"
                  value={formData.PlugUglyFDID}
                  onChange={(e) => setFormData({ ...formData, PlugUglyFDID: e.target.value })}
                  placeholder="MI-04601"
                  className={errors.PlugUglyFDID ? 'border-destructive' : ''}
                />
                {errors.PlugUglyFDID && (
                  <p className="text-sm text-destructive">{errors.PlugUglyFDID}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="DataSource">Data Source</Label>
                <Input
                  id="DataSource"
                  value={formData.DataSource}
                  onChange={(e) => setFormData({ ...formData, DataSource: e.target.value })}
                  placeholder="firstdue"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="RecordUseType">Record Use Type</Label>
                <Input
                  id="RecordUseType"
                  type="number"
                  value={formData.RecordUseType}
                  onChange={(e) => setFormData({ ...formData, RecordUseType: parseInt(e.target.value) || 1 })}
                  placeholder="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="version_id">Version *</Label>
                <Select
                  value={formData.version_id.toString()}
                  onValueChange={(value) => setFormData({ ...formData, version_id: parseInt(value) })}
                >
                  <SelectTrigger className={errors.version_id ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select a version" />
                  </SelectTrigger>
                  <SelectContent>
                    {versions.map((version) => (
                      <SelectItem key={version.id} value={version.id.toString()}>
                       {version.vendor_name} - {version.version_name} 
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.version_id && (
                  <p className="text-sm text-destructive">{errors.version_id}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={handleBack}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Client'}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default ClientEditPage;