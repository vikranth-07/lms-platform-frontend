import React from 'react';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import Box from '@mui/material/Box';
import { LEVEL_OPTIONS, LANGUAGE_OPTIONS } from '../utils/lmsMetadata';

const LmsMetadataFields = ({ register, errors = {}, titlePrefix = '' }) => (
  <>
    <Grid item xs={12} sm={6}>
      <TextField
        {...register('slug')}
        label={`${titlePrefix}Integrated URL Slug`}
        placeholder="e.g. cloud-architect-academy"
        fullWidth
        error={!!errors.slug}
        helperText={errors.slug?.message || 'Used in clean catalog URLs and deep links.'}
      />
    </Grid>

    <Grid item xs={12} sm={3}>
      <TextField
        select
        {...register('level')}
        label="Level"
        fullWidth
        defaultValue="Beginner"
        error={!!errors.level}
        helperText={errors.level?.message}
      >
        {LEVEL_OPTIONS.map((level) => (
          <MenuItem key={level} value={level}>{level}</MenuItem>
        ))}
      </TextField>
    </Grid>

    <Grid item xs={12} sm={3}>
      <TextField
        select
        {...register('language')}
        label="Language"
        fullWidth
        defaultValue="English"
        error={!!errors.language}
        helperText={errors.language?.message}
      >
        {LANGUAGE_OPTIONS.map((language) => (
          <MenuItem key={language} value={language}>{language}</MenuItem>
        ))}
      </TextField>
    </Grid>

    <Grid item xs={12} sm={4}>
      <TextField
        {...register('estimatedDuration')}
        label="Estimated Duration"
        placeholder="e.g. 4 hours"
        fullWidth
        error={!!errors.estimatedDuration}
        helperText={errors.estimatedDuration?.message}
      />
    </Grid>

    <Grid item xs={12} sm={4}>
      <TextField
        {...register('brandColor')}
        type="color"
        label="Brand Color"
        fullWidth
        error={!!errors.brandColor}
        helperText={errors.brandColor?.message}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Box sx={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid', borderColor: 'divider' }} />
            </InputAdornment>
          ),
        }}
      />
    </Grid>

    <Grid item xs={12} sm={4}>
      <TextField
        {...register('icon')}
        label="Icon"
        placeholder="e.g. menu_book"
        fullWidth
        error={!!errors.icon}
        helperText={errors.icon?.message || 'Leave blank to auto-generate from the name.'}
      />
    </Grid>

    <Grid item xs={12}>
      <TextField
        {...register('bannerImage')}
        label="Banner Image URL"
        placeholder="https://images.unsplash.com/..."
        fullWidth
        error={!!errors.bannerImage}
        helperText={errors.bannerImage?.message}
      />
    </Grid>
  </>
);

export default LmsMetadataFields;
