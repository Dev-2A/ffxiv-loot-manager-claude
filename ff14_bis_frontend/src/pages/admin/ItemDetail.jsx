import React from 'react';
import { Box, Typography, Button, Alert, CircularProgress } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getItem, updateItem } from '../../api/itemsApi';
import ItemForm from '../../components/admin/ItemForm';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 아이템 정보 조회
  const {
    data: item,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['item', id],
    queryFn: () => getItem(id),
  });

  // 아이템 수정 mutation
  const {
    mutate,
    isLoading: isMutating,
    isError: isMutateError,
    error: mutateError
  } = useMutation({
    mutationFn: (itemData) => updateItem(id, itemData),
    onSuccess: () => {
      // 아이템 목록 및 상세 정보 쿼리 무효화 (데이터 갱신)
      queryClient.invalidateQueries(['items']);
      queryClient.invalidateQueries(['item', id]);
      // 아이템 목록으로 리다이렉트
      navigate('/admin/items');
    },
  });

  // 아이템 수정 제출 핸들러
  const handleSubmit = (itemData) => {
    mutate(itemData);
  };

  // 취소 핸들러
  const handleCancel = () => {
    navigate('/admin/items');
  };

  if (isLoading) return <Loading message='아이템 정보 로딩 중...' />;
  if (isError) return <ErrorMessage error={error} retry={refetch} />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
        <Typography variant='h4' component='h1'>
          아이템 정보 수정: {item.name}
        </Typography>
        <Button
          variant='outlined'
          onClick={handleCancel}
        >
          취소
        </Button>
      </Box>

      {isMutateError && (
        <Alert severity='error' sx={{ mb: 3 }}>
          오류가 발생했습니다: {mutateError.message}
        </Alert>
      )}

      <ItemForm
        initialValues={item}
        onSubmit={handleSubmit}
        isLoading={isMutating}
        isEdit={true}
      />

      {isMutating && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default ItemDetail;