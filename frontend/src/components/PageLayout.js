import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';

const PageLayout = ({ 
  title, 
  subtitle, 
  children, 
  maxWidth = 'lg',
  showPaper = true,
  backgroundColor = '#111827'
}) => {
  const content = (
    <>
      {(title || subtitle) && (
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          {title && (
            <Typography
              variant="h3"
              sx={{
                color: '#f9fafb',
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '1.5rem', md: '2rem' }
              }}
            >
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography
              variant="subtitle1"
              sx={{
                color: '#9ca3af',
                fontSize: '0.875rem'
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      )}
      {children}
    </>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: backgroundColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4
      }}
    >
      <Container maxWidth={maxWidth}>
        {showPaper ? (
          <Paper
            sx={{
              bgcolor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '0.75rem',
              p: 4,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            {content}
          </Paper>
        ) : (
          content
        )}
      </Container>
    </Box>
  );
};

export default PageLayout;