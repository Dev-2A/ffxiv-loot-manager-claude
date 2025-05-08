import React, { useState, useRef } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Avatar, 
  IconButton,
  TextField,
  Grid,
  Divider,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';
import { styled } from '@mui/material/styles';

const Input = styled('input')({
  display: 'none',
});

const ProfileImageUploader = ({
  currentImage,
  onImageChange,
  loading = false,
  error = null
}) => {
  const [imagePreview, setImagePreview] = useState(currentImage);
  const [imageUrl, setImageUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef(null);

  // 이미지 파일 선택 처리
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
        onImageChange({ file, type: 'file' });
      };
      reader.readAsDataURL(file);
    }
  };

  // URL 입력 처리
  const handleUrlChange = (e) => {
    setImageUrl(e.target.value);
  };

  // URL 이미지 적용
  const handleApplyUrl = () => {
    if (imageUrl) {
      setImagePreview(imageUrl);
      onImageChange({ url: imageUrl, type: 'url' });
      setShowUrlInput(false);
    }
  };

  // 이미지 제거
  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageUrl('');
    onImageChange({ type: 'remove' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant='h6' gutterBottom fontWeight="bold">
        프로필 이미지
      </Typography>

      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar
          src={imagePreview}
          alt="프로필 이미지"
          sx={{
            width: 120,
            height: 120,
            mb: 2,
            border: 1,
            borderColor: 'divider',
            boxShadow: 2
          }}
        >
          {!imagePreview && <AddPhotoAlternateIcon sx={{ fontSize: 40 }} />}
        </Avatar>

        {loading ? (
          <CircularProgress size={24} sx={{ mt: 1, mb: 2 }} />
        ): (
          <Grid container spacing={1} justifyContent="center">
            <Grid item>
              <label htmlFor='profile-image-upload'>
                <Input
                  accept='image/*'
                  id='profile-image-upload'
                  type='file'
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
                <Button
                  variant='outlined'
                  component="span"
                  startIcon={<AddPhotoAlternateIcon />}
                >
                  파일 선택
                </Button>
              </label>
            </Grid>

            <Grid item>
              <Button
                variant='outlined'
                onClick={() => setShowUrlInput(!showUrlInput)}
                startIcon={<LinkIcon />}
              >
                URL 입력
              </Button>
            </Grid>

            {imagePreview && (
              <Grid item>
                <Button
                  variant='outlined'
                  color='error'
                  onClick={handleRemoveImage}
                  startIcon={<DeleteIcon />}
                >
                  제거
                </Button>
              </Grid>
            )}
          </Grid>
        )}

        {showUrlInput && (
          <Box sx={{ mt: 2, width: '100%' }}>
            <TextField
              fullWidth
              placeholder='이미지 URL 입력'
              value={imageUrl}
              onChange={handleUrlChange}
              size='small'
              sx={{ mb: 1 }}
            />
            <Button
              variant='contained'
              onClick={handleApplyUrl}
              fullWidth
              disabled={!imageUrl}
            >
              URL 적용
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default ProfileImageUploader;