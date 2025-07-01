import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Stack
} from '@mui/material';

const ReportsSkeleton = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Header Skeleton */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <Skeleton variant="circular" width={56} height={56} />
              <Box>
                <Skeleton variant="text" width={300} height={40} />
                <Skeleton variant="text" width={400} height={24} />
              </Box>
            </Box>
            <Box display="flex" gap={1}>
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="circular" width={40} height={40} />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Summary Cards Skeleton */}
      <Grid container spacing={3} mb={3}>
        {[1, 2, 3, 4].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Skeleton variant="circular" width={48} height={48} />
                  <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
                </Box>
                <Skeleton variant="text" width={80} height={40} />
                <Skeleton variant="text" width={120} height={20} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Controls Panel Skeleton */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Skeleton variant="circular" width={24} height={24} />
            <Skeleton variant="text" width={150} height={28} />
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Stack direction="row" spacing={1}>
                <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1, flex: 1 }} />
                <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1, flex: 1 }} />
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table Skeleton */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Skeleton variant="circular" width={24} height={24} />
              <Skeleton variant="text" width={120} height={28} />
              <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
            </Box>
          </Box>
          <Box sx={{ p: 3 }}>
            {/* Table Header */}
            <Box display="flex" gap={2} mb={2}>
              <Skeleton variant="rectangular" height={40} sx={{ flex: 1, borderRadius: 1 }} />
              <Skeleton variant="rectangular" height={40} sx={{ flex: 1, borderRadius: 1 }} />
              <Skeleton variant="rectangular" height={40} sx={{ flex: 2, borderRadius: 1 }} />
              <Skeleton variant="rectangular" height={40} sx={{ width: 120, borderRadius: 1 }} />
              <Skeleton variant="rectangular" height={40} sx={{ width: 100, borderRadius: 1 }} />
            </Box>
            {/* Table Rows */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
              <Box key={row} display="flex" gap={2} mb={1}>
                <Skeleton variant="rectangular" height={60} sx={{ flex: 1, borderRadius: 1 }} />
                <Skeleton variant="rectangular" height={60} sx={{ flex: 1, borderRadius: 1 }} />
                <Skeleton variant="rectangular" height={60} sx={{ flex: 2, borderRadius: 1 }} />
                <Skeleton variant="rectangular" height={60} sx={{ width: 120, borderRadius: 1 }} />
                <Skeleton variant="rectangular" height={60} sx={{ width: 100, borderRadius: 1 }} />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ReportsSkeleton;