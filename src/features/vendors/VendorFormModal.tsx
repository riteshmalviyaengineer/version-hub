import { useState, useEffect } from 'react';
import { Vendor, CreateVendorPayload } from '@/services/vendorService';
import Modal from '@/components/shared/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface VendorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateVendorPayload) => void;
  vendor?: Vendor | null;
}

const VendorFormModal = ({ isOpen, onClose, onSubmit, vendor }: VendorFormModalProps) => {
  const [formData, setFormData] = useState<CreateVendorPayload>({
    vendor_name: '',
    vendor_code: '',
  });
  const [errors, setErrors] = useState<Partial<CreateVendorPayload>>({});

  // Reset form when modal opens/closes or vendor changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        vendor_name: vendor?.vendor_name || '',
        vendor_code: vendor?.vendor_code || '',
      });
      setErrors({});
    }
  }, [isOpen, vendor]);

  const validate = (): boolean => {
    const newErrors: Partial<CreateVendorPayload> = {};
    
    if (!formData.vendor_name.trim()) {
      newErrors.vendor_name = 'Vendor name is required';
    }
    
    if (!formData.vendor_code.trim()) {
      newErrors.vendor_code = 'Vendor code is required';
    } else if (!/^[A-Z0-9]+$/i.test(formData.vendor_code)) {
      newErrors.vendor_code = 'Vendor code must be alphanumeric';
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
      title={vendor ? 'Edit Vendor' : 'Create Vendor'}
      description={vendor ? 'Update vendor details' : 'Add a new vendor to your catalog'}
      footer={
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {vendor ? 'Update' : 'Create'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="vendor_name">Vendor Name</Label>
          <Input
            id="vendor_name"
            value={formData.vendor_name}
            onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
            placeholder="Enter vendor name"
            className={errors.vendor_name ? 'border-destructive' : ''}
          />
          {errors.vendor_name && (
            <p className="text-sm text-destructive">{errors.vendor_name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="vendor_code">Vendor Code</Label>
          <Input
            id="vendor_code"
            value={formData.vendor_code}
            onChange={(e) => setFormData({ ...formData, vendor_code: e.target.value.toUpperCase() })}
            placeholder="e.g., ACME001"
            className={errors.vendor_code ? 'border-destructive' : ''}
          />
          {errors.vendor_code && (
            <p className="text-sm text-destructive">{errors.vendor_code}</p>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default VendorFormModal;
