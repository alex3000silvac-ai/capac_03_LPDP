// CONFIGURACIÓN CENTRALIZADA DE INDUSTRIAS
// Sistema LPDP - Ley 21.719 Chile
// Mover a Supabase en siguiente iteración

import {
  AccountBalance as FinanceIcon,
  LocalHospital as HealthIcon,
  School as EducationIcon,
  Store as RetailIcon,
  Build as TechIcon,
  Factory as ManufacturingIcon,
  Restaurant as FoodIcon,
  DirectionsCar as TransportIcon
} from '@mui/icons-material';

export const INDUSTRIES_CONFIG = [
  {
    id: 'financiero',
    name: 'Sector Financiero',
    icon: FinanceIcon,
    color: '#059669',
    regulations: ['Ley 21.719', 'Ley 21.000 (CMF)', 'Basilea III', 'FATCA'],
    specialRequirements: 'Regulación CMF - Datos financieros sensibles',
    riskLevel: 'ALTO',
    defaultRetention: '10 años',
    complianceNotes: 'Requiere cumplimiento estricto con CMF y normativa bancaria'
  },
  {
    id: 'salud',
    name: 'Sector Salud',
    icon: HealthIcon,
    color: '#dc2626',
    regulations: ['Ley 21.719', 'Ley 20.584 (Derechos Pacientes)', 'Código Sanitario'],
    specialRequirements: 'Datos de salud - Protección especial Art. 12 Ley 21.719',
    riskLevel: 'CRITICO',
    defaultRetention: '15 años',
    complianceNotes: 'Datos ultra sensibles - Requiere EIPD obligatoria'
  },
  {
    id: 'educacion',
    name: 'Sector Educación',
    icon: EducationIcon,
    color: '#7c3aed',
    regulations: ['Ley 21.719', 'Ley 20.370 (LGE)', 'Protección Menores'],
    specialRequirements: 'Datos de menores - Consentimiento parental requerido',
    riskLevel: 'ALTO',
    defaultRetention: '5 años post-egreso',
    complianceNotes: 'Menores de edad - Consentimiento parental obligatorio'
  },
  {
    id: 'retail',
    name: 'Comercio y Retail',
    icon: RetailIcon,
    color: '#ea580c',
    regulations: ['Ley 21.719', 'Ley 19.496 (SERNAC)', 'Ley 20.009 (DICOM)'],
    specialRequirements: 'Datos comerciales - Información crediticia',
    riskLevel: 'MEDIO',
    defaultRetention: '5 años',
    complianceNotes: 'Marketing requiere opt-in explícito'
  },
  {
    id: 'tecnologia',
    name: 'Tecnología',
    icon: TechIcon,
    color: '#0891b2',
    regulations: ['Ley 21.719', 'Ciberseguridad', 'Transferencias Internacionales'],
    specialRequirements: 'Datos en la nube - Transferencias internacionales',
    riskLevel: 'ALTO',
    defaultRetention: 'Según contrato',
    complianceNotes: 'Verificar cláusulas contractuales estándar para transfers'
  },
  {
    id: 'manufactura',
    name: 'Manufactura',
    icon: ManufacturingIcon,
    color: '#4f46e5',
    regulations: ['Ley 21.719', 'Normativa Laboral', 'Medio Ambiente'],
    specialRequirements: 'Datos laborales - Medicina del trabajo',
    riskLevel: 'MEDIO',
    defaultRetention: '30 años (salud laboral)',
    complianceNotes: 'Datos de salud laboral con retención extendida'
  },
  {
    id: 'alimentos',
    name: 'Alimentos y Bebidas',
    icon: FoodIcon,
    color: '#be185d',
    regulations: ['Ley 21.719', 'Código Sanitario', 'Trazabilidad HACCP'],
    specialRequirements: 'Trazabilidad alimentaria - Seguridad sanitaria',
    riskLevel: 'MEDIO',
    defaultRetention: '2 años',
    complianceNotes: 'Trazabilidad completa cadena de suministro'
  },
  {
    id: 'transporte',
    name: 'Transporte y Logística',
    icon: TransportIcon,
    color: '#9333ea',
    regulations: ['Ley 21.719', 'Ley Tránsito', 'Normativa MTT'],
    specialRequirements: 'Datos de ubicación - Seguimiento GPS',
    riskLevel: 'ALTO',
    defaultRetention: '5 años',
    complianceNotes: 'Geolocalización requiere consentimiento explícito'
  },
  {
    id: 'general',
    name: 'General / Otros',
    icon: null,
    color: '#6b7280',
    regulations: ['Ley 21.719'],
    specialRequirements: 'Cumplimiento base LPDP',
    riskLevel: 'BAJO',
    defaultRetention: 'Según finalidad',
    complianceNotes: 'Aplicar principios generales LPDP'
  }
];

// Helper functions
export const getIndustryById = (id) => {
  return INDUSTRIES_CONFIG.find(industry => industry.id === id) || INDUSTRIES_CONFIG[INDUSTRIES_CONFIG.length - 1];
};

export const getIndustryRegulations = (industryId) => {
  const industry = getIndustryById(industryId);
  return industry?.regulations || ['Ley 21.719'];
};

export const getIndustryRiskLevel = (industryId) => {
  const industry = getIndustryById(industryId);
  return industry?.riskLevel || 'BAJO';
};

export const getIndustryRetention = (industryId) => {
  const industry = getIndustryById(industryId);
  return industry?.defaultRetention || 'Según finalidad';
};

export const requiresEIPD = (industryId) => {
  const riskLevel = getIndustryRiskLevel(industryId);
  return riskLevel === 'ALTO' || riskLevel === 'CRITICO';
};

export default INDUSTRIES_CONFIG;