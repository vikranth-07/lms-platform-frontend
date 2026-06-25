import React, { useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import FileUpload from './FileUpload';
import { useContents } from '../hooks/useContents';
import { useUI } from '../context/UIContext';
import { slugify } from '../utils/lmsMetadata';

const getContentType = (fileName = '') => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  if (extension === 'pdf') return 'PDF';
  if (extension === 'ppt' || extension === 'pptx') return 'PPT';
  if (extension === 'mp4') return 'Video';
  return 'Notes';
};

const getDisplayName = (fileName = '') => fileName.split('.').slice(0, -1).join('.') || fileName;

const ContentUploadDropzone = ({
  title = 'Drop content files',
  description = 'Upload PDF, PPT, MP4, DOCX, and image files into the selected submodule.',
  courses = [],
  modules = [],
  submodules = [],
  fixedCategoryId = '',
  fixedCourseId = '',
  fixedModuleId = '',
  fixedSubmoduleId = '',
  compact = false,
}) => {
  const { useCreate } = useContents();
  const createMutation = useCreate();
  const { showToast } = useUI();

  const [selectedCourseId, setSelectedCourseId] = useState(fixedCourseId);
  const [selectedModuleId, setSelectedModuleId] = useState(fixedModuleId);
  const [selectedSubmoduleId, setSelectedSubmoduleId] = useState(fixedSubmoduleId);
  const processedFileNamesRef = useRef(new Set());

  const availableCourses = useMemo(
    () => fixedCategoryId ? courses.filter((course) => course.categoryId === fixedCategoryId) : courses,
    [courses, fixedCategoryId]
  );

  const availableModules = useMemo(
    () => modules.filter((module) => module.courseId === (fixedCourseId || selectedCourseId)),
    [modules, fixedCourseId, selectedCourseId]
  );

  const availableSubmodules = useMemo(
    () => submodules.filter((submodule) => submodule.moduleId === (fixedModuleId || selectedModuleId)),
    [submodules, fixedModuleId, selectedModuleId]
  );

  const targetCourseId = fixedCourseId || selectedCourseId;
  const targetModuleId = fixedModuleId || selectedModuleId;
  const targetSubmoduleId = fixedSubmoduleId || selectedSubmoduleId;
  const targetCourse = courses.find((course) => course.id === targetCourseId);
  const targetModule = modules.find((module) => module.id === targetModuleId);
  const targetSubmodule = submodules.find((submodule) => submodule.id === targetSubmoduleId);
  const canUpload = Boolean(targetCourseId && targetModuleId && targetSubmoduleId);

  const handleCourseChange = (courseId) => {
    setSelectedCourseId(courseId);
    setSelectedModuleId('');
    setSelectedSubmoduleId('');
    processedFileNamesRef.current.clear();
  };

  const handleModuleChange = (moduleId) => {
    setSelectedModuleId(moduleId);
    setSelectedSubmoduleId('');
    processedFileNamesRef.current.clear();
  };

  const handleUploadComplete = async (uploadResult) => {
    const files = Array.isArray(uploadResult) ? uploadResult : [uploadResult].filter(Boolean);
    const newFiles = files.filter((file) => file?.fileName && !processedFileNamesRef.current.has(file.fileName));

    if (!canUpload) {
      showToast('Select a course, module, and submodule before uploading content.', 'warning');
      return;
    }

    try {
      for (const file of newFiles) {
        const name = getDisplayName(file.fileName);
        await createMutation.mutateAsync({
          courseId: targetCourseId,
          moduleId: targetModuleId,
          submoduleId: targetSubmoduleId,
          name,
          slug: slugify(name),
          contentType: getContentType(file.fileName),
          description: `Uploaded file: ${file.fileName}`,
          fileName: file.fileName,
          fileSize: file.fileSize,
          fileUrl: file.fileUrl,
          status: 'Active',
          level: targetSubmodule?.level || targetModule?.level || targetCourse?.level || 'Beginner',
          language: targetSubmodule?.language || targetModule?.language || targetCourse?.language || 'English',
          estimatedDuration: 'Self-paced',
          brandColor: targetSubmodule?.brandColor || targetModule?.brandColor || targetCourse?.brandColor,
          bannerImage: targetSubmodule?.bannerImage || targetModule?.bannerImage || targetCourse?.bannerImage,
          icon: 'description',
        });
      }
    } catch {
      showToast('Uploaded file could not be converted into content. Please check the selected hierarchy.', 'error');
      return;
    }

    if (newFiles.length > 0) {
      newFiles.forEach((file) => processedFileNamesRef.current.add(file.fileName));
    }
  };

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: compact ? 2 : 3,
        backgroundColor: 'background.paper',
      }}
    >
      <Typography variant={compact ? 'subtitle2' : 'h6'} fontWeight={800} gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {description}
      </Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
        {!fixedCourseId && (
          <TextField
            select
            size="small"
            label="Course"
            value={selectedCourseId}
            onChange={(event) => handleCourseChange(event.target.value)}
            fullWidth
          >
            {availableCourses.map((course) => (
              <MenuItem key={course.id} value={course.id}>{course.name}</MenuItem>
            ))}
          </TextField>
        )}
        {!fixedModuleId && (
          <TextField
            select
            size="small"
            label="Module"
            value={selectedModuleId}
            onChange={(event) => handleModuleChange(event.target.value)}
            disabled={!targetCourseId}
            fullWidth
          >
            {availableModules.map((module) => (
              <MenuItem key={module.id} value={module.id}>{module.name}</MenuItem>
            ))}
          </TextField>
        )}
        {!fixedSubmoduleId && (
          <TextField
            select
            size="small"
            label="Submodule"
            value={selectedSubmoduleId}
            onChange={(event) => {
              setSelectedSubmoduleId(event.target.value);
              processedFileNamesRef.current.clear();
            }}
            disabled={!targetModuleId}
            fullWidth
          >
            {availableSubmodules.map((submodule) => (
              <MenuItem key={submodule.id} value={submodule.id}>{submodule.name}</MenuItem>
            ))}
          </TextField>
        )}
      </Stack>

      {canUpload ? (
        <FileUpload onUploadComplete={handleUploadComplete} multiple />
      ) : (
        <Alert severity="info">Select the target hierarchy before dropping files.</Alert>
      )}
    </Box>
  );
};

export default ContentUploadDropzone;
