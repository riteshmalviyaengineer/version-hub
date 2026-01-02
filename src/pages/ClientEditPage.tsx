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
    agencynameabbrv: '',
    agencynamelong: '',
    agencynameshort: '',
    agencystate: '',
    alias1: '',
    alias2: '',
    esri_global_id: '',
    fdid: '',
    geom: '',
    inctypestandard: 1,
    latitude: '',
    longitude: '',
    plugugly_uuid: '',
    pluguglyfdid: '',
    sourcekey1: '',
    sourcekey2: '',
    sourcekey3: '',
    sourcetype: '',
    version_id: 0,
    workflow_route: '',
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
          agencynameabbrv: foundClient.agencynameabbrv,
          agencynamelong: foundClient.agencynamelong,
          agencynameshort: foundClient.agencynameshort,
          agencystate: foundClient.agencystate,
          alias1: foundClient.alias1,
          alias2: foundClient.alias2,
          esri_global_id: foundClient.esri_global_id || '',
          fdid: foundClient.fdid,
          geom: foundClient.geom,
          inctypestandard: foundClient.inctypestandard,
          latitude: foundClient.latitude,
          longitude: foundClient.longitude,
          plugugly_uuid: foundClient.plugugly_uuid,
          pluguglyfdid: foundClient.pluguglyfdid,
          sourcekey1: foundClient.sourcekey1,
          sourcekey2: foundClient.sourcekey2 || '',
          sourcekey3: foundClient.sourcekey3 || '',
          sourcetype: foundClient.sourcetype,
          version_id: foundClient.version_id,
          workflow_route: foundClient.workflow_route || '',
        });
      } else {
        navigate('/clients');
      }
    }
  }, [clients, id, navigate]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof UpdateClientPayload, string>> = {};

    if (!formData.agencynamelong.trim()) {
      newErrors.agencynamelong = 'Agency name long is required';
    }

    if (!formData.pluguglyfdid.trim()) {
      newErrors.pluguglyfdid = 'PlugUgly FDID is required';
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
          description: `${formData.agencynamelong} has been updated successfully.`,
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
                <Label htmlFor="agencynamelong">Agency Name Long *</Label>
                <Input
                  id="agencynamelong"
                  value={formData.agencynamelong}
                  onChange={(e) => setFormData({ ...formData, agencynamelong: e.target.value })}
                  placeholder="Fire Department of Example City"
                  className={errors.agencynamelong ? 'border-destructive' : ''}
                />
                {errors.agencynamelong && (
                  <p className="text-sm text-destructive">{errors.agencynamelong}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="agencynameshort">Agency Name Short</Label>
                <Input
                  id="agencynameshort"
                  value={formData.agencynameshort}
                  onChange={(e) => setFormData({ ...formData, agencynameshort: e.target.value })}
                  placeholder="FDEC"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agencynameabbrv">Agency Name Abbrv</Label>
                <Input
                  id="agencynameabbrv"
                  value={formData.agencynameabbrv}
                  onChange={(e) => setFormData({ ...formData, agencynameabbrv: e.target.value })}
                  placeholder="FDEC"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agencystate">Agency State</Label>
                <Input
                  id="agencystate"
                  value={formData.agencystate}
                  onChange={(e) => setFormData({ ...formData, agencystate: e.target.value })}
                  placeholder="MI"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fdid">FDID</Label>
                <Input
                  id="fdid"
                  value={formData.fdid}
                  onChange={(e) => setFormData({ ...formData, fdid: e.target.value })}
                  placeholder="04601"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pluguglyfdid">PlugUgly FDID *</Label>
                <Input
                  id="pluguglyfdid"
                  value={formData.pluguglyfdid}
                  onChange={(e) => setFormData({ ...formData, pluguglyfdid: e.target.value })}
                  placeholder="MI-04601"
                  className={errors.pluguglyfdid ? 'border-destructive' : ''}
                />
                {errors.pluguglyfdid && (
                  <p className="text-sm text-destructive">{errors.pluguglyfdid}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold mb-4">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  placeholder="42.3314"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  placeholder="-83.0458"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="geom">Geometry</Label>
                <Input
                  id="geom"
                  value={formData.geom}
                  onChange={(e) => setFormData({ ...formData, geom: e.target.value })}
                  placeholder="POINT(-83.0458 42.3314)"
                />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold mb-4">Aliases</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="alias1">Alias 1</Label>
                <Input
                  id="alias1"
                  value={formData.alias1}
                  onChange={(e) => setFormData({ ...formData, alias1: e.target.value })}
                  placeholder="Example Fire"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alias2">Alias 2</Label>
                <Input
                  id="alias2"
                  value={formData.alias2}
                  onChange={(e) => setFormData({ ...formData, alias2: e.target.value })}
                  placeholder="City Fire"
                />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold mb-4">Source Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sourcetype">Source Type</Label>
                <Input
                  id="sourcetype"
                  value={formData.sourcetype}
                  onChange={(e) => setFormData({ ...formData, sourcetype: e.target.value })}
                  placeholder="firstdue"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sourcekey1">Source Key 1</Label>
                <Input
                  id="sourcekey1"
                  value={formData.sourcekey1}
                  onChange={(e) => setFormData({ ...formData, sourcekey1: e.target.value })}
                  placeholder="key1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sourcekey2">Source Key 2</Label>
                <Input
                  id="sourcekey2"
                  value={formData.sourcekey2}
                  onChange={(e) => setFormData({ ...formData, sourcekey2: e.target.value })}
                  placeholder="key2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sourcekey3">Source Key 3</Label>
                <Input
                  id="sourcekey3"
                  value={formData.sourcekey3}
                  onChange={(e) => setFormData({ ...formData, sourcekey3: e.target.value })}
                  placeholder="key3"
                />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="esri_global_id">ESRI Global ID</Label>
                <Input
                  id="esri_global_id"
                  value={formData.esri_global_id}
                  onChange={(e) => setFormData({ ...formData, esri_global_id: e.target.value })}
                  placeholder="abc123"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plugugly_uuid">PlugUgly UUID</Label>
                <Input
                  id="plugugly_uuid"
                  value={formData.plugugly_uuid}
                  onChange={(e) => setFormData({ ...formData, plugugly_uuid: e.target.value })}
                  placeholder="550e8400-e29b-41d4-a716-446655440000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inctypestandard">Incident Type Standard</Label>
                <Input
                  id="inctypestandard"
                  type="number"
                  value={formData.inctypestandard}
                  onChange={(e) => setFormData({ ...formData, inctypestandard: parseInt(e.target.value) || 1 })}
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

              <div className="space-y-2">
                <Label htmlFor="workflow_route">Workflow Route</Label>
                <Input
                  id="workflow_route"
                  value={formData.workflow_route}
                  onChange={(e) => setFormData({ ...formData, workflow_route: e.target.value })}
                  placeholder="/route1"
                />
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