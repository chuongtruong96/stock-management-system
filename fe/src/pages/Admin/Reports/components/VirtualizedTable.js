import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  LinearProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  ViewList as ViewListIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon
} from '@mui/icons-material';
import { FixedSizeList as List } from 'react-window';
import { useTranslation } from 'react-i18next';

const VirtualizedTable = ({ 
  data = [], 
  columns = [], 
  loading = false,
  onRowClick,
  height = 600,
  rowHeight = 70,
  enableVirtualization = true 
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(0);
  const [performanceMode, setPerformanceMode] = useState(true);
  
  const listRef = useRef(null);
  const [renderTime, setRenderTime] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);

  // Performance monitoring
  useEffect(() => {
    const startTime = performance.now();
    
    // Simulate memory usage calculation
    const estimatedMemory = data.length * 0.1; // KB per row estimate
    setMemoryUsage(estimatedMemory);
    
    const endTime = performance.now();
    setRenderTime(endTime - startTime);
  }, [data]);

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = data;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = data.filter(row => {
        return columns.some(column => {
          const value = row[column.field];
          return value && value.toString().toLowerCase().includes(searchLower);
        });
      });
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortConfig, columns]);

  // Pagination for non-virtualized mode
  const paginatedData = useMemo(() => {
    if (enableVirtualization) return processedData;
    
    const start = currentPage * pageSize;
    const end = start + pageSize;
    return processedData.slice(start, end);
  }, [processedData, currentPage, pageSize, enableVirtualization]);

  const handleSort = (columnKey) => {
    setSortConfig(prev => ({
      key: columnKey,
      direction: prev.key === columnKey && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(0); // Reset to first page when searching
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(0);
  };

  // Row renderer for virtualized list
  const Row = useCallback(({ index, style }) => {
    const row = processedData[index];
    if (!row) return null;

    return (
      <Box
        style={style}
        sx={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #f0f0f0',
          cursor: onRowClick ? 'pointer' : 'default',
          '&:hover': {
            bgcolor: onRowClick ? 'rgba(25, 118, 210, 0.04)' : 'transparent'
          },
          px: 2
        }}
        onClick={() => onRowClick && onRowClick(row)}
      >
        {columns.map((column, colIndex) => (
          <Box
            key={column.field}
            sx={{
              flex: column.flex || 1,
              minWidth: column.minWidth || 100,
              maxWidth: column.maxWidth,
              px: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {column.renderCell ? 
              column.renderCell({ row, value: row[column.field] }) : 
              row[column.field]
            }
          </Box>
        ))}
      </Box>
    );
  }, [processedData, columns, onRowClick]);

  // Regular table row for non-virtualized mode
  const RegularRow = ({ row, index }) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        minHeight: rowHeight,
        borderBottom: '1px solid #f0f0f0',
        cursor: onRowClick ? 'pointer' : 'default',
        '&:hover': {
          bgcolor: onRowClick ? 'rgba(25, 118, 210, 0.04)' : 'transparent'
        },
        px: 2
      }}
      onClick={() => onRowClick && onRowClick(row)}
    >
      {columns.map((column) => (
        <Box
          key={column.field}
          sx={{
            flex: column.flex || 1,
            minWidth: column.minWidth || 100,
            maxWidth: column.maxWidth,
            px: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {column.renderCell ? 
            column.renderCell({ row, value: row[column.field] }) : 
            row[column.field]
          }
        </Box>
      ))}
    </Box>
  );

  const totalPages = Math.ceil(processedData.length / pageSize);

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <CardContent sx={{ p: 0 }}>
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <ViewListIcon color="primary" />
              <Typography variant="h6" fontWeight="600">
                {t('dataTable') || 'Data Table'}
              </Typography>
              <Chip 
                label={`${processedData.length.toLocaleString()} ${t('rows') || 'rows'}`}
                size="small"
                color="primary"
                variant="outlined"
              />
              {enableVirtualization && (
                <Chip 
                  label={t('virtualized') || 'Virtualized'}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              )}
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={performanceMode}
                    onChange={(e) => setPerformanceMode(e.target.checked)}
                    size="small"
                  />
                }
                label={
                  <Typography variant="caption">
                    {t('performanceMode') || 'Performance Mode'}
                  </Typography>
                }
              />
            </Stack>
          </Box>

          {/* Search and Controls */}
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <TextField
              placeholder={t('searchTable') || 'Search table...'}
              value={searchTerm}
              onChange={handleSearch}
              size="small"
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
                endAdornment: searchTerm && (
                  <IconButton size="small" onClick={clearSearch}>
                    <ClearIcon />
                  </IconButton>
                )
              }}
            />

            {!enableVirtualization && (
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>{t('pageSize') || 'Page Size'}</InputLabel>
                <Select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(e.target.value);
                    setCurrentPage(0);
                  }}
                  label={t('pageSize') || 'Page Size'}
                >
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                  <MenuItem value={200}>200</MenuItem>
                </Select>
              </FormControl>
            )}
          </Stack>

          {/* Performance Metrics */}
          {performanceMode && (
            <Alert 
              severity="info" 
              sx={{ borderRadius: 2 }}
              icon={<SpeedIcon />}
            >
              <Stack direction="row" spacing={3} alignItems="center">
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    {t('renderTime') || 'Render Time'}
                  </Typography>
                  <Typography variant="body2" fontWeight="500">
                    {renderTime.toFixed(2)}ms
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    {t('memoryUsage') || 'Memory Usage'}
                  </Typography>
                  <Typography variant="body2" fontWeight="500">
                    {memoryUsage.toFixed(1)}KB
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    {t('mode') || 'Mode'}
                  </Typography>
                  <Typography variant="body2" fontWeight="500">
                    {enableVirtualization ? t('virtualized') || 'Virtualized' : t('paginated') || 'Paginated'}
                  </Typography>
                </Box>
              </Stack>
            </Alert>
          )}
        </Box>

        {/* Table Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            minHeight: 56,
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
            borderBottom: '2px solid #64748b',
            px: 2
          }}
        >
          {columns.map((column) => (
            <Box
              key={column.field}
              sx={{
                flex: column.flex || 1,
                minWidth: column.minWidth || 100,
                maxWidth: column.maxWidth,
                px: 1,
                cursor: column.sortable !== false ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
              onClick={() => column.sortable !== false && handleSort(column.field)}
            >
              <Typography variant="subtitle2" fontWeight="700" color="#1a365d">
                {column.headerName || column.field}
              </Typography>
              {sortConfig.key === column.field && (
                <SortIcon 
                  fontSize="small" 
                  sx={{ 
                    transform: sortConfig.direction === 'desc' ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s'
                  }} 
                />
              )}
            </Box>
          ))}
        </Box>

        {/* Loading State */}
        {loading && (
          <LinearProgress sx={{ height: 2 }} />
        )}

        {/* Table Content */}
        <Box sx={{ height: height - 200 }}>
          {processedData.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                {t('noDataFound') || 'No Data Found'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {searchTerm 
                  ? (t('noMatchingResults') || 'No results match your search criteria')
                  : (t('noDataAvailable') || 'No data available to display')
                }
              </Typography>
            </Box>
          ) : enableVirtualization ? (
            <List
              ref={listRef}
              height={height - 200}
              itemCount={processedData.length}
              itemSize={rowHeight}
              overscanCount={5}
            >
              {Row}
            </List>
          ) : (
            <Box>
              {paginatedData.map((row, index) => (
                <RegularRow key={row.id || index} row={row} index={index} />
              ))}
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                    <IconButton
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    >
                      ←
                    </IconButton>
                    
                    <Typography variant="body2">
                      {t('pageInfo', { 
                        current: currentPage + 1, 
                        total: totalPages 
                      }) || `Page ${currentPage + 1} of ${totalPages}`}
                    </Typography>
                    
                    <IconButton
                      disabled={currentPage >= totalPages - 1}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    >
                      →
                    </IconButton>
                  </Stack>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default VirtualizedTable;