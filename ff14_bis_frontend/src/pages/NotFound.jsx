import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import ErrorIcon from '@mui/icons-material/Error';

const NotFound = () => {
  return (
    <Container maxWidth="md">
      <Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					minHeight: '80vh',
					textAlign: 'center',
					py: 4,
				}}
			>
				<ErrorIcon sx={{ fontSize: 100, color: 'error.main', mb: 2 }} />
				<Typography variant='h2' component='h1' gutterBottom>
					404
				</Typography>
				<Typography variant='h4' component='h2' gutterBottom>
					페이지를 찾을 수 없습니다
				</Typography>
				<Typography variant='body1' color="text.secondary">
					요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
				</Typography>
				<Button
					variant="contained"
					color='primary'
					component={Link}
					to="/"
					size='large'
					sx={{ mt: 2 }}
				>
					홈으로 돌아가기
				</Button>
			</Box>
    </Container>
  );
};

export default NotFound;