import React from 'react';
import { Card, CardHeader, CardContent, CardActions, Box, Typography } from '@mui/material';

const EnhancedCard = ({
  title,
  subtitle,
  icon,
  action,
  children,
  footer,
  headerBg = 'transparent',
  headerColor = 'inherit',
  elevation = 1,
  variant = 'elevation',
  sx = {}
}) => {
  return (
    <Card
      elevation={elevation}
      variant={variant}
      sx={{ height: '100%', display: 'flex', flexDirection: 'column', ...sx }}
    >
      {(title || subtitle || icon || action) && (
        <CardHeader
          title={
            title && (
              <Typography variant="h6" fontWeight="bold">
                {title}
              </Typography>
            )
          }
          subheader={subtitle}
          avatar={icon}
          action={action}
          sx={{
            backgroundColor: headerBg,
            color: headerColor,
            pb: subtitle ? 2 : 1
          }}
        />
      )}

      <CardContent sx={{ flexGrow: 1, pt: (title || subtitle || icon || action) ? 0 : 2 }}>
        <Box>
          {children}
        </Box>
      </CardContent>

      {footer && (
        <CardActions sx={{ p: 2, pt: 0 }}>
          {footer}
        </CardActions>
      )}
    </Card>
  );
};

export default EnhancedCard;