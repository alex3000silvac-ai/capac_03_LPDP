/**
 * Componente para probar la conectividad con el backend
 */
import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Alert,
    CircularProgress,
    Chip,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {
    CheckCircle,
    Error,
    Warning,
    Refresh,
    Api,
    Cloud
} from '@mui/icons-material';
import { apiService } from '../services/api';

const ConnectionTest = () => {
    const [testing, setTesting] = useState(false);
    const [results, setResults] = useState({
        health: null,
        test: null,
        timestamp: null
    });

    const runTests = async () => {
        setTesting(true);
        setResults({ health: null, test: null, timestamp: null });

        try {
            // Test 1: Health check
            console.log('🏥 Ejecutando health check...');
            const healthResult = await apiService.healthCheck();
            setResults(prev => ({ ...prev, health: healthResult }));

            // Test 2: API test endpoint
            console.log('🧪 Ejecutando test de API...');
            const testResult = await apiService.testConnection();
            setResults(prev => ({ 
                ...prev, 
                test: testResult,
                timestamp: new Date().toLocaleString()
            }));

        } catch (error) {
            console.error('❌ Error en tests:', error);
        } finally {
            setTesting(false);
        }
    };

    // Ejecutar tests al montar el componente
    useEffect(() => {
        runTests();
    }, []);

    const getStatusIcon = (result) => {
        if (!result) return <CircularProgress size={20} />;
        return result.success ? <CheckCircle color="success" /> : <Error color="error" />;
    };

    const getStatusColor = (result) => {
        if (!result) return 'default';
        return result.success ? 'success' : 'error';
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
            <Card>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h5">
                            <Api sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Test de Conectividad
                        </Typography>
                        <Button
                            variant="outlined"
                            onClick={runTests}
                            disabled={testing}
                            startIcon={testing ? <CircularProgress size={16} /> : <Refresh />}
                        >
                            {testing ? 'Probando...' : 'Probar Conexión'}
                        </Button>
                    </Box>

                    {/* Información de configuración */}
                    <Alert severity="info" sx={{ mb: 3 }}>
                        <Typography variant="body2">
                            <strong>Backend URL:</strong> {process.env.REACT_APP_API_URL || 'https://scldp-backend.onrender.com'}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Entorno:</strong> {process.env.NODE_ENV || 'production'}
                        </Typography>
                    </Alert>

                    {/* Resultados de tests */}
                    <List>
                        <ListItem>
                            <ListItemIcon>
                                {getStatusIcon(results.health)}
                            </ListItemIcon>
                            <ListItemText
                                primary="Health Check"
                                secondary={
                                    results.health ? (
                                        results.health.success ? 
                                            'Backend responde correctamente' : 
                                            `Error: ${results.health.error}`
                                    ) : 'Verificando...'
                                }
                            />
                            <Chip 
                                label={results.health?.success ? 'OK' : results.health ? 'ERROR' : 'TESTING'}
                                color={getStatusColor(results.health)}
                                size="small"
                            />
                        </ListItem>

                        <ListItem>
                            <ListItemIcon>
                                {getStatusIcon(results.test)}
                            </ListItemIcon>
                            <ListItemText
                                primary="API Test Endpoint"
                                secondary={
                                    results.test ? (
                                        results.test.success ? 
                                            'API responde correctamente' : 
                                            `Error: ${results.test.error}`
                                    ) : 'Verificando...'
                                }
                            />
                            <Chip 
                                label={results.test?.success ? 'OK' : results.test ? 'ERROR' : 'TESTING'}
                                color={getStatusColor(results.test)}
                                size="small"
                            />
                        </ListItem>
                    </List>

                    {/* Detalles de respuesta */}
                    {results.health?.data && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                <strong>Health Response:</strong><br />
                                {JSON.stringify(results.health.data, null, 2)}
                            </Typography>
                        </Alert>
                    )}

                    {results.test?.data && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                <strong>Test Response:</strong><br />
                                {JSON.stringify(results.test.data, null, 2)}
                            </Typography>
                        </Alert>
                    )}

                    {/* Errores */}
                    {(results.health?.error || results.test?.error) && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                <strong>Errores detectados:</strong><br />
                                {results.health?.error && `Health: ${results.health.error}`}<br />
                                {results.test?.error && `Test: ${results.test.error}`}
                            </Typography>
                        </Alert>
                    )}

                    {/* Timestamp */}
                    {results.timestamp && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                            Última prueba: {results.timestamp}
                        </Typography>
                    )}

                    {/* Estado general */}
                    <Box mt={3}>
                        {results.health?.success && results.test?.success ? (
                            <Alert severity="success">
                                <Typography variant="h6">
                                    ✅ Conectividad OK
                                </Typography>
                                <Typography variant="body2">
                                    El frontend puede comunicarse correctamente con el backend.
                                </Typography>
                            </Alert>
                        ) : (results.health || results.test) && (
                            <Alert severity="error">
                                <Typography variant="h6">
                                    ❌ Problemas de Conectividad
                                </Typography>
                                <Typography variant="body2">
                                    Hay problemas de comunicación entre frontend y backend.
                                    Verificar configuración de CORS y URLs.
                                </Typography>
                            </Alert>
                        )}
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ConnectionTest;