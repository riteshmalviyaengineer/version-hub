import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchColumns, deleteColumn, createColumn, updateColumn } from '@/store/columnsSlice';
import { Column, CreateColumnPayload } from '@/services/columnService';
import MainLayout from '@/layouts/MainLayout';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import ColumnFormModal from '@/features/columns/ColumnFormModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const ColumnListingPage = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { columns, loading, error } = useAppSelector((state) => state.columns);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<Column | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchColumns());
  }, [dispatch]);

  const handleCreateColumn = () => {
    setEditingColumn(null);
    setIsFormOpen(true);
  };

  const handleEditColumn = (column: Column) => {
    setEditingColumn(column);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (column: Column) => {
    setColumnToDelete(column);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (columnToDelete) {
      try {
        await dispatch(deleteColumn(columnToDelete.id)).unwrap();
        toast({
          title: 'Column deleted',
          description: `${columnToDelete.column_name} has been deleted successfully.`,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete column. Please try again.',
          variant: 'destructive',
        });
      }
    }
    setDeleteConfirmOpen(false);
    setColumnToDelete(null);
  };

  const handleFormSubmit = async (data: CreateColumnPayload) => {
    try {
      if (editingColumn) {
        await dispatch(updateColumn({ id: editingColumn.id, payload: data })).unwrap();
        toast({
          title: 'Column updated',
          description: `${data.column_name} has been updated successfully.`,
        });
      } else {
        await dispatch(createColumn(data)).unwrap();
        toast({
          title: 'Column created',
          description: `${data.column_name} has been created successfully.`,
        });
      }
      dispatch(fetchColumns());
      setIsFormOpen(false);
      setEditingColumn(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${editingColumn ? 'update' : 'create'} column. Please try again.`,
        variant: 'destructive',
      });
    }
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

  // Filter columns based on search term
  const filteredColumns = columns.filter(column =>
    column.column_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <PageHeader
        title="System Columns"
        description="Manage your system columns"
        breadcrumbs={[{ label: 'System Columns' }]}
        actions={
          <Button onClick={handleCreateColumn} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Column
          </Button>
        }
      />

      <div className="p-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search columns by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading && columns.length === 0 ? (
          <LoadingSpinner text="Loading columns..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={() => dispatch(fetchColumns())} />
        ) : filteredColumns.length === 0 ? (
          <EmptyState
            title={searchTerm ? "No columns found" : "No columns yet"}
            description={searchTerm ? `No columns match "${searchTerm}". Try a different search term.` : "Get started by creating your first system column."}
            action={
              <Button onClick={handleCreateColumn} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Column
              </Button>
            }
          />
        ) : (
          <div className="bg-card rounded-lg border border-border overflow-hidden animate-fade-in">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Column Name</th>
                  <th>Created At</th>
                  <th className="w-32 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredColumns.map((column) => (
                  <tr key={column.id} className="group">
                    <td>
                      <span className="font-medium">
                        {column.column_name}
                      </span>
                    </td>
                    <td className="text-muted-foreground">{formatDate(column.created_at)}</td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditColumn(column)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(column)}
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

      {/* Create/Edit Column Modal */}
      <ColumnFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingColumn(null);
        }}
        onSubmit={handleFormSubmit}
        column={editingColumn}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Column"
        description={`Are you sure you want to delete "${columnToDelete?.column_name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
      />
    </MainLayout>
  );
};

export default ColumnListingPage;