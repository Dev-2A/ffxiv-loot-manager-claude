import React from 'react';
import { Box, Typography, Divider, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';

const PageHeader = ({
  title,
  description,
  breadcrumbs = [],
  action,
  divider = true
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      {breadcrumbs.length > 0 && (
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            component={RouterLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' }
            }}
          >
            <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} />
            홈
          </Link>
          {breadcrumbs.map((breadcrumb, index) => {
            const isLast = index === breadcrumbs.length -1;

            return isLast ? (
              <Typography color="text.primary" key={index}>
                {breadcrumb.label}
              </Typography>
            ) : (
              <Link
                component={RouterLink}
                to={breadcrumb.link}
                key={index}
                sx={{
                  color: 'text.secondary',
                  '&hover:': { color: 'primary.main' }
                }}
              >
                {breadcrumb.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}

      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            {title}
          </Typography>
          {description && (
            <Typography color="text.secondary" paragraph>
              {description}
            </Typography>
          )}
        </Box>

        {action && (
          <Box>
            {action}
          </Box>
        )}
      </Box>

      {divider && <Divider sx={{ mt: 2, mb: 4 }} />}
    </Box>
  );
};

export default PageHeader;