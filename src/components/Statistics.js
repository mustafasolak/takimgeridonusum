import React, { useEffect, useMemo, useCallback, memo, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  IconButton,
  AppBar,
  Toolbar,
  CircularProgress,
  TextField,
  Alert
} from '@mui/material';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useNavigate } from 'react-router-dom';
import { useStatistics } from '../context/StatisticsContext';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';

// Winner Card Component
const WinnerCard = memo(({ winner, getTeamColor }) => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const trophyVariants = {
    initial: { 
      scale: 0,
      rotate: -180
    },
    animate: { 
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        duration: 1.5
      }
    },
    hover: {
      scale: 1.1,
      rotate: [0, -10, 10, -10, 10, 0],
      transition: {
        duration: 0.5
      }
    }
  };

  const getTeamLogo = (team) => {
    switch (team) {
      case 'GALATASARAY':
        return '/gs-logo.png';
      case 'FENERBAHÇE':
        return '/fb-logo.png';
      case 'BEŞİKTAŞ':
        return '/bjk-logo.png';
      default:
        return null;
    }
  };

  return (
    <>
      {winner.team !== 'BERABERE' && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={200}
          recycle={false}
          colors={[getTeamColor(winner.team), '#fff', '#gold']}
        />
      )}
      <Paper 
        elevation={3}
        sx={{
          p: 4,
          mb: 3,
          bgcolor: 'rgba(0, 0, 0, 0.7)',
          borderRadius: '15px',
          backdropFilter: 'blur(10px)',
          border: `2px solid ${getTeamColor(winner.team)}`,
          textAlign: 'center'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: 2,
          mb: 3
        }}>
          <Typography variant="h4" sx={{ color: getTeamColor(winner.team) }}>
            GÜNÜN GALİBİ
          </Typography>
          <motion.div
            initial="initial"
            animate="animate"
            whileHover="hover"
            variants={trophyVariants}
          >
            <EmojiEventsIcon 
              sx={{ 
                fontSize: '3rem',
                color: getTeamColor(winner.team),
                filter: `drop-shadow(0 0 10px ${getTeamColor(winner.team)})`
              }} 
            />
          </motion.div>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: 3
        }}>
          {winner.team !== 'BERABERE' && (
            <motion.img
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              src={getTeamLogo(winner.team)}
              alt={`${winner.team} Logo`}
              style={{
                width: '80px',
                height: '80px',
                objectFit: 'contain',
                filter: `drop-shadow(0 0 10px ${getTeamColor(winner.team)})`
              }}
            />
          )}
          <Typography variant="h3" sx={{ color: getTeamColor(winner.team) }}>
            {winner.team}
          </Typography>
        </Box>

        {winner.team !== 'BERABERE' && (
          <Typography variant="h5" sx={{ color: '#fff', mt: 2 }}>
            {winner.score} şişe
          </Typography>
        )}
      </Paper>
    </>
  );
});

// Team Stats Card Component
const TeamStatsCard = memo(({ team, score, color }) => (
  <Box sx={{ 
    p: 2, 
    bgcolor: `rgba(${color}, 0.1)`, 
    borderRadius: '10px',
    border: `1px solid ${color}`
  }}>
    <Typography variant="h6" sx={{ color }}>
      {team}: {score} şişe
    </Typography>
  </Box>
));

// Daily Stats Component
const DailyStatsCard = memo(({ dailyStats }) => (
  <Paper 
    elevation={3}
    sx={{
      p: 3,
      bgcolor: 'rgba(0, 0, 0, 0.7)',
      borderRadius: '15px',
      backdropFilter: 'blur(10px)'
    }}
  >
    <Typography variant="h5" sx={{ color: '#fff', mb: 3, textAlign: 'center' }}>
      GÜNLÜK TOPLAM
    </Typography>
    
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TeamStatsCard team="GALATASARAY" score={dailyStats.gs} color="#FFD700" />
      <TeamStatsCard team="FENERBAHÇE" score={dailyStats.fb} color="#00BFFF" />
      <TeamStatsCard team="BEŞİKTAŞ" score={dailyStats.ts} color="#FFFFFF" />
    </Box>
  </Paper>
));

function Statistics() {
  const {
    state: { selectedDate, dailyStats, loading, error, cache },
    setDate,
    setStats,
    setLoading,
    setError,
    updateCache,
    getCachedData
  } = useStatistics();
  
  const navigate = useNavigate();

  const getTeamColor = useCallback((team) => {
    switch (team) {
      case 'GALATASARAY':
        return '#FFD700';
      case 'FENERBAHÇE':
        return '#00BFFF';
      case 'BEŞİKTAŞ':
        return '#FFFFFF';
      default:
        return '#4CAF50';
    }
  }, []);

  const handleBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleDateChange = useCallback((e) => {
    setDate(e.target.value);
  }, [setDate]);

  const calculateWinner = useCallback((gs, fb, ts) => {
    if (gs === 0 && fb === 0 && ts === 0) {
      return { team: "BERABERE", score: 0 };
    }

    if (gs > fb && gs > ts) {
      return { team: "GALATASARAY", score: gs };
    } else if (fb > gs && fb > ts) {
      return { team: "FENERBAHÇE", score: fb };
    } else if (ts > gs && ts > fb) {
      return { team: "BEŞİKTAŞ", score: ts };
    }
    
    return { team: "BERABERE", score: Math.max(gs, fb, ts) };
  }, []);

  useEffect(() => {
    let isActive = true;

    const fetchData = async () => {
      if (!isActive) return;
      
      setError(null);
      
      // Check cache first
      const cachedStats = getCachedData(selectedDate);
      if (cachedStats) {
        setStats(cachedStats);
        return;
      }

      setLoading(true);
      try {
        const q = query(
          collection(db, "scores"),
          where("dayKey", "==", selectedDate)
        );

        const snapshot = await getDocs(q);
        let gs = 0, fb = 0, ts = 0;

        snapshot.forEach(doc => {
          const data = doc.data();
          gs += data.gs_delta || 0;
          fb += data.fb_delta || 0;
          ts += data.ts_delta || 0;
        });

        const winner = calculateWinner(gs, fb, ts);
        const newStats = { gs, fb, ts, winner };
        
        if (isActive) {
          updateCache(selectedDate, newStats);
          setStats(newStats);
        }
      } catch (error) {
        if (isActive) {
          console.error("Veri çekme hatası:", error);
          setError("Veriler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isActive = false;
    };
  }, [selectedDate, calculateWinner, getCachedData, updateCache]);

  const appBarStyle = useMemo(() => ({
    bgcolor: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(10px)'
  }), []);

  const datePickerStyle = useMemo(() => ({
    width: '100%',
    maxWidth: 300,
    '& .MuiOutlinedInput-root': {
      bgcolor: 'rgba(255, 255, 255, 0.05)',
      '&:hover': {
        bgcolor: 'rgba(255, 255, 255, 0.1)',
      }
    },
    '& .MuiOutlinedInput-input': {
      color: '#fff',
    },
    '& .MuiInputLabel-root': {
      color: '#fff',
    }
  }), []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#1a1a1a', pt: 8 }}>
      <AppBar position="fixed" sx={appBarStyle}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            component="div" 
            onClick={handleBack}
            sx={{ 
              flexGrow: 1,
              cursor: 'pointer',
              '&:hover': {
                color: '#FFD700',
                textShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            Günlük İstatistikler
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Box sx={{ mb: 4, mt: 4 }}>
          <TextField
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            sx={datePickerStyle}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <WinnerCard winner={dailyStats.winner} getTeamColor={getTeamColor} />
            <DailyStatsCard dailyStats={dailyStats} />
          </>
        )}
      </Container>
    </Box>
  );
}

export default memo(Statistics); 