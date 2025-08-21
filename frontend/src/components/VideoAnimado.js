import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  LinearProgress,
  Paper,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeMute,
  Fullscreen,
} from '@mui/icons-material';

const VideoAnimado = ({ 
  frames, 
  titulo, 
  autoPlay = false, 
  loop = true,
  duracionFrame = 3000,
  height = 400,
  gradiente = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    let interval;
    if (isPlaying && frames.length > 0) {
      interval = setInterval(() => {
        setCurrentFrame((prev) => {
          const next = (prev + 1) % frames.length;
          setProgress(((next + 1) / frames.length) * 100);
          
          // Si llegamos al final y no es loop, pausar
          if (next === 0 && !loop) {
            setIsPlaying(false);
            return prev;
          }
          
          return next;
        });
      }, duracionFrame);
    }
    return () => clearInterval(interval);
  }, [isPlaying, frames.length, duracionFrame, loop]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = () => {
    setMuted(!muted);
  };

  const handleFrameClick = (frameIndex) => {
    setCurrentFrame(frameIndex);
    setProgress(((frameIndex + 1) / frames.length) * 100);
  };

  if (!frames || frames.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography>No hay contenido de video disponible</Typography>
      </Paper>
    );
  }

  const currentFrameData = frames[currentFrame];

  return (
    <Paper 
      sx={{ 
        p: 3, 
        background: gradiente,
        color: 'white',
        position: 'relative',
        minHeight: height,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        cursor: 'pointer'
      }}
      onClick={handlePlayPause}
    >
      {/* Título del video */}
      {titulo && (
        <Typography 
          variant="h6" 
          sx={{ 
            position: 'absolute', 
            top: 16, 
            left: 16,
            bgcolor: 'rgba(0,0,0,0.5)',
            padding: '4px 12px',
            borderRadius: '4px',
            fontSize: '0.9rem'
          }}
        >
          {titulo}
        </Typography>
      )}

      {/* Contenido animado */}
      <Box sx={{ textAlign: 'center', maxWidth: '90%' }}>
          {/* Icono principal */}
          <Box
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <Typography variant="h1" sx={{ fontSize: '5rem', mb: 2, textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              {currentFrameData.icon}
            </Typography>
          </Box>
          
          {/* Título del frame */}
          <Box
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Typography variant="h4" gutterBottom sx={{ 
              fontWeight: 700, 
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              mb: 2
            }}>
              {currentFrameData.title}
            </Typography>
          </Box>

          {/* Contenido principal */}
          <Box
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Typography variant="h6" sx={{ 
              mb: 2, 
              opacity: 0.95,
              fontWeight: 500,
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}>
              {currentFrameData.content}
            </Typography>
          </Box>

          {/* Descripción */}
          <Box
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Typography variant="body1" sx={{ 
              opacity: 0.85,
              maxWidth: '80%',
              margin: '0 auto',
              lineHeight: 1.6
            }}>
              {currentFrameData.description}
            </Typography>
          </Box>

          {/* Datos adicionales si existen */}
          {currentFrameData.data && (
            <Box
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1 }}
            >
              <Box sx={{ 
                mt: 3, 
                p: 2, 
                bgcolor: 'rgba(255,255,255,0.1)', 
                borderRadius: 2,
                backdropFilter: 'blur(10px)'
              }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {currentFrameData.data}
                </Typography>
              </Box>
            </Box>
          )}
      </Box>

      {/* Controles del video */}
      <Box 
        sx={{ 
          position: 'absolute', 
          bottom: 16, 
          left: 16, 
          right: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          bgcolor: 'rgba(0,0,0,0.5)',
          padding: '8px 16px',
          borderRadius: '8px',
          backdropFilter: 'blur(10px)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <IconButton 
          onClick={handlePlayPause}
          sx={{ color: 'white' }}
          size="small"
        >
          {isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>
        
        <Box sx={{ flexGrow: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 6, 
              borderRadius: 3,
              bgcolor: 'rgba(255,255,255,0.3)',
              '& .MuiLinearProgress-bar': {
                bgcolor: 'white',
                borderRadius: 3
              }
            }}
          />
        </Box>

        <Typography variant="caption" sx={{ minWidth: 60, fontSize: '0.75rem' }}>
          {currentFrame + 1}/{frames.length}
        </Typography>

        <IconButton 
          onClick={handleMuteToggle}
          sx={{ color: 'white' }}
          size="small"
        >
          {muted ? <VolumeMute /> : <VolumeUp />}
        </IconButton>
      </Box>

      {/* Indicadores de frame */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 16, 
          right: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {frames.map((_, index) => (
          <Box
            key={index}
            onClick={() => handleFrameClick(index)}
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: index === currentFrame ? 'white' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              border: '2px solid rgba(255,255,255,0.6)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.8)',
                transform: 'scale(1.2)'
              }
            }}
          />
        ))}
      </Box>

      {/* Estado de reproducción */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: isPlaying ? 0 : 0.8,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none'
        }}
      >
        <PlayArrow sx={{ fontSize: '4rem', color: 'white', filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))' }} />
      </Box>
    </Paper>
  );
};

export default VideoAnimado;