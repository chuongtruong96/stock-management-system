import { Box, Card, Skeleton, Grid } from "@mui/material";

// Metric Card Skeleton
export const MetricCardSkeleton = () => (
  <Card elevation={2} sx={{ p: 3, borderRadius: 3, height: 140 }}>
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
      <Skeleton variant="rectangular" width={48} height={48} sx={{ borderRadius: 2 }} />
      <Skeleton variant="text" width={40} height={20} />
    </Box>
    <Skeleton variant="text" width="60%" height={40} sx={{ mb: 1 }} />
    <Skeleton variant="text" width="80%" height={20} />
  </Card>
);

// Quick Action Card Skeleton
export const QuickActionSkeleton = () => (
  <Card elevation={1} sx={{ p: 2.5, borderRadius: 2, height: 100 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, height: "100%" }}>
      <Skeleton variant="rectangular" width={40} height={40} sx={{ borderRadius: 2 }} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="80%" height={20} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="60%" height={16} />
      </Box>
    </Box>
  </Card>
);

// Chart Card Skeleton
export const ChartCardSkeleton = ({ height = 400 }) => (
  <Card elevation={2} sx={{ p: 3, borderRadius: 3, height }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
      <Skeleton variant="circular" width={24} height={24} />
      <Skeleton variant="text" width="40%" height={24} />
    </Box>
    <Skeleton variant="rectangular" width="100%" height={height - 100} sx={{ borderRadius: 1 }} />
  </Card>
);

// Recent Activity Skeleton
export const RecentActivitySkeleton = () => (
  <Card elevation={2} sx={{ p: 3, borderRadius: 3 }}>
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton variant="text" width={120} height={24} />
      </Box>
      <Skeleton variant="text" width={60} height={20} />
    </Box>
    
    <Box>
      {[...Array(5)].map((_, index) => (
        <Box 
          key={index}
          sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            p: 1.5,
            mb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Box>
              <Skeleton variant="text" width={200} height={16} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width={100} height={14} />
            </Box>
          </Box>
          <Skeleton variant="text" width={60} height={14} />
        </Box>
      ))}
    </Box>
  </Card>
);

// Welcome Header Skeleton
export const WelcomeHeaderSkeleton = () => (
  <Card elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Skeleton variant="rectangular" width={48} height={48} sx={{ borderRadius: 2 }} />
        <Box>
          <Skeleton variant="text" width={250} height={32} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width={300} height={20} />
        </Box>
      </Box>
      
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{ textAlign: "right" }}>
          <Skeleton variant="text" width={80} height={16} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width={100} height={20} />
        </Box>
        <Skeleton variant="circular" width={40} height={40} />
      </Box>
    </Box>
  </Card>
);

// Full Dashboard Skeleton
export const DashboardSkeleton = () => (
  <Box>
    {/* Welcome Header Skeleton */}
    <WelcomeHeaderSkeleton />

    {/* Key Metrics Skeleton */}
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {[...Array(4)].map((_, index) => (
        <Grid key={index} item xs={12} sm={6} lg={3}>
          <MetricCardSkeleton />
        </Grid>
      ))}
    </Grid>

    {/* Quick Actions Skeleton */}
    <Box sx={{ mb: 4 }}>
      <Skeleton variant="text" width={150} height={32} sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        {[...Array(6)].map((_, index) => (
          <Grid key={index} item xs={12} sm={6} md={4} lg={2}>
            <QuickActionSkeleton />
          </Grid>
        ))}
      </Grid>
    </Box>

    {/* Charts Section Skeleton */}
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} lg={8}>
        <ChartCardSkeleton height={400} />
      </Grid>
      <Grid item xs={12} lg={4}>
        <ChartCardSkeleton height={400} />
      </Grid>
    </Grid>

    {/* Recent Activity Skeleton */}
    <RecentActivitySkeleton />
  </Box>
);

export default DashboardSkeleton;