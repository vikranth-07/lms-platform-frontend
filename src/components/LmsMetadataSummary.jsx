import React from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import { getLmsIconKey } from '../utils/lmsMetadata';

export const BrandSwatch = ({ color = '#6C1D5F', size = 18 }) => (
  <Box
    component="span"
    sx={{
      display: 'inline-flex',
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: color,
      border: '1px solid',
      borderColor: 'divider',
      flexShrink: 0,
    }}
  />
);

export const MetadataChips = ({ item, compact = false }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
    <Chip label={item.level || 'Beginner'} size="small" variant="outlined" />
    <Chip label={item.language || 'English'} size="small" variant="outlined" />
    <Chip label={item.estimatedDuration || '1 hour'} size="small" variant="outlined" />
    {!compact && item.slug && <Chip label={`URL: ${item.slug}`} size="small" variant="outlined" />}
    <BrandSwatch color={item.brandColor} />
  </Box>
);

export const MetadataDetails = ({ item }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
    <Box>
      <Typography variant="caption" color="text.secondary">Integrated URL Slug</Typography>
      <Typography variant="body2" fontWeight={600}>{item.slug || 'Not set'}</Typography>
    </Box>
    <Box>
      <Typography variant="caption" color="text.secondary">Icon</Typography>
      <Typography variant="body2" fontWeight={600}>{getLmsIconKey(item)}</Typography>
    </Box>
    <Box>
      <Typography variant="caption" color="text.secondary">Level</Typography>
      <Typography variant="body2" fontWeight={600}>{item.level || 'Beginner'}</Typography>
    </Box>
    <Box>
      <Typography variant="caption" color="text.secondary">Language</Typography>
      <Typography variant="body2" fontWeight={600}>{item.language || 'English'}</Typography>
    </Box>
    <Box>
      <Typography variant="caption" color="text.secondary">Estimated Duration</Typography>
      <Typography variant="body2" fontWeight={600}>{item.estimatedDuration || '1 hour'}</Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <BrandSwatch color={item.brandColor} />
      <Box>
        <Typography variant="caption" color="text.secondary">Brand Color</Typography>
        <Typography variant="body2" fontWeight={600}>{item.brandColor || '#6C1D5F'}</Typography>
      </Box>
    </Box>
  </Box>
);

export const BannerPreview = ({ item, height = 120 }) => (
  <Avatar
    variant="rounded"
    src={item.bannerImage || item.thumbnail}
    sx={{ width: '100%', height, border: '1px solid', borderColor: 'divider' }}
  />
);
