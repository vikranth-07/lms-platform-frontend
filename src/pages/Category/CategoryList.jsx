import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { DataGrid } from '@mui/x-data-grid';

import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import UploadFileIcon from '@mui/icons-material/UploadFile';

import { useCategories } from '../../hooks/useCategories';
import { useCourses } from '../../hooks/useCourses';
import { useModules } from '../../hooks/useModules';
import { useSubmodules } from '../../hooks/useSubmodules';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import { BrandSwatch } from '../../components/LmsMetadataSummary';
import ContentUploadDropzone from '../../components/ContentUploadDropzone';

const CategoryList = () => {
  const navigate = useNavigate();
  const { useList, useDelete } = useCategories();
  const { useList: useCourseList } = useCourses();
  const { useList: useModuleList } = useModules();
  const { useList: useSubmoduleList } = useSubmodules();
  const { data: categories = [], isLoading } = useList();
  const { data: courses = [] } = useCourseList();
  const { data: modules = [] } = useModuleList();
  const { data: submodules = [] } = useSubmoduleList();
  const deleteMutation = useDelete();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deleteId, setDeleteId] = useState(null);
  const [uploadCategoryId, setUploadCategoryId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const uploadCategory = categories.find((category) => category.id === uploadCategoryId);

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(deleteId);
    } catch {
      // Toast handles error.
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Category Name',
      flex: 1.4,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={600} color="text.primary">{params.value}</Typography>
          <Typography variant="caption" color="text.secondary">{params.row.slug}</Typography>
        </Box>
      ),
    },
    { field: 'level', headerName: 'Level', flex: 0.8 },
    { field: 'language', headerName: 'Language', flex: 0.8 },
    { field: 'estimatedDuration', headerName: 'Duration', flex: 0.9 },
    {
      field: 'brandColor',
      headerName: 'Brand',
      flex: 0.6,
      sortable: false,
      renderCell: (params) => <BrandSwatch color={params.value} />,
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.8,
      renderCell: (params) => <StatusBadge status={params.value} />,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Upload Content">
            <IconButton size="small" onClick={() => setUploadCategoryId(params.row.id)} sx={{ color: 'secondary.main' }}>
              <UploadFileIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Category">
            <IconButton size="small" onClick={() => navigate(`/category/edit/${params.row.id}`)} sx={{ color: 'primary.main' }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Category">
            <IconButton size="small" onClick={() => setDeleteId(params.row.id)} sx={{ color: 'error.main' }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const filteredRows = categories.filter((row) => {
    const haystack = [row.name, row.slug, row.description, row.level, row.language, row.estimatedDuration].join(' ').toLowerCase();
    const matchesSearch = haystack.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || row.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <FolderIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h4" fontWeight={700}>Categories</Typography>
            <Typography variant="body2" color="text.secondary">Configure LMS groupings and catalog metadata.</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} color="primary" onClick={() => navigate('/category/add')}>Add Category</Button>
      </Box>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search by name, URL slug, level, language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ maxWidth: 360, width: '100%' }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
            />
            <TextField select size="small" label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 140 }}>
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ height: 440, width: '100%' }}>
            <DataGrid rows={filteredRows} columns={columns} pageSize={5} rowsPerPageOptions={[5, 10, 20]} loading={isLoading} disableSelectionOnClick rowHeight={64} sx={{ border: 'none', '& .MuiDataGrid-cell:focus': { outline: 'none' } }} />
          </Box>
        </CardContent>
      </Card>

      <ConfirmDialog open={deleteId !== null} title="Delete Category?" message="This category can only be deleted when it has no courses attached." onConfirm={handleConfirmDelete} onCancel={() => setDeleteId(null)} loading={isDeleting} />

      <Dialog open={Boolean(uploadCategoryId)} onClose={() => setUploadCategoryId(null)} fullWidth maxWidth="md">
        <DialogTitle>Upload Content to {uploadCategory?.name || 'Category'}</DialogTitle>
        <DialogContent dividers>
          <ContentUploadDropzone
            title="Drop files into this category"
            description="Choose a course, module, and submodule in this category, then drop PDF, PPT, MP4, DOCX, or image files."
            courses={courses}
            modules={modules}
            submodules={submodules}
            fixedCategoryId={uploadCategoryId || ''}
          />
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setUploadCategoryId(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryList;
