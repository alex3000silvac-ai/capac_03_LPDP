import React, { useState, useEffect, createContext, useContext } from 'react';
import { Tooltip, Alert, Snackbar, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { Help, LightbulbOutlined, WarningAmber, CheckCircle } from '@mui/icons-material';
import { supabase } from '../config/supabaseConfig';

const HelpContext = createContext();

export const useHelp = () => {
  const context = useContext(HelpContext);
  if (!context) {
    throw new Error('useHelp debe usarse dentro de HelpProvider');
  }
  return context;
};

class InteractiveHelper {
  constructor() {
    this.helpContent = new Map();
    this.userProgress = {};
    this.contextualTips = new Map();
  }

  async loadHelpContent() {
    try {
      const { data: content, error } = await supabase
        .from('help_content')
        .select('*')
        .eq('active', true);

      if (error) throw error;

      this.helpContent.clear();
      content.forEach(item => {
        this.helpContent.set(item.field_id, item);
      });

      return content;
    } catch (error) {
      console.error('Error cargando contenido de ayuda');
      return [];
    }
  }

  async getContextualHelp(fieldId, userContext = {}) {
    const helpItem = this.helpContent.get(fieldId);
    if (!helpItem) {
      return this.getDefaultHelp(fieldId);
    }

    let content = helpItem.content;
    let examples = helpItem.examples || [];

    if (userContext.industry && helpItem.industry_specific) {
      const industryHelp = helpItem.industry_specific[userContext.industry];
      if (industryHelp) {
        content = industryHelp.content || content;
        examples = industryHelp.examples || examples;
      }
    }

    if (userContext.ratType && helpItem.type_specific) {
      const typeHelp = helpItem.type_specific[userContext.ratType];
      if (typeHelp) {
        content = typeHelp.content || content;
        examples = [...examples, ...(typeHelp.examples || [])];
      }
    }

    await this.logHelpUsage(fieldId, userContext.userId);

    return {
      title: helpItem.title,
      content: content,
      examples: examples,
      legalReference: helpItem.legal_reference,
      tips: helpItem.tips || [],
      difficulty: helpItem.difficulty || 'medium',
      estimatedTime: helpItem.estimated_time || '2-3 minutos'
    };
  }

  getDefaultHelp(fieldId) {
    const defaultHelps = {
      'responsable': {
        title: 'Identificación del Responsable',
        content: 'Ingresa los datos de la empresa u organización responsable del tratamiento de datos.',
        examples: ['Empresa SpA', 'Fundación XYZ', 'Municipalidad de Santiago'],
        tips: ['El RUT debe ser válido', 'Incluye datos de contacto actualizados']
      },
      'finalidad': {
        title: 'Finalidad del Tratamiento',
        content: 'Describe específicamente para qué se usan los datos personales.',
        examples: ['Gestión de nómina de empleados', 'Envío de newsletter comercial', 'Proceso de selección de personal'],
        tips: ['Sé específico, evita términos vagos', 'Cada finalidad debe tener una base jurídica clara']
      }
    };

    return defaultHelps[fieldId] || {
      title: 'Ayuda',
      content: 'Completa este campo con información precisa.',
      examples: [],
      tips: []
    };
  }

  async logHelpUsage(fieldId, userId) {
    try {
      await supabase
        .from('help_usage_log')
        .insert({
          field_id: fieldId,
          user_id: userId,
          accessed_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging help usage');
    }
  }

  async getSmartSuggestions(fieldId, currentValue, context) {
    try {
      const { data: suggestions, error } = await supabase
        .rpc('get_smart_suggestions', {
          field_name: fieldId,
          current_text: currentValue,
          user_context: context
        });

      if (error) throw error;
      return suggestions || [];
    } catch (error) {
      console.error('Error obteniendo sugerencias');
      return [];
    }
  }

  async trackFieldProgress(fieldId, userId, completed, timeSpent) {
    try {
      await supabase
        .from('field_progress')
        .upsert({
          field_id: fieldId,
          user_id: userId,
          completed: completed,
          time_spent: timeSpent,
          last_updated: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error tracking field progress');
    }
  }

  async getPersonalizedTips(userId, currentStep) {
    try {
      const { data: userStats, error } = await supabase
        .from('user_help_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      const tips = [];

      if (!userStats || userStats.help_usage_count < 3) {
        tips.push({
          type: 'beginner',
          message: 'Usa los íconos de ayuda (?) para obtener guías detalladas',
          icon: 'help'
        });
      }

      if (userStats?.average_time_per_step > 300) {
        tips.push({
          type: 'efficiency',
          message: 'Tip: Usa las sugerencias automáticas para completar más rápido',
          icon: 'lightbulb'
        });
      }

      const stepSpecificTips = await this.getStepSpecificTips(currentStep, userStats);
      tips.push(...stepSpecificTips);

      return tips;
    } catch (error) {
      console.error('Error obteniendo tips personalizados');
      return [];
    }
  }

  async getStepSpecificTips(step, userStats) {
    const stepTips = {
      'identificacion_responsable': [
        {
          type: 'validation',
          message: 'El RUT será validado automáticamente',
          icon: 'check'
        }
      ],
      'categorias_datos': [
        {
          type: 'alert',
          message: 'Seleccionar datos sensibles activará alertas automáticas',
          icon: 'warning'
        }
      ],
      'transferencias': [
        {
          type: 'legal',
          message: 'Transferencias internacionales requieren garantías específicas',
          icon: 'gavel'
        }
      ]
    };

    return stepTips[step] || [];
  }

  async updateUserHelpStats(userId, action) {
    try {
      const { data: existing, error: fetchError } = await supabase
        .from('user_help_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      let updateData = {
        user_id: userId,
        last_help_used: new Date().toISOString()
      };

      if (fetchError && fetchError.code === 'PGRST116') {
        updateData = {
          ...updateData,
          help_usage_count: 1,
          total_time_saved: 0,
          average_time_per_step: 0,
          created_at: new Date().toISOString()
        };
      } else if (existing) {
        updateData = {
          ...updateData,
          help_usage_count: (existing.help_usage_count || 0) + 1,
          total_time_saved: existing.total_time_saved || 0,
          average_time_per_step: existing.average_time_per_step || 0
        };
      }

      const { error } = await supabase
        .from('user_help_stats')
        .upsert(updateData);

      if (error) throw error;
    } catch (error) {
      console.error('Error actualizando stats de ayuda');
    }
  }
}

export const HelpProvider = ({ children }) => {
  const [helper] = useState(() => new InteractiveHelper());
  const [helpContent, setHelpContent] = useState(new Map());
  const [currentTooltip, setCurrentTooltip] = useState(null);
  const [smartAlerts, setSmartAlerts] = useState([]);

  useEffect(() => {
    helper.loadHelpContent().then(content => {
      const contentMap = new Map();
      content.forEach(item => {
        contentMap.set(item.field_id, item);
      });
      setHelpContent(contentMap);
    });
  }, [helper]);

  const showHelp = async (fieldId, userContext = {}) => {
    const help = await helper.getContextualHelp(fieldId, userContext);
    setCurrentTooltip({ fieldId, help });
    return help;
  };

  const hideHelp = () => {
    setCurrentTooltip(null);
  };

  const addSmartAlert = (alert) => {
    setSmartAlerts(prev => [...prev, { ...alert, id: Date.now() }]);
  };

  const removeSmartAlert = (alertId) => {
    setSmartAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const value = {
    showHelp,
    hideHelp,
    addSmartAlert,
    removeSmartAlert,
    currentTooltip,
    smartAlerts,
    helper
  };

  return (
    <HelpContext.Provider value={value}>
      {children}
      <SmartAlertSystem alerts={smartAlerts} onRemove={removeSmartAlert} />
      <ContextualTooltip tooltip={currentTooltip} onClose={hideHelp} />
    </HelpContext.Provider>
  );
};

const SmartAlertSystem = ({ alerts, onRemove }) => {
  return (
    <>
      {alerts.map(alert => (
        <Snackbar
          key={alert.id}
          open={true}
          autoHideDuration={alert.autoHide ? 6000 : null}
          onClose={() => onRemove(alert.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            severity={alert.severity} 
            onClose={() => onRemove(alert.id)}
            action={alert.action}
          >
            {alert.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

const ContextualTooltip = ({ tooltip, onClose }) => {
  if (!tooltip) return null;

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {tooltip.help.title}
        <IconButton
          aria-label="cerrar"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          ×
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <div dangerouslySetInnerHTML={{ __html: tooltip.help.content }} />
        
        {tooltip.help.examples.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <strong>Ejemplos:</strong>
            <ul>
              {tooltip.help.examples.map((example, index) => (
                <li key={index}>{example}</li>
              ))}
            </ul>
          </div>
        )}

        {tooltip.help.tips.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <strong>Tips:</strong>
            <ul>
              {tooltip.help.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {tooltip.help.legalReference && (
          <div style={{ marginTop: 16, padding: 8, backgroundColor: '#f5f5f5' }}>
            <strong>Referencia Legal:</strong> {tooltip.help.legalReference}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export const HelpButton = ({ fieldId, size = 'small', variant = 'icon' }) => {
  const { showHelp } = useHelp();

  const handleClick = () => {
    showHelp(fieldId);
  };

  if (variant === 'icon') {
    return (
      <Tooltip title="Ver ayuda detallada">
        <IconButton size={size} onClick={handleClick} color="primary">
          <Help fontSize={size} />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <button onClick={handleClick} style={{ background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer' }}>
      ¿Cómo completar esto?
    </button>
  );
};

export const SmartValidationAlert = ({ validation, onAction }) => {
  const { addSmartAlert } = useHelp();

  useEffect(() => {
    if (validation && !validation.valid) {
      addSmartAlert({
        severity: 'error',
        message: `Error de validación: ${validation.errors?.[0] || 'Datos inválidos'}`,
        autoHide: false,
        action: onAction
      });
    }
  }, [validation, addSmartAlert, onAction]);

  return null;
};

export const ProgressIndicator = ({ currentStep, totalSteps, stepNames = [] }) => {
  const steps = stepNames.length > 0 ? stepNames : [
    'Responsable',
    'Finalidad', 
    'Categorías',
    'Transferencias',
    'Seguridad',
    'Revisión'
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0' }}>
      {steps.map((stepName, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: index < currentStep ? '#4caf50' : 
                           index === currentStep ? '#2196f3' : '#e0e0e0',
            color: index <= currentStep ? 'white' : '#666',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            {index < currentStep ? '✓' : index + 1}
          </div>
          <div style={{ 
            marginLeft: 8, 
            marginRight: 16,
            fontSize: '12px',
            color: index <= currentStep ? '#000' : '#666'
          }}>
            {stepName}
          </div>
          {index < steps.length - 1 && (
            <div style={{
              width: 24,
              height: 2,
              backgroundColor: index < currentStep ? '#4caf50' : '#e0e0e0',
              marginRight: 16
            }} />
          )}
        </div>
      ))}
    </div>
  );
};

export const InlineHelper = ({ fieldId, userContext, children }) => {
  const [showTip, setShowTip] = useState(false);
  const [tipContent, setTipContent] = useState(null);
  const { helper } = useHelp();

  useEffect(() => {
    if (fieldId) {
      helper.getPersonalizedTips(userContext?.userId, fieldId)
        .then(tips => {
          if (tips.length > 0) {
            setTipContent(tips[0]);
            setShowTip(true);
          }
        });
    }
  }, [fieldId, userContext, helper]);

  return (
    <div style={{ position: 'relative' }}>
      {children}
      {showTip && tipContent && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: '#e3f2fd',
          border: '1px solid #2196f3',
          borderRadius: 4,
          padding: 8,
          fontSize: '12px',
          marginTop: 4,
          zIndex: 1000
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <LightbulbOutlined style={{ fontSize: 16, color: '#2196f3', marginRight: 4 }} />
            {tipContent.message}
            <IconButton
              size="small"
              onClick={() => setShowTip(false)}
              style={{ marginLeft: 'auto' }}
            >
              ×
            </IconButton>
          </div>
        </div>
      )}
    </div>
  );
};

export const RealTimeValidator = ({ fieldId, value, onValidation }) => {
  const [validationState, setValidationState] = useState({ valid: true, message: '' });
  const { helper } = useHelp();

  useEffect(() => {
    if (value && value.length > 3) {
      const validateField = async () => {
        try {
          const validation = await helper.validateFieldValue(fieldId, value);
          setValidationState(validation);
          if (onValidation) {
            onValidation(validation);
          }
        } catch (error) {
          setValidationState({ valid: false, message: 'Error de validación' });
        }
      };

      const debounceTimer = setTimeout(validateField, 500);
      return () => clearTimeout(debounceTimer);
    }
  }, [value, fieldId, helper, onValidation]);

  if (validationState.valid) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      color: '#f44336',
      fontSize: '12px',
      marginTop: 4
    }}>
      <WarningAmber style={{ fontSize: 16, marginRight: 4 }} />
      {validationState.message}
    </div>
  );
};

class CompletionAssistant {
  constructor() {
    this.templates = new Map();
  }

  async loadTemplates() {
    try {
      const { data: templates, error } = await supabase
        .from('completion_templates')
        .select('*')
        .eq('active', true);

      if (error) throw error;

      this.templates.clear();
      templates.forEach(template => {
        this.templates.set(template.field_id, template);
      });
    } catch (error) {
      console.error('Error cargando templates');
    }
  }

  async suggestCompletion(fieldId, partialValue, context) {
    const template = this.templates.get(fieldId);
    if (!template) return [];

    try {
      const { data: suggestions, error } = await supabase
        .rpc('generate_completion_suggestions', {
          field_type: fieldId,
          partial_text: partialValue,
          context_data: context
        });

      if (error) throw error;
      return suggestions || [];
    } catch (error) {
      console.error('Error sugiriendo completion');
      return [];
    }
  }

  async recordCompletion(fieldId, finalValue, wasSuggested, userId) {
    try {
      await supabase
        .from('completion_log')
        .insert({
          field_id: fieldId,
          final_value: finalValue,
          was_suggested: wasSuggested,
          user_id: userId,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error recording completion');
    }
  }
}

export const AutoCompleteField = ({ fieldId, value, onChange, userContext, ...props }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [assistant] = useState(() => new CompletionAssistant());

  useEffect(() => {
    assistant.loadTemplates();
  }, [assistant]);

  useEffect(() => {
    if (value && value.length > 10) {
      const getSuggestions = async () => {
        const sug = await assistant.suggestCompletion(fieldId, value, userContext);
        setSuggestions(sug);
        setShowSuggestions(sug.length > 0);
      };

      const debounceTimer = setTimeout(getSuggestions, 800);
      return () => clearTimeout(debounceTimer);
    } else {
      setShowSuggestions(false);
    }
  }, [value, fieldId, userContext, assistant]);

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion.text);
    setShowSuggestions(false);
    assistant.recordCompletion(fieldId, suggestion.text, true, userContext?.userId);
  };

  return (
    <div style={{ position: 'relative' }}>
      <textarea
        {...props}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />
      
      {showSuggestions && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: 4,
          maxHeight: 200,
          overflowY: 'auto',
          zIndex: 1000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              style={{
                padding: 12,
                cursor: 'pointer',
                borderBottom: index < suggestions.length - 1 ? '1px solid #eee' : 'none',
                ':hover': { backgroundColor: '#f5f5f5' }
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                {suggestion.title}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                {suggestion.preview}
              </div>
              <div style={{ fontSize: '10px', color: '#999', marginTop: 2 }}>
                Confianza: {Math.round(suggestion.confidence * 100)}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const interactiveHelper = new InteractiveHelper();

export default interactiveHelper;