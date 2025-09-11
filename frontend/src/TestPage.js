import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Alert } from '@mui/material';
import { apiBackend } from './services/api_backend';
import { adminService } from './services/adminService';

const TestPage = () => {
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [organizations, setOrganizations] = useState([]);
  const [users, setUsers] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const testBackend = async () => {
    console.log('🔍 Testing Backend Connection...');
    
    try {
      // Test 1: Backend Health
      const health = await apiBackend.health();
      console.log('✅ Backend Health:', health);
      setBackendStatus(`✅ ${health.status} - ${health.message}`);

      // Test 2: Organizations through adminService
      console.log('🏢 Testing Organizations...');
      const orgData = await adminService.getOrganizaciones();
      console.log('✅ Organizations:', orgData);
      setOrganizations(orgData);

      // Test 3: Users through adminService
      console.log('👥 Testing Users...');
      const userData = await adminService.getUsuarios();
      console.log('✅ Users:', userData);
      setUsers(userData);

      // Test 4: Dashboard through adminService
      console.log('📊 Testing Dashboard...');
      const dashData = await adminService.getDashboard();
      console.log('✅ Dashboard:', dashData);
      setDashboard(dashData);

    } catch (error) {
      console.error('❌ Test Error:', error);
      setBackendStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testBackend();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        🔍 Test de Conexión Backend-Frontend
      </Typography>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6">Backend Status</Typography>
          <Typography color={backendStatus.includes('✅') ? 'success.main' : 'error.main'}>
            {backendStatus}
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6">Organizations ({organizations.length})</Typography>
          {organizations.slice(0, 3).map((org, index) => (
            <Alert key={index} severity="success" sx={{ mt: 1 }}>
              {org.nombre || org.name} - {org.email}
            </Alert>
          ))}
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6">Users ({users.length})</Typography>
          {users.slice(0, 3).map((user, index) => (
            <Alert key={index} severity="info" sx={{ mt: 1 }}>
              {user.username} - {user.email}
            </Alert>
          ))}
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6">Dashboard Data</Typography>
          {dashboard && (
            <Box>
              <Typography>Organizations: {dashboard.total_organizaciones}</Typography>
              <Typography>Users: {dashboard.total_usuarios}</Typography>
              <Typography>RATs: {dashboard.actividades_rat}</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Button variant="contained" onClick={testBackend} disabled={loading}>
        🔄 Test Again
      </Button>
    </Box>
  );
};

export default TestPage;