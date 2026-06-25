import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

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
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Grid from '@mui/material/Grid';

import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import SubtitlesIcon from '@mui/icons-material/Subtitles';
import DescriptionIcon from '@mui/icons-material/Description';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import VisibilityIcon from '@mui/icons-material/Visibility';

import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { useCourses } from '../../hooks/useCourses';
import { useModules } from '../../hooks/useModules';
import { useSubmodules } from '../../hooks/useSubmodules';
import { useContents } from '../../hooks/useContents';
import { useUI } from '../../context/UIContext';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import SortableItem from '../../components/SortableItem';
import { BannerPreview, MetadataChips, MetadataDetails } from '../../components/LmsMetadataSummary';
import ContentUploadDropzone from '../../components/ContentUploadDropzone';
import LmsIcon from '../../components/LmsIcon';
import { DEFAULT_BANNER_IMAGE, DEFAULT_BRAND_COLOR, LANGUAGE_OPTIONS, LEVEL_OPTIONS, slugify } from '../../utils/lmsMetadata';

const emptyStructureForm = (type = 'module') => ({
  name: '',
  description: '',
  slug: '',
  level: 'Beginner',
  language: 'English',
  estimatedDuration: '',
  brandColor: DEFAULT_BRAND_COLOR,
  bannerImage: DEFAULT_BANNER_IMAGE,
  icon: type === 'module' ? 'view_module' : 'subtitles',
});

const groupBy = (items, key) => items.reduce((acc, item) => {
  const groupKey = item[key];
  acc[groupKey] = acc[groupKey] || [];
  acc[groupKey].push(item);
  return acc;
}, {});

const sortByPosition = (items = []) => [...items].sort((a, b) => (a.position || 0) - (b.position || 0));

const CourseList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useUI();

  const { useList: useCourseList, useDelete: useCourseDelete } = useCourses();
  const { useList: useModuleList, useCreate: useModuleCreate, useUpdate: useModuleUpdate, useDelete: useModuleDelete, useReorder: useModuleReorder } = useModules();
  const { useList: useSubmoduleList, useCreate: useSubmoduleCreate, useUpdate: useSubmoduleUpdate, useDelete: useSubmoduleDelete, useReorder: useSubmoduleReorder } = useSubmodules();
  const { useList: useContentList, useDelete: useContentDelete, useReorder: useContentReorder } = useContents();

  const { data: courses = [], isLoading: isCoursesLoading } = useCourseList();
  const { data: modules = [], isLoading: isModulesLoading } = useModuleList();
  const { data: submodules = [], isLoading: isSubmodulesLoading } = useSubmoduleList();
  const { data: contents = [], isLoading: isContentsLoading } = useContentList();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', id: '', parentId: '' });
  const [structureDialog, setStructureDialog] = useState({ open: false, type: 'module', mode: 'create', parentId: '', item: null });
  const [structureForm, setStructureForm] = useState(emptyStructureForm('module'));

  const courseDeleteMutation = useCourseDelete();
  const moduleCreateMutation = useModuleCreate();
  const moduleUpdateMutation = useModuleUpdate(structureDialog.type === 'module' ? structureDialog.item?.id : undefined);
  const moduleDeleteMutation = useModuleDelete();
  const moduleReorderMutation = useModuleReorder();

  const submoduleCreateMutation = useSubmoduleCreate();
  const submoduleUpdateMutation = useSubmoduleUpdate(structureDialog.type === 'submodule' ? structureDialog.item?.id : undefined);
  const submoduleDeleteMutation = useSubmoduleDelete();
  const submoduleReorderMutation = useSubmoduleReorder();

  const contentDeleteMutation = useContentDelete();
  const contentReorderMutation = useContentReorder();

  const modulesByCourse = useMemo(() => {
    const grouped = groupBy(modules, 'courseId');
    Object.keys(grouped).forEach((key) => { grouped[key] = sortByPosition(grouped[key]); });
    return grouped;
  }, [modules]);

  const submodulesByModule = useMemo(() => {
    const grouped = groupBy(submodules, 'moduleId');
    Object.keys(grouped).forEach((key) => { grouped[key] = sortByPosition(grouped[key]); });
    return grouped;
  }, [submodules]);

  const contentsBySubmodule = useMemo(() => {
    const grouped = groupBy(contents, 'submoduleId');
    Object.keys(grouped).forEach((key) => { grouped[key] = sortByPosition(grouped[key]); });
    return grouped;
  }, [contents]);

  const filteredCourses = courses.filter((course) => {
    const nestedModules = modulesByCourse[course.id] || [];
    const nestedText = nestedModules.flatMap((mod) => {
      const nestedSubs = submodulesByModule[mod.id] || [];
      return [
        mod.name,
        mod.slug,
        ...nestedSubs.flatMap((sub) => [sub.name, sub.slug, ...(contentsBySubmodule[sub.id] || []).map((content) => `${content.name} ${content.slug}`)]),
      ];
    }).join(' ');

    const haystack = [course.name, course.slug, course.categoryName, course.description, course.level, course.language, course.estimatedDuration, nestedText].join(' ').toLowerCase();
    const matchesSearch = haystack.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const isLoading = isCoursesLoading || isModulesLoading || isSubmodulesLoading || isContentsLoading;
  const isStructureSaving = moduleCreateMutation.isPending || moduleUpdateMutation.isPending || submoduleCreateMutation.isPending || submoduleUpdateMutation.isPending;
  const isDeleting = courseDeleteMutation.isPending || moduleDeleteMutation.isPending || submoduleDeleteMutation.isPending || contentDeleteMutation.isPending;

  const openStructureDialog = (type, mode, parentId, item = null) => {
    setStructureDialog({ open: true, type, mode, parentId, item });
    setStructureForm(item ? { ...emptyStructureForm(type), ...item } : emptyStructureForm(type));
  };

  const closeStructureDialog = () => {
    setStructureDialog({ open: false, type: 'module', mode: 'create', parentId: '', item: null });
    setStructureForm(emptyStructureForm('module'));
  };

  const updateStructureField = (field, value) => {
    setStructureForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'name' && !prev.slug ? { slug: slugify(value) } : {}),
    }));
  };

  const validateStructureForm = () => {
    const requiredFields = ['name', 'slug', 'level', 'language', 'estimatedDuration'];
    const missing = requiredFields.find((field) => !String(structureForm[field] || '').trim());
    if (missing) {
      showToast('Name, integrated URL slug, level, language, and estimated duration are required.', 'error');
      return false;
    }
    return true;
  };

  const handleStructureSave = async () => {
    if (!validateStructureForm()) return;

    try {
      if (structureDialog.type === 'module') {
        const payload = { ...structureForm, courseId: structureDialog.parentId };
        if (structureDialog.mode === 'edit') {
          await moduleUpdateMutation.mutateAsync(payload);
        } else {
          await moduleCreateMutation.mutateAsync(payload);
        }
      } else {
        const payload = { ...structureForm, moduleId: structureDialog.parentId };
        if (structureDialog.mode === 'edit') {
          await submoduleUpdateMutation.mutateAsync(payload);
        } else {
          await submoduleCreateMutation.mutateAsync(payload);
        }
      }
      closeStructureDialog();
    } catch {
      // Hook toasts show service validation messages.
    }
  };

  const triggerDelete = (type, id, parentId = '') => {
    setDeleteDialog({ open: true, type, id, parentId });
  };

  const handleConfirmDelete = async () => {
    const { type, id, parentId } = deleteDialog;
    try {
      if (type === 'course') {
        await courseDeleteMutation.mutateAsync(id);
      } else if (type === 'module') {
        await moduleDeleteMutation.mutateAsync({ id, courseId: parentId });
      } else if (type === 'submodule') {
        await submoduleDeleteMutation.mutateAsync({ id, moduleId: parentId });
      } else if (type === 'content') {
        await contentDeleteMutation.mutateAsync({ id, submoduleId: parentId });
      }
    } catch {
      // Service validation errors are shown by hooks.
    } finally {
      setDeleteDialog({ open: false, type: '', id: '', parentId: '' });
    }
  };

  const patchPositions = (queryKey, orderedIds) => {
    queryClient.setQueryData(queryKey, (old = []) => old.map((item) => {
      const index = orderedIds.indexOf(item.id);
      return index >= 0 ? { ...item, position: index + 1 } : item;
    }));
  };

  const handleModuleDragEnd = (courseId) => async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const courseModules = modulesByCourse[courseId] || [];
    const oldIndex = courseModules.findIndex((item) => item.id === active.id);
    const newIndex = courseModules.findIndex((item) => item.id === over.id);
    const orderedIds = arrayMove(courseModules, oldIndex, newIndex).map((item) => item.id);

    patchPositions(['modules'], orderedIds);
    try {
      await moduleReorderMutation.mutateAsync({ orderedIds, courseId });
    } catch {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
    }
  };

  const handleSubmoduleDragEnd = (moduleId) => async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const moduleSubmodules = submodulesByModule[moduleId] || [];
    const oldIndex = moduleSubmodules.findIndex((item) => item.id === active.id);
    const newIndex = moduleSubmodules.findIndex((item) => item.id === over.id);
    const orderedIds = arrayMove(moduleSubmodules, oldIndex, newIndex).map((item) => item.id);

    patchPositions(['submodules'], orderedIds);
    try {
      await submoduleReorderMutation.mutateAsync({ orderedIds, moduleId });
    } catch {
      queryClient.invalidateQueries({ queryKey: ['submodules'] });
    }
  };

  const handleContentDragEnd = (submoduleId) => async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const submoduleContents = contentsBySubmodule[submoduleId] || [];
    const oldIndex = submoduleContents.findIndex((item) => item.id === active.id);
    const newIndex = submoduleContents.findIndex((item) => item.id === over.id);
    const orderedIds = arrayMove(submoduleContents, oldIndex, newIndex).map((item) => item.id);

    patchPositions(['contents'], orderedIds);
    try {
      await contentReorderMutation.mutateAsync({ orderedIds, submoduleId });
    } catch {
      queryClient.invalidateQueries({ queryKey: ['contents'] });
    }
  };

  const renderStructureDialog = () => (
    <Dialog open={structureDialog.open} onClose={isStructureSaving ? undefined : closeStructureDialog} fullWidth maxWidth="md">
      <DialogTitle>{structureDialog.mode === 'edit' ? 'Edit' : 'Add'} {structureDialog.type === 'module' ? 'Module' : 'Submodule'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2.5} sx={{ pt: 1 }}>
          <Grid item xs={12} sm={8}>
            <TextField label="Name" value={structureForm.name} onChange={(e) => updateStructureField('name', e.target.value)} fullWidth required />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Integrated URL Slug" value={structureForm.slug} onChange={(e) => updateStructureField('slug', e.target.value)} fullWidth required />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Description" value={structureForm.description} onChange={(e) => updateStructureField('description', e.target.value)} fullWidth multiline rows={3} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField select label="Level" value={structureForm.level} onChange={(e) => updateStructureField('level', e.target.value)} fullWidth required>
              {LEVEL_OPTIONS.map((level) => <MenuItem key={level} value={level}>{level}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField select label="Language" value={structureForm.language} onChange={(e) => updateStructureField('language', e.target.value)} fullWidth required>
              {LANGUAGE_OPTIONS.map((language) => <MenuItem key={language} value={language}>{language}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Estimated Duration" value={structureForm.estimatedDuration} onChange={(e) => updateStructureField('estimatedDuration', e.target.value)} fullWidth required />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField type="color" label="Brand Color" value={structureForm.brandColor} onChange={(e) => updateStructureField('brandColor', e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Icon" value={structureForm.icon} onChange={(e) => updateStructureField('icon', e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Banner Image URL" value={structureForm.bannerImage} onChange={(e) => updateStructureField('bannerImage', e.target.value)} fullWidth />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button color="inherit" onClick={closeStructureDialog} disabled={isStructureSaving}>Cancel</Button>
        <Button variant="contained" onClick={handleStructureSave} disabled={isStructureSaving}>
          {isStructureSaving ? <CircularProgress size={20} color="inherit" /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderContents = (course, mod, sub) => {
    const subContents = contentsBySubmodule[sub.id] || [];

    return (
      <Box sx={{ pl: { xs: 0, md: 4 }, mt: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>Contents</Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={() => navigate('/content/add', { state: { courseId: course.id, moduleId: mod.id, submoduleId: sub.id } })}>Add Content</Button>
        </Box>
        {subContents.length === 0 ? (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ py: 1.5 }}>No content added to this submodule.</Typography>
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleContentDragEnd(sub.id)}>
            <SortableContext items={subContents.map((content) => content.id)} strategy={verticalListSortingStrategy}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {subContents.map((content) => (
                  <SortableItem key={content.id} id={content.id} handle>
                    {({ attributes, listeners }) => (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, p: 1.25, borderRadius: 1, backgroundColor: 'action.hover' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                          <Box {...attributes} {...listeners} sx={{ display: 'flex', cursor: 'grab' }}><DragIndicatorIcon fontSize="small" color="action" /></Box>
                          <DescriptionIcon fontSize="small" color="secondary" />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={700} noWrap>{content.name}</Typography>
                            <MetadataChips item={content} compact />
                          </Box>
                          <Chip label={content.contentType} size="small" variant="outlined" />
                          <StatusBadge status={content.status} />
                        </Box>
                        <Box sx={{ display: 'flex', flexShrink: 0 }}>
                          <Tooltip title="Preview"><IconButton size="small" onClick={() => navigate(`/content/preview/${content.id}`)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Edit"><IconButton size="small" onClick={() => navigate(`/content/edit/${content.id}`)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => triggerDelete('content', content.id, sub.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                        </Box>
                      </Box>
                    )}
                  </SortableItem>
                ))}
              </Box>
            </SortableContext>
          </DndContext>
        )}
      </Box>
    );
  };

  const renderSubmodules = (course, mod) => {
    const moduleSubmodules = submodulesByModule[mod.id] || [];

    return (
      <Box sx={{ pl: { xs: 0, md: 3 }, mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}><SubtitlesIcon fontSize="small" color="primary" /> Submodules</Typography>
          <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => openStructureDialog('submodule', 'create', mod.id)}>Add Submodule</Button>
        </Box>
        {moduleSubmodules.length === 0 ? (
          <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 1.5, p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">No submodules yet.</Typography>
          </Box>
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleSubmoduleDragEnd(mod.id)}>
            <SortableContext items={moduleSubmodules.map((sub) => sub.id)} strategy={verticalListSortingStrategy}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {moduleSubmodules.map((sub) => (
                  <SortableItem key={sub.id} id={sub.id} handle>
                    {({ attributes, listeners }) => (
                      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 2, backgroundColor: 'background.paper' }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
                          <Box sx={{ display: 'flex', gap: 1.25, minWidth: 0 }}>
                            <Box {...attributes} {...listeners} sx={{ display: 'flex', cursor: 'grab', pt: 0.25 }}><DragIndicatorIcon color="action" /></Box>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="body2" fontWeight={800}>{sub.name}</Typography>
                              <Typography variant="caption" color="text.secondary" display="block">{sub.description || 'No description supplied.'}</Typography>
                              <Box sx={{ mt: 1 }}><MetadataChips item={sub} /></Box>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', flexShrink: 0 }}>
                            <Tooltip title="Edit Submodule"><IconButton size="small" onClick={() => openStructureDialog('submodule', 'edit', mod.id, sub)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title="Delete Submodule"><IconButton size="small" color="error" onClick={() => triggerDelete('submodule', sub.id, mod.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                          </Box>
                        </Box>
                        {renderContents(course, mod, sub)}
                      </Box>
                    )}
                  </SortableItem>
                ))}
              </Box>
            </SortableContext>
          </DndContext>
        )}
      </Box>
    );
  };

  const renderModules = (course) => {
    const courseModules = modulesByCourse[course.id] || [];

    return (
      <Box sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}><ViewModuleIcon color="primary" /> Modules</Typography>
          <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => openStructureDialog('module', 'create', course.id)}>Add Module</Button>
        </Box>
        {courseModules.length === 0 ? (
          <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 2, p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary" variant="body2">No modules created yet.</Typography>
            <Button startIcon={<AddIcon />} variant="outlined" onClick={() => openStructureDialog('module', 'create', course.id)} sx={{ mt: 1.5 }}>Add Module</Button>
          </Box>
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleModuleDragEnd(course.id)}>
            <SortableContext items={courseModules.map((mod) => mod.id)} strategy={verticalListSortingStrategy}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {courseModules.map((mod) => (
                  <SortableItem key={mod.id} id={mod.id} handle>
                    {({ attributes, listeners }) => (
                      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2.25, backgroundColor: 'background.default' }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
                          <Box sx={{ display: 'flex', gap: 1.25, minWidth: 0 }}>
                            <Box {...attributes} {...listeners} sx={{ display: 'flex', cursor: 'grab', pt: 0.25 }}><DragIndicatorIcon color="action" /></Box>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="subtitle2" fontWeight={800}>{mod.name}</Typography>
                              <Typography variant="body2" color="text.secondary">{mod.description || 'No description supplied.'}</Typography>
                              <Box sx={{ mt: 1 }}><MetadataChips item={mod} /></Box>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', flexShrink: 0 }}>
                            <Tooltip title="Edit Module"><IconButton size="small" onClick={() => openStructureDialog('module', 'edit', course.id, mod)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title="Delete Module"><IconButton size="small" color="error" onClick={() => triggerDelete('module', mod.id, course.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                          </Box>
                        </Box>
                        {renderSubmodules(course, mod)}
                      </Box>
                    )}
                  </SortableItem>
                ))}
              </Box>
            </SortableContext>
          </DndContext>
        )}
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <MenuBookIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h4" fontWeight={700}>Course Management</Typography>
            <Typography variant="body2" color="text.secondary">Manage courses, modules, submodules, and content from one hierarchy.</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} color="primary" onClick={() => navigate('/course/add')}>Add Course</Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField size="small" placeholder="Search hierarchy by name, URL slug, category, level..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} sx={{ maxWidth: 420, width: '100%' }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }} />
            <TextField select size="small" label="Course Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 150 }}>
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Box>
        </CardContent>
      </Card>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 320 }}><CircularProgress /></Box>
      ) : filteredCourses.length === 0 ? (
        <Card sx={{ borderStyle: 'dashed' }}>
          <CardContent sx={{ p: 5, textAlign: 'center' }}>
            <Typography variant="h6" fontWeight={700}>No courses found</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Create a course or adjust the current filters.</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/course/add')} sx={{ mt: 2 }}>Add Course</Button>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredCourses.map((course) => (
            <Accordion key={course.id} disableGutters sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 3, py: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 2, pr: 2 }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <LmsIcon item={course} size={38} />
                      <Typography variant="h6" fontWeight={800}>{course.name}</Typography>
                      <Chip label={course.categoryName} size="small" color="secondary" />
                      <StatusBadge status={course.status} />
                    </Box>
                    <Box sx={{ mt: 1 }}><MetadataChips item={course} /></Box>
                  </Box>
                  <Box onClick={(e) => e.stopPropagation()} sx={{ display: 'flex', flexShrink: 0 }}>
                    <Tooltip title="Edit Course"><IconButton size="small" onClick={() => navigate(`/course/edit/${course.id}`)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Delete Course"><IconButton size="small" color="error" onClick={() => triggerDelete('course', course.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <BannerPreview item={course} height={150} />
                  </Grid>
                  <Grid item xs={12} md={9}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{course.description || 'No course description supplied.'}</Typography>
                    <MetadataDetails item={course} />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 3 }}>
                  <ContentUploadDropzone
                    title="Drop course content files"
                    description="Choose the target module and submodule, then drop PDF, PPT, MP4, DOCX, or image files."
                    courses={courses}
                    modules={modules}
                    submodules={submodules}
                    fixedCourseId={course.id}
                    compact
                  />
                </Box>
                <Divider sx={{ my: 3 }} />
                {renderModules(course)}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {renderStructureDialog()}

      <ConfirmDialog
        open={deleteDialog.open}
        title={`Delete ${deleteDialog.type || 'item'}?`}
        message="This action respects LMS hierarchy rules. Delete child records first if the service reports dependencies."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialog({ open: false, type: '', id: '', parentId: '' })}
        loading={isDeleting}
      />
    </Box>
  );
};

export default CourseList;
