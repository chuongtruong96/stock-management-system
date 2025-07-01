import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  DragIndicator as DragIcon,
  Visibility as PreviewIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  TableChart as TableIcon,
  BarChart as ChartIcon,
  PieChart as PieIcon,
  Timeline as LineIcon,
  Clear as ClearIcon,
  PlayArrow as RunIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';

const CustomReportBuilder = ({ 
  data = [], 
  onReportGenerate,
  onReportSave,
  savedReports = [] 
}) => {
  const { t } = useTranslation();
  const [reportConfig, setReportConfig] = useState({
    name: '',
    description: '',
    fields: [],
    filters: [],
    groupBy: [],
    sortBy: [],
    visualizations: [],
    layout: 'table'
  });
  
  const [previewOpen, setPreviewOpen] = useState(false);
  const [availableFields, setAvailableFields] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);

  // Extract available fields from data
  const fieldOptions = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const sampleRow = data[0];
    return Object.keys(sampleRow).map(key => ({
      id: key,
      name: key,
      type: typeof sampleRow[key],
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
    }));
  }, [data]);

  const visualizationTypes = [
    { id: 'table', name: t('table') || 'Table', icon: TableIcon },
    { id: 'bar', name: t('barChart') || 'Bar Chart', icon: ChartIcon },
    { id: 'pie', name: t('pieChart') || 'Pie Chart', icon: PieIcon },
    { id: 'line', name: t('lineChart') || 'Line Chart', icon: LineIcon }
  ];

  const aggregationTypes = [
    { id: 'count', name: t('count') || 'Count' },
    { id: 'sum', name: t('sum') || 'Sum' },
    { id: 'avg', name: t('average') || 'Average' },
    { id: 'min', name: t('minimum') || 'Minimum' },
    { id: 'max', name: t('maximum') || 'Maximum' }
  ];

  const handleFieldAdd = (field) => {
    setReportConfig(prev => ({
      ...prev,
      fields: [...prev.fields, {
        id: field.id,
        name: field.name,
        label: field.label,
        type: field.type,
        aggregation: field.type === 'number' ? 'sum' : 'count',
        visible: true,
        order: prev.fields.length
      }]
    }));
  };

  const handleFieldRemove = (fieldId) => {
    setReportConfig(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== fieldId)
    }));
  };

  const handleFieldUpdate = (fieldId, updates) => {
    setReportConfig(prev => ({
      ...prev,
      fields: prev.fields.map(f => 
        f.id === fieldId ? { ...f, ...updates } : f
      )
    }));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(reportConfig.fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setReportConfig(prev => ({
      ...prev,
      fields: items.map((item, index) => ({ ...item, order: index }))
    }));
  };

  const handleFilterAdd = () => {
    setReportConfig(prev => ({
      ...prev,
      filters: [...prev.filters, {
        id: Date.now(),
        field: '',
        operator: 'equals',
        value: '',
        type: 'string'
      }]
    }));
  };

  const handleFilterUpdate = (filterId, updates) => {
    setReportConfig(prev => ({
      ...prev,
      filters: prev.filters.map(f => 
        f.id === filterId ? { ...f, ...updates } : f
      )
    }));
  };

  const handleFilterRemove = (filterId) => {
    setReportConfig(prev => ({
      ...prev,
      filters: prev.filters.filter(f => f.id !== filterId)
    }));
  };

  const generateReport = () => {
    if (onReportGenerate) {
      onReportGenerate(reportConfig);
    }
  };

  const saveReport = () => {
    if (onReportSave && reportConfig.name) {
      onReportSave({
        ...reportConfig,
        id: Date.now(),
        createdAt: new Date().toISOString()
      });
    }
  };

  const clearReport = () => {
    setReportConfig({
      name: '',
      description: '',
      fields: [],
      filters: [],
      groupBy: [],
      sortBy: [],
      visualizations: [],
      layout: 'table'
    });
  };

  const FieldItem = ({ field, index }) => (
    <Draggable draggableId={field.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          sx={{
            mb: 1,
            opacity: snapshot.isDragging ? 0.8 : 1,
            transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box {...provided.dragHandleProps}>
                <DragIcon color="action" />
              </Box>
              
              <Box flex={1}>
                <Typography variant="subtitle2" fontWeight="600">
                  {field.label}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {field.type} • {field.aggregation}
                </Typography>
              </Box>

              <FormControl size="small" sx={{ minWidth: 100 }}>
                <Select
                  value={field.aggregation}
                  onChange={(e) => handleFieldUpdate(field.id, { aggregation: e.target.value })}
                >
                  {aggregationTypes.map(agg => (
                    <MenuItem key={agg.id} value={agg.id}>
                      {agg.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={field.visible}
                    onChange={(e) => handleFieldUpdate(field.id, { visible: e.target.checked })}
                    size="small"
                  />
                }
                label=""
              />

              <IconButton
                size="small"
                onClick={() => handleFieldRemove(field.id)}
                color="error"
              >
                <RemoveIcon />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );

  const FilterItem = ({ filter }) => (
    <Card sx={{ mb: 1 }}>
      <CardContent sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('field') || 'Field'}</InputLabel>
              <Select
                value={filter.field}
                onChange={(e) => handleFilterUpdate(filter.id, { field: e.target.value })}
              >
                {fieldOptions.map(field => (
                  <MenuItem key={field.id} value={field.id}>
                    {field.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('operator') || 'Operator'}</InputLabel>
              <Select
                value={filter.operator}
                onChange={(e) => handleFilterUpdate(filter.id, { operator: e.target.value })}
              >
                <MenuItem value="equals">{t('equals') || 'Equals'}</MenuItem>
                <MenuItem value="contains">{t('contains') || 'Contains'}</MenuItem>
                <MenuItem value="greater">{t('greater') || 'Greater than'}</MenuItem>
                <MenuItem value="less">{t('less') || 'Less than'}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label={t('value') || 'Value'}
              value={filter.value}
              onChange={(e) => handleFilterUpdate(filter.id, { value: e.target.value })}
            />
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <IconButton
              onClick={() => handleFilterRemove(filter.id)}
              color="error"
              size="small"
            >
              <RemoveIcon />
            </IconButton>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Report Configuration */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Typography variant="h6" fontWeight="600">
                  {t('reportBuilder') || 'Report Builder'}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={clearReport}
                    disabled={reportConfig.fields.length === 0}
                  >
                    {t('clear') || 'Clear'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PreviewIcon />}
                    onClick={() => setPreviewOpen(true)}
                    disabled={reportConfig.fields.length === 0}
                  >
                    {t('preview') || 'Preview'}
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<RunIcon />}
                    onClick={generateReport}
                    disabled={reportConfig.fields.length === 0}
                  >
                    {t('generate') || 'Generate'}
                  </Button>
                </Stack>
              </Box>

              {/* Basic Info */}
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('reportName') || 'Report Name'}
                    value={reportConfig.name}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, name: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>{t('layout') || 'Layout'}</InputLabel>
                    <Select
                      value={reportConfig.layout}
                      onChange={(e) => setReportConfig(prev => ({ ...prev, layout: e.target.value }))}
                    >
                      {visualizationTypes.map(viz => (
                        <MenuItem key={viz.id} value={viz.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <viz.icon fontSize="small" />
                            {viz.name}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label={t('description') || 'Description'}
                    value={reportConfig.description}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, description: e.target.value }))}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ mb: 3 }} />

              {/* Fields Section */}
              <Typography variant="h6" gutterBottom>
                {t('selectedFields') || 'Selected Fields'}
              </Typography>
              
              {reportConfig.fields.length === 0 ? (
                <Alert severity="info" sx={{ mb: 3 }}>
                  {t('noFieldsSelected') || 'No fields selected. Add fields from the available fields panel.'}
                </Alert>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="fields">
                    {(provided) => (
                      <Box
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        sx={{ mb: 3 }}
                      >
                        {reportConfig.fields.map((field, index) => (
                          <FieldItem key={field.id} field={field} index={index} />
                        ))}
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                </DragDropContext>
              )}

              <Divider sx={{ mb: 3 }} />

              {/* Filters Section */}
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">
                  {t('filters') || 'Filters'}
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleFilterAdd}
                  size="small"
                >
                  {t('addFilter') || 'Add Filter'}
                </Button>
              </Box>

              {reportConfig.filters.map(filter => (
                <FilterItem key={filter.id} filter={filter} />
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Available Fields */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('availableFields') || 'Available Fields'}
              </Typography>
              
              <List dense>
                {fieldOptions.map(field => (
                  <ListItem
                    key={field.id}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                    onClick={() => handleFieldAdd(field)}
                  >
                    <ListItemIcon>
                      <TableIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={field.label}
                      secondary={field.type}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFieldAdd(field);
                        }}
                        disabled={reportConfig.fields.some(f => f.id === field.id)}
                      >
                        <AddIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              {/* Save Report */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  {t('saveReport') || 'Save Report'}
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  onClick={saveReport}
                  disabled={!reportConfig.name || reportConfig.fields.length === 0}
                >
                  {t('saveReport') || 'Save Report'}
                </Button>
              </Box>

              {/* Saved Reports */}
              {savedReports.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('savedReports') || 'Saved Reports'}
                  </Typography>
                  <Stack spacing={1}>
                    {savedReports.slice(0, 5).map(report => (
                      <Chip
                        key={report.id}
                        label={report.name}
                        variant="outlined"
                        clickable
                        onClick={() => setReportConfig(report)}
                        sx={{ justifyContent: 'flex-start' }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {t('reportPreview') || 'Report Preview'}
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            {t('previewNote') || 'This is a preview of your report configuration. Click Generate to create the actual report.'}
          </Alert>
          
          <Typography variant="h6" gutterBottom>
            {reportConfig.name || t('untitledReport') || 'Untitled Report'}
          </Typography>
          
          {reportConfig.description && (
            <Typography variant="body2" color="textSecondary" paragraph>
              {reportConfig.description}
            </Typography>
          )}

          <Typography variant="subtitle2" gutterBottom>
            {t('fields') || 'Fields'}: {reportConfig.fields.length}
          </Typography>
          
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            {reportConfig.fields.map(field => (
              <Chip
                key={field.id}
                label={`${field.label} (${field.aggregation})`}
                size="small"
                color={field.visible ? 'primary' : 'default'}
              />
            ))}
          </Stack>

          {reportConfig.filters.length > 0 && (
            <>
              <Typography variant="subtitle2" gutterBottom>
                {t('filters') || 'Filters'}: {reportConfig.filters.length}
              </Typography>
              <Stack spacing={1} sx={{ mb: 2 }}>
                {reportConfig.filters.map(filter => (
                  <Typography key={filter.id} variant="body2" color="textSecondary">
                    {filter.field} {filter.operator} {filter.value}
                  </Typography>
                ))}
              </Stack>
            </>
          )}

          <Typography variant="subtitle2">
            {t('layout') || 'Layout'}: {reportConfig.layout}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>
            {t('close') || 'Close'}
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setPreviewOpen(false);
              generateReport();
            }}
          >
            {t('generate') || 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomReportBuilder;