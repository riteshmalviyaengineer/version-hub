import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchVersionDetails, createVersionDetail, updateVersionDetail, deleteVersionDetail, fetchVersionById } from '@/store/versionsSlice';
import { fetchVendors } from '@/store/vendorsSlice';
import { CreateVersionDetailPayload, VendorMappingVersionDetail } from '@/services/versionService';
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
  const [localDetails, setLocalDetails] = useState<VendorMappingVersionDetail[]>([]);
  const [newRow, setNewRow] = useState<Omit<CreateVersionDetailPayload, 'version_id'> | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [detailToDelete, setDetailToDelete] = useState<VendorMappingVersionDetail | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (versionId) {
      dispatch(fetchVersionDetails(Number(versionId)));
      // dispatch(fetchVersionById(Number(versionId)));
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

  const handleUpdateDetail = (id: number, field: keyof VendorMappingVersionDetail, value: string | number) => {
    setLocalDetails((prev) =>
      prev.map((detail) =>
        detail.vendor_system_column_id === id ? { ...detail, [field]: value } : detail
      )
    );
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    try {

      await dispatch(updateVersionDetail({
        id: versionId,
        payload: localDetails,
      })).unwrap();

      dispatch(fetchVersionDetails(Number(versionId)));

        // Find changed details and update them
        // for (const detail of localDetails) {
          // const original = versionDetails.find((d) => d.mapping_id === detail.vendor_system_column_id);
          // if (
          //   original &&
          //   (original.column_name !== detail.column_name ||
          //    original.code !== detail.code)
          // ) {
          //   await dispatch(updateVersionDetail({
          //     id: detail.vendor_system_column_id,
          //     payload: {
          //       column_name: detail.column_name,
          //       code: detail.code,
          //     },
          //   })).unwrap();
          // }
        // }
      
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

  const handleDeleteClick = (detail: VendorMappingVersionDetail) => {
    setDetailToDelete(detail);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (detailToDelete) {
      try {
        await dispatch(deleteVersionDetail(detailToDelete.vendor_system_column_id)).unwrap();
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
        title={`Version Details${selectedVersion ? ` - ${selectedVersion.version_name}` : ''} : Total Columns: ${localDetails.length}`}
        description="Configure version parameters and code"
        breadcrumbs={[
          { label: 'Vendors', path: '/vendors' },
          { label: vendor?.vendor_name || 'Vendor', path: `/vendors/${vendorId}/versions` },
          { label: selectedVersion?.version_name || 'Version' , path: `/vendors/${vendorId}/versions`},
          { label: versionId },
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
                <div className="col-span-3">DB column</div>
                <div className="col-span-2">Vendor column</div>
                <div className="col-span-7">Code</div>
                {/* <div className="col-span-1 text-right">Actions</div> */}
              </div>

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

              {/* Existing Rows */}
              {localDetails.map((detail) => (
                <div
                  key={detail.vendor_system_column_id}
                  className="grid grid-cols-12 gap-4 px-4 py-4 border-b border-border last:border-b-0 items-start animate-fade-in"
                >
                  {/* Column A: Static Label */}
                  <div className="col-span-3">
                    <div className="px-3 py-2 bg-secondary rounded-md text-sm font-medium">
                      {detail.vendor_system_column_name}
                    </div>
                  </div>

                  {/* Column B: Numeric Input */}
                  <div className="col-span-2">
                    <Input
                      type="text"
                      value={detail.column_name}
                      onChange={(e) =>
                        handleUpdateDetail(detail.vendor_system_column_id, 'column_name', e.target.value)
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
                        value={detail.code}
                        onChange={(value) =>
                          handleUpdateDetail(detail.vendor_system_column_id, 'code', value || '')
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
                  {/* <div className="col-span-1 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(detail)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div> */}
                </div>
              ))}

              
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
        description={`Are you sure you want to delete the row "${detailToDelete?.column_name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
      />
    </MainLayout>
  );
};

export default VersionDetailPage;
