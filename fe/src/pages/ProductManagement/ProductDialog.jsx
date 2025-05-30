/* pages/ProductManagement/ProductDialog.jsx */
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, FormControl, InputLabel, Select, MenuItem,
    Button,
  } from "@mui/material";
  import Upload from "@mui/icons-material/UploadFile";
  import { useState, useEffect } from "react";
  export default function ProductDialog({
    open, onClose, onSave, lang = "en", product, units
  }) {
  
    const [draft, setDraft] = useState(() =>
      product ?? { code:"", name:"", unitId:"",image:"" }
    );
  
    useEffect(()=> setDraft(
      product ?? { code:"", name:"", unitId:"" ,image:""}
    ),[product]);
  
    const field = (key,val)=> setDraft(d=>({...d,[key]:val}));
  
    return (
      <Dialog open={open} fullWidth maxWidth="sm" onClose={onClose}>
        <DialogTitle>
          {product ? (lang==="vi"?"Sửa sản phẩm":"Edit product")
                   : (lang==="vi"?"Thêm sản phẩm":"Add product")}
        </DialogTitle>
  
        <DialogContent dividers>
          <TextField label="Code" fullWidth margin="normal"
            value={draft.code} onChange={e=>field("code",e.target.value)} />
  
          <TextField label={lang==="vi"?"Tên":"Name"} fullWidth margin="normal"
            value={draft.name} onChange={e=>field("name",e.target.value)} />
  
          <FormControl fullWidth margin="normal">
            <InputLabel>{lang==="vi"?"Đơn vị":"Unit"}</InputLabel>
            <Select value={draft.unitId} label="Unit"
              onChange={e=>field("unitId",e.target.value)}>
              {units.map(u=>(
                <MenuItem key={u.id} value={u.id}>
                  {lang==="vi"?u.nameVn:u.nameEn}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
  
        <DialogActions>
          <Button onClick={onClose}>{lang==="vi"?"Hủy":"Cancel"}</Button>
          <Button variant="contained"
            onClick={()=>onSave(draft)}>{lang==="vi"?"Lưu":"Save"}</Button>
          <Button component="label" variant="outlined" startIcon={<Upload/>}></Button>
        </DialogActions>
      </Dialog>
    );
  }
  