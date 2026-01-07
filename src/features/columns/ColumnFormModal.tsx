import { useState, useEffect } from 'react';
import { Column, CreateColumnPayload } from '@/services/columnService';
import Modal from '@/components/shared/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ColumnFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateColumnPayload) => void;
  column?: Column | null;
}

const ColumnFormModal = ({ isOpen, onClose, onSubmit, column }: ColumnFormModalProps) => {
  const [formData, setFormData] = useState<CreateColumnPayload>({
    column_name: '',
  });
  const [errors, setErrors] = useState<Partial<CreateColumnPayload>>({});

  // Reset form when modal opens/closes or column changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        column_name: column?.column_name || '',
      });
      setErrors({});
    }
  }, [isOpen, column]);

  const validate = (): boolean => {
    const newErrors: Partial<CreateColumnPayload> = {};

    if (!formData.column_name.trim()) {
      newErrors.column_name = 'Column name is required';
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
      title={column ? 'Edit Column' : 'Create Column'}
      description={column ? 'Update column details' : 'Add a new system column'}
      footer={
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {column ? 'Update' : 'Create'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="column_name">Column Name</Label>
          <Input
            id="column_name"
            value={formData.column_name}
            onChange={(e) => setFormData({ ...formData, column_name: e.target.value })}
            placeholder="Enter column name"
            className={errors.column_name ? 'border-destructive' : ''}
          />
          {errors.column_name && (
            <p className="text-sm text-destructive">{errors.column_name}</p>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default ColumnFormModal;