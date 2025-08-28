// VERSION SIMPLIFICADA DEL AUTO-SCROLL
// Para reemplazar en ModuloCero.js líneas 1005-1094

  // Auto-scroll SIMPLE - SIN MÚLTIPLES INTERVALOS
  useEffect(() => {
    // Limpiar cualquier intervalo anterior
    if (intervalRef.current) clearTimeout(intervalRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    if (isPlaying && !isCompleted) {
      const slideData = slides[currentSlide];
      const duration = slideData.duration;
      
      setSlideProgress(0);
      
      // Scroll al inicio
      if (contentScrollRef.current) {
        contentScrollRef.current.scrollTop = 0;
      }

      // Narración
      if (audioEnabled) {
        setTimeout(() => {
          if (slideData.narration) {
            if ('speechSynthesis' in window) {
              window.speechSynthesis.cancel();
              const utterance = new SpeechSynthesisUtterance(slideData.narration);
              utterance.rate = 0.8;
              utterance.pitch = 1.0;
              utterance.volume = 0.95;
              window.speechSynthesis.speak(utterance);
            }
          }
        }, 1000);
      }
      
      // UN SOLO INTERVALO para progreso + scroll
      let step = 0;
      const totalSteps = 100;
      const stepTime = duration / totalSteps;
      
      progressIntervalRef.current = setInterval(() => {
        step++;
        const progress = (step / totalSteps) * 100;
        setSlideProgress(Math.min(progress, 100));
        
        // Auto-scroll sencillo
        if (contentScrollRef.current && step < totalSteps) {
          const container = contentScrollRef.current;
          const maxScroll = container.scrollHeight - container.clientHeight;
          if (maxScroll > 0) {
            container.scrollTop = (progress / 100) * maxScroll;
          }
        }
      }, stepTime);
      
      // Cambio de slide
      intervalRef.current = setTimeout(() => {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        clearInterval(progressIntervalRef.current);
        setSlideProgress(100);
        
        setTimeout(() => {
          if (currentSlide < slides.length - 1) {
            setCurrentSlide(prev => prev + 1);
          } else {
            setIsPlaying(false);
            setIsCompleted(true);
          }
        }, 300);
      }, duration);
    }

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPlaying, currentSlide, audioEnabled, isCompleted, slides]);