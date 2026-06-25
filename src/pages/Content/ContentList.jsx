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
import Chip from '@mui/material/Chip';
import { DataGrid } from '@mui/x-data-grid';

import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DescriptionIcon from '@mui/icons-material/Description';

import { useContents } from '../../hooks/useContents';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';

const ContentList = () => {
  const navigate = useNavigate();
  const { useList, useDelete } = useContents();
  const { data: contents = [], isLoading } = useList();
  const deleteMutation = useDelete();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync({ id: deleteId });
    } catch {
      // Handled by react query.
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Content Name',
      flex: 1.4,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={600} color="text.primary">{params.value}</Typography>
          <Typography variant="caption" color="text.secondary">{params.row.slug}</Typography>
        </Box>
      ),
    },
    { field: 'level', headerName: 'Level', flex: 0.75 },
    { field: 'language', headerName: 'Language', flex: 0.8 },
    { field: 'estimatedDuration', headerName: 'Duration', flex: 0.8 },
    {
      field: 'contentType',
      headerName: 'Type',
      flex: 0.8,
      renderCell: (params) => <Chip label={params.value} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />,
    },
    {
      field: 'courseName',
      headerName: 'Course',
      flex: 1.1,
      renderCell: (params) => <Typography variant="body2" fontWeight={500}>{params.value}</Typography>,
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
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Preview Content"><IconButton size="small" onClick={() => navigate(`/content/preview/${params.row.id}`)} sx={{ color: 'info.main' }}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Edit Content"><IconButton size="small" onClick={() => navigate(`/content/edit/${params.row.id}`)} sx={{ color: 'primary.main' }}><EditIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Delete Content"><IconButton size="small" onClick={() => setDeleteId(params.row.id)} sx={{ color: 'error.main' }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
        </Box>
      ),
    },
  ];

  const filteredRows = contents.filter((row) => {
    const haystack = [row.name, row.slug, row.courseName, row.moduleName, row.submoduleName, row.contentType, row.level, row.language, row.estimatedDuration].join(' ').toLowerCase();
    const matchesSearch = haystack.includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || row.contentType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <DescriptionIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h4" fontWeight={700}>Course Materials</Typography>
            <Typography variant="body2" color="text.secondary">Optional standalone view for files mapped inside course submodules.</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} color="primary" onClick={() => navigate('/content/add')}>Add Content</Button>
      </Box>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField size="small" placeholder="Search by name, URL slug, course, level..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} sx={{ maxWidth: 380, width: '100%' }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }} />
            <TextField select size="small" label="Content Type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} sx={{ minWidth: 160 }}>
              <MenuItem value="All">All Formats</MenuItem>
              <MenuItem value="Notes">Notes</MenuItem>
              <MenuItem value="PDF">PDF</MenuItem>
              <MenuItem value="PPT">PPT</MenuItem>
              <MenuItem value="Comparison Table">Comparison Table</MenuItem>
              <MenuItem value="Video">Video</MenuItem>
            </TextField>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ height: 460, width: '100%' }}>
            <DataGrid rows={filteredRows} columns={columns} pageSize={5} rowsPerPageOptions={[5, 10, 20]} loading={isLoading} disableSelectionOnClick rowHeight={64} sx={{ border: 'none', '& .MuiDataGrid-cell:focus': { outline: 'none' } }} />
          </Box>
        </CardContent>
      </Card>

      <ConfirmDialog open={deleteId !== null} title="Delete Content Attachment?" message="Are you sure you want to delete this learning material file?" onConfirm={handleConfirmDelete} onCancel={() => setDeleteId(null)} loading={isDeleting} />
    </Box>
  );
};

export default ContentList;
