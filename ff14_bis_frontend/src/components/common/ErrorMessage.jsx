import React from 'react';
import { Alert, AlertTitle, Box } from '@mui/material';

const ErrorMessage = ({ error, retry }) => {
	return (
		<Box sx={{ my: 2 }}>
			<Alert
				severity='error'
				action={
					retry && (
						<button onClick={retry} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
							다시 시도
						</button>
					)
				}
			>
				<AlertTitle>오류가 발생했습니다</AlertTitle>
				{error?.message || '데이터를 불러오는 중 문제가 발생했습니다.'}
			</Alert>
		</Box>
	);
};

export default ErrorMessage;