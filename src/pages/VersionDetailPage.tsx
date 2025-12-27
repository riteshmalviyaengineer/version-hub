import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchVersionDetails, createVersionDetail, updateVersionDetail, deleteVersionDetail, fetchVersionById } from '@/store/versionsSlice';
import { fetchVendors } from '@/store/vendorsSlice';
import { VersionDetail, CreateVersionDetailPayload } from '@/services/versionService';
import MainLayout from '@/layouts/MainLayout';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const VersionDetailPage = () => {
  const { vendorId, versionId } = useParams<{ vendorId: string; versionId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const { versionDetails, detailsLoading, selectedVersion } = useAppSelector((state) => state.versions);
  const { vendors } = useAppSelector((state) => state.vendors);
  
  const vendor = vendors.find((v) => v.id === Number(vendorId));

  // Local state for editing
  const [localDetails, setLocalDetails] = useState<VersionDetail[]>([]);
  const [newRow, setNewRow] = useState<Omit<CreateVersionDetailPayload, 'version_id'> | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [detailToDelete, setDetailToDelete] = useState<VersionDetail | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (versionId) {
      dispatch(fetchVersionDetails(Number(versionId)));
      dispatch(fetchVersionById(Number(versionId)));
      if (vendors.length === 0) {
        dispatch(fetchVendors());
      }
    }
  }, [dispatch, versionId, vendors.length]);

  useEffect(() => {
    setLocalDetails(versionDetails);
  }, [versionDetails]);

  const handleAddRow = () => {
    setNewRow({
      label: '',
      numeric_value: 0,
      code_content: '# Enter your Python code here\n',
    });
  };

  const handleSaveNewRow = async () => {
    if (!newRow) return;
    
    if (!newRow.label.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Label is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      await dispatch(createVersionDetail({
        ...newRow,
        version_id: Number(versionId),
      })).unwrap();
      
      toast({
        title: 'Row added',
        description: 'New detail row has been added successfully.',
      });
      setNewRow(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add row. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateDetail = (id: number, field: keyof VersionDetail, value: string | number) => {
    setLocalDetails((prev) =>
      prev.map((detail) =>
        detail.id === id ? { ...detail, [field]: value } : detail
      )
    );
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    try {
      // Find changed details and update them
      for (const detail of localDetails) {
        const original = versionDetails.find((d) => d.id === detail.id);
        if (
          original &&
          (original.numeric_value !== detail.numeric_value ||
           original.code_content !== detail.code_content)
        ) {
          await dispatch(updateVersionDetail({
            id: detail.id,
            payload: {
              numeric_value: detail.numeric_value,
              code_content: detail.code_content,
            },
          })).unwrap();
        }
      }
      
      toast({
        title: 'Changes saved',
        description: 'All changes have been saved successfully.',
      });
      setHasChanges(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save changes. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = (detail: VersionDetail) => {
    setDetailToDelete(detail);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (detailToDelete) {
      try {
        await dispatch(deleteVersionDetail(detailToDelete.id)).unwrap();
        toast({
          title: 'Row deleted',
          description: 'Detail row has been deleted successfully.',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete row. Please try again.',
          variant: 'destructive',
        });
      }
    }
    setDeleteConfirmOpen(false);
    setDetailToDelete(null);
  };

  return (
    <MainLayout>
      <PageHeader
        title={`Version Details${selectedVersion ? ` - ${selectedVersion.version_name}` : ''}`}
        description="Configure version parameters and code"
        breadcrumbs={[
          { label: 'Vendors', path: '/vendors' },
          { label: vendor?.vendor_name || 'Vendor', path: `/vendors/${vendorId}/versions` },
          { label: selectedVersion?.version_name || 'Version' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/vendors/${vendorId}/versions`)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            {hasChanges && (
              <Button onClick={handleSaveChanges} className="gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            )}
            <Button onClick={handleAddRow} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Row
            </Button>
          </div>
        }
      />

      <div className="p-6">
        {detailsLoading && localDetails.length === 0 ? (
          <LoadingSpinner text="Loading version details..." />
        ) : localDetails.length === 0 && !newRow ? (
          <EmptyState
            title="No configuration rows"
            description="Add configuration rows to define version parameters and code."
            action={
              <Button onClick={handleAddRow} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Row
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {/* Table Header */}
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="grid grid-cols-12 gap-4 bg-table-header px-4 py-3 text-sm font-medium text-muted-foreground border-b border-border">
                <div className="col-span-2">Label</div>
                <div className="col-span-2">Numeric Value</div>
                <div className="col-span-7">Code Content</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>

              {/* Existing Rows */}
              {localDetails.map((detail) => (
                <div
                  key={detail.id}
                  className="grid grid-cols-12 gap-4 px-4 py-4 border-b border-border last:border-b-0 items-start animate-fade-in"
                >
                  {/* Column A: Static Label */}
                  <div className="col-span-2">
                    <div className="px-3 py-2 bg-secondary rounded-md text-sm font-medium">
                      {detail.label}
                    </div>
                  </div>

                  {/* Column B: Numeric Input */}
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={detail.numeric_value}
                      onChange={(e) =>
                        handleUpdateDetail(detail.id, 'numeric_value', Number(e.target.value))
                      }
                      className="font-mono"
                    />
                  </div>

                  {/* Column C: Code Editor */}
                  <div className="col-span-7">
                    <div className="code-editor-container h-48">
                      <Editor
                        height="100%"
                        language="python"
                        theme="vs-dark"
                        value={detail.code_content}
                        onChange={(value) =>
                          handleUpdateDetail(detail.id, 'code_content', value || '')
                        }
                        options={{
                          minimap: { enabled: false },
                          fontSize: 13,
                          lineNumbers: 'on',
                          scrollBeyondLastLine: false,
                          wordWrap: 'on',
                          padding: { top: 8, bottom: 8 },
                        }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(detail)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* New Row Form */}
              {newRow && (
                <div className="grid grid-cols-12 gap-4 px-4 py-4 border-b border-border bg-accent/30 animate-fade-in">
                  {/* Column A: Label Input */}
                  <div className="col-span-2">
                    <Input
                      value={newRow.label}
                      onChange={(e) => setNewRow({ ...newRow, label: e.target.value })}
                      placeholder="Label"
                    />
                  </div>

                  {/* Column B: Numeric Input */}
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={newRow.numeric_value}
                      onChange={(e) =>
                        setNewRow({ ...newRow, numeric_value: Number(e.target.value) })
                      }
                      placeholder="0"
                      className="font-mono"
                    />
                  </div>

                  {/* Column C: Code Editor */}
                  <div className="col-span-7">
                    <div className="code-editor-container h-48">
                      <Editor
                        height="100%"
                        language="python"
                        theme="vs-dark"
                        value={newRow.code_content}
                        onChange={(value) =>
                          setNewRow({ ...newRow, code_content: value || '' })
                        }
                        options={{
                          minimap: { enabled: false },
                          fontSize: 13,
                          lineNumbers: 'on',
                          scrollBeyondLastLine: false,
                          wordWrap: 'on',
                          padding: { top: 8, bottom: 8 },
                        }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex flex-col gap-2">
                    <Button size="sm" onClick={handleSaveNewRow}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setNewRow(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Row"
        description={`Are you sure you want to delete the row "${detailToDelete?.label}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
      />
    </MainLayout>
  );
};

export default VersionDetailPage;
