import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Chip, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Alert,
  Tooltip,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addMateriaToBisItem, removeAllMaterias } from '../../api/bisApi';
import { MATERIA_TYPES, getMateriaColor } from '../../utils/materiaConstants';

const MateriaManager = ({ bisItem, canModify = false, maxSlots = 2, onSuccess }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(1);
  const [selectedType, setSelectedType] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const queryClient = useQueryClient();

  // 마테리쟈 추가 mutation
  const addMateriaMutation = useMutation({
    mutationFn: ({ bisItemId, type, slotNumber }) => {
      return addMateriaToBisItem(bisItemId, { type, slot_number: slotNumber });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['bisSet', bisItem.bis_set]);
      if (onSuccess) onSuccess();
      setDialogOpen(false);
      setSelectedType('');
      setErrorMessage('');
    },
    onError: (error) => {
      setErrorMessage(error.response?.data?.error || '마테리쟈 추가 중 오류가 발생했습니다.');
    }
  });

  // 마테리쟈 모두 제거 mutation
  const removeAllMateriasMutation = useMutation({
    mutationFn: (bisItemId) => {
      return removeAllMaterias(bisItemId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['bisSet', bisItem.bis_set]);
      if (onSuccess) onSuccess();
      setConfirmDialogOpen(false);
    },
    onError: (error) => {
      setErrorMessage(error.response?.data?.error || '마테리쟈 제거 중 오류가 발생했습니다.');
      setConfirmDialogOpen(false);
    }
  });

  // 다이얼로그 열기
  const handleOpenDialog = (slotNumber) => {
    setSelectedSlot(slotNumber);

    // 이미 해당 슬롯에 마테리쟈가 있으면 해당 값 선택
    const existingMateria = bisItem.materias?.find(m => m.slot_number === slotNumber);
    setSelectedType(existingMateria?.type || '');

    setDialogOpen(true);
  };

  // 마테리쟈 추가 제출
  const handleSubmit = () => {
    if (!selectedType) {
      setErrorMessage('마테리쟈 종류를 선택해주세요.');
      return;
    }

    addMateriaMutation.mutate({
      bisItemId: bisItem.id,
      type: selectedType,
      slotNumber: selectedSlot
    });
  };

  // 확인 다이얼로그 열기
  const handleOpenConfirmDialog = () => {
    setConfirmDialogOpen(true);
  };

  // 마테리쟈 모두 제거 실행
  const handleRemoveAllMaterias = () => {
    removeAllMateriasMutation.mutate(bisItem.id);
  };

  // 이미 장착된 마테리쟈 가져오기
  const getMateriaBySlot = (slotNumber) => {
    return bisItem.materias?.find(materia => materia.slot_number === slotNumber);
  };

  // 마테리쟈가 있는지 확인
  const hasMaterias = bisItem.materias && bisItem.materias.length > 0;

  // 마테리쟈 칩 렌더링
  const renderMateriaChip = (slotNumber) => {
    const materia = getMateriaBySlot(slotNumber);

    if (materia) {
      // 이미 장착된 마테리쟈
      const materiaType = materia.type_display || materia.type;
      return (
        <Chip
          label={materiaType}
          sx={{
            mr: 0.5,
            mb: 0.5,
            backgroundColor: getMateriaColor(materia.type),
            color: 'white',
            fontWeight: 500
          }}
          onClick={canModify ? () => handleOpenDialog(slotNumber) : undefined}
          clickable={canModify}
        />
      );
    } else {
      // 빈 슬롯
      return canModify ? (
        <Chip
          label={`슬롯 ${slotNumber}`}
          variant='outlined'
          color='default'
          onClick={() => handleOpenDialog(slotNumber)}
          clickable
          sx={{ mr: 0.5, mb: 0.5 }}
        />
      ) : (
        <Chip
          label={`비어있음`}
          variant='outlined'
          color='default'
          sx={{ mr: 0.5, mb: 0.5, opacity: 0.6 }}
        />
      );
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant='body2' fontWeight={500} sx={{ mr: 1 }}>
          마테리쟈:
        </Typography>
        <Box>
          {/* 슬롯 개수만큼 마테리쟈 칩 표시 */}
          {Array.from({ length: maxSlots }, (_, i) => i + 1).map(slotNumber => (
            <Box key={slotNumber} component="span">
              {renderMateriaChip(slotNumber)}
            </Box>
          ))}
        </Box>

        {/* 마테리쟈 모두 제거 버튼 */}
        {canModify && hasMaterias && (
          <Tooltip title="모든 마테리쟈 제거">
            <IconButton
              size='small'
              color='error'
              onClick={handleOpenConfirmDialog}
              sx={{
                ml: 1,
                '&:hover': {
                  backgroundColor: 'rgba(211, 47, 47, 0.1)'
                }
              }}
            >
              <DeleteIcon fontSize='small' />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* 마테리쟈 선택 다이얼로그 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          마테리쟈 선택 (슬롯 {selectedSlot})
        </DialogTitle>
        <DialogContent>
          {errorMessage && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>마테리쟈 종류</InputLabel>
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              label="마테리쟈 종류"
            >
              <MenuItem value="">선택하세요</MenuItem>
              {MATERIA_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>취소</Button>
          <Button
            onClick={handleSubmit}
            variant='contained'
            disabled={!selectedType || addMateriaMutation.isLoading}
          >
            {addMateriaMutation.isLoading ? '처리 중...' : '적용'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 마테리쟈 모두 제거 확인 다이얼로그 */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>
          마테리쟈 모두 제거
        </DialogTitle>
        <DialogContent>
          <Typography>
            정말로 이 아이템의 모든 마테리쟈를 제거하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>취소</Button>
          <Button
            onClick={handleRemoveAllMaterias}
            color='error'
            variant='contained'
            disabled={removeAllMateriasMutation.isLoading}
          >
            {removeAllMateriasMutation.isLoading ? '제거 중...' : '모두 제거'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MateriaManager;