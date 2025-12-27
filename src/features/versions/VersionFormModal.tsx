import { useState, useEffect } from 'react';
import { Version, CreateVersionPayload } from '@/services/versionService';
import Modal from '@/components/shared/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface VersionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<CreateVersionPayload, 'vendor_id'>) => void;
  version?: Version | null;
}

const VersionFormModal = ({ isOpen, onClose, onSubmit, version }: VersionFormModalProps) => {
  const [formData, setFormData] = useState({
    version_name: '',
    version_code: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes or version changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        version_name: version?.version_name || '',
        version_code: version?.version_code || '',
      });
      setErrors({});
    }
  }, [isOpen, version]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.version_name.trim()) {
      newErrors.version_name = 'Version name is required';
    }
    
    if (!formData.version_code.trim()) {
      newErrors.version_code = 'Version code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={version ? 'Edit Version' : 'Create Version'}
      description={version ? 'Update version details' : 'Add a new version to this vendor'}
      footer={
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {version ? 'Update' : 'Create'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="version_name">Version Name</Label>
          <Input
            id="version_name"
            value={formData.version_name}
            onChange={(e) => setFormData({ ...formData, version_name: e.target.value })}
            placeholder="e.g., v1.0.0"
            className={errors.version_name ? 'border-destructive' : ''}
          />
          {errors.version_name && (
            <p className="text-sm text-destructive">{errors.version_name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="version_code">Version Code</Label>
          <Input
            id="version_code"
            value={formData.version_code}
            onChange={(e) => setFormData({ ...formData, version_code: e.target.value })}
            placeholder="e.g., V100"
            className={errors.version_code ? 'border-destructive' : ''}
          />
          {errors.version_code && (
            <p className="text-sm text-destructive">{errors.version_code}</p>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default VersionFormModal;
