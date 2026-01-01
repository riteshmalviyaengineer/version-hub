import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { createClient, fetchVersions } from '@/store/clientsSlice';
import { CreateClientPayload, VersionOption } from '@/services/clientService';
import MainLayout from '@/layouts/MainLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

const ClientCreatePage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { versions } = useAppSelector((state) => state.clients);

  const [formData, setFormData] = useState<CreateClientPayload>({
    AKA: '',
    AgencyFDID: '',
    AgencyNameLong: '',
    AgencyNameShort: '',
    AgencyState: '',
    AgencyTimeZone: '',
    CADLinkField: '',
    DataSource: '',
    IncTypeStandard: 1,
    PlugUglyFDID: '',
    RMSLinkField: '',
    RecordCustomerID: '',
    RecordUseType: 1,
    RespectDST: 1,
    SourceProviderID: '',
    UpsertMatchingField: '',
    version_id: 0,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateClientPayload, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch versions when component mounts
  useEffect(() => {
    if (versions.length === 0) {
      dispatch(fetchVersions());
    }
  }, [versions.length, dispatch]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateClientPayload, string>> = {};

    if (!formData.AgencyNameLong.trim()) {
      newErrors.AgencyNameLong = 'Agency name is required';
    }

    if (!formData.PlugUglyFDID.trim()) {
      newErrors.PlugUglyFDID = 'PlugUgly FDID is required';
    }

    if (!formData.AgencyFDID.trim()) {
      newErrors.AgencyFDID = 'Agency FDID is required';
    }

    if (formData.version_id === 0) {
      newErrors.version_id = 'Version is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      try {
        await dispatch(createClient(formData)).unwrap();
        toast({
          title: 'Client created',
          description: `${formData.AgencyNameLong} has been created successfully.`,
        });
        navigate('/clients');
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to create client. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    navigate('/clients');
  };

  return (
    <MainLayout>
      <PageHeader
        title="Create Client"
        description="Add a new client to your catalog"
        breadcrumbs={[
          { label: 'Clients', path: '/clients' },
          { label: 'Create' }
        ]}
        actions={
          <Button variant="outline" onClick={handleBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Clients
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
                <Label htmlFor="AgencyNameShort">Agency Name Short</Label>
                <Input
                  id="AgencyNameShort"
                  value={formData.AgencyNameShort}
                  onChange={(e) => setFormData({ ...formData, AgencyNameShort: e.target.value })}
                  placeholder="FDEC"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="AKA">AKA</Label>
                <Input
                  id="AKA"
                  value={formData.AKA}
                  onChange={(e) => setFormData({ ...formData, AKA: e.target.value })}
                  placeholder="Example Fire"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="AgencyFDID">Agency FDID *</Label>
                <Input
                  id="AgencyFDID"
                  value={formData.AgencyFDID}
                  onChange={(e) => setFormData({ ...formData, AgencyFDID: e.target.value })}
                  placeholder="04601"
                  className={errors.AgencyFDID ? 'border-destructive' : ''}
                />
                {errors.AgencyFDID && (
                  <p className="text-sm text-destructive">{errors.AgencyFDID}</p>
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
                <Label htmlFor="AgencyState">Agency State</Label>
                <Input
                  id="AgencyState"
                  value={formData.AgencyState}
                  onChange={(e) => setFormData({ ...formData, AgencyState: e.target.value })}
                  placeholder="MI"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="AgencyTimeZone">Agency Time Zone</Label>
                <Input
                  id="AgencyTimeZone"
                  value={formData.AgencyTimeZone}
                  onChange={(e) => setFormData({ ...formData, AgencyTimeZone: e.target.value })}
                  placeholder="America/New_York"
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
                        {version.version_name} ({version.version_code})
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

          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold mb-4">Data Integration Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="CADLinkField">CAD Link Field</Label>
                <Input
                  id="CADLinkField"
                  value={formData.CADLinkField}
                  onChange={(e) => setFormData({ ...formData, CADLinkField: e.target.value })}
                  placeholder="CAD123"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="RMSLinkField">RMS Link Field</Label>
                <Input
                  id="RMSLinkField"
                  value={formData.RMSLinkField}
                  onChange={(e) => setFormData({ ...formData, RMSLinkField: e.target.value })}
                  placeholder="RMS456"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="RecordCustomerID">Record Customer ID</Label>
                <Input
                  id="RecordCustomerID"
                  value={formData.RecordCustomerID}
                  onChange={(e) => setFormData({ ...formData, RecordCustomerID: e.target.value })}
                  placeholder="CUST001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="SourceProviderID">Source Provider ID</Label>
                <Input
                  id="SourceProviderID"
                  value={formData.SourceProviderID}
                  onChange={(e) => setFormData({ ...formData, SourceProviderID: e.target.value })}
                  placeholder="PROV001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="UpsertMatchingField">Upsert Matching Field</Label>
                <Input
                  id="UpsertMatchingField"
                  value={formData.UpsertMatchingField}
                  onChange={(e) => setFormData({ ...formData, UpsertMatchingField: e.target.value })}
                  placeholder="IncidentNumber"
                />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold mb-4">Configuration Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="IncTypeStandard">Inc Type Standard</Label>
                <Input
                  id="IncTypeStandard"
                  type="number"
                  value={formData.IncTypeStandard}
                  onChange={(e) => setFormData({ ...formData, IncTypeStandard: parseInt(e.target.value) || 1 })}
                  placeholder="1"
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
                <Label htmlFor="RespectDST">Respect DST</Label>
                <Input
                  id="RespectDST"
                  type="number"
                  value={formData.RespectDST}
                  onChange={(e) => setFormData({ ...formData, RespectDST: parseInt(e.target.value) || 1 })}
                  placeholder="1"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={handleBack}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Client'}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default ClientCreatePage;