import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Grid
} from '@mui/material';
import { collection, doc, setDoc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

function Admin() {
  const navigate = useNavigate();
  const [scores, setScores] = useState({
    gs_total: 0,
    fb_total: 0,
    ts_total: 0
  });
  const [loading, setLoading] = useState({
    gs: false,
    fb: false,
    ts: false
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Gerçek zamanlı skorları dinle
  useEffect(() => {
    const q = query(collection(db, 'scores'), orderBy('timestamp', 'desc'), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.forEach((doc) => {
        const data = doc.data();
        setScores({
          gs_total: data.gs_total || 0,
          fb_total: data.fb_total || 0,
          ts_total: data.ts_total || 0
        });
      });
    });

    return () => unsubscribe();
  }, []);

  const handleAddBottle = async (team) => {
    setLoading(prev => ({ ...prev, [team]: true }));

    try {
      const dayKey = dayjs().format('YYYY-MM-DD');
      const timestamp = Date.now();

      const newData = {
        gs_total: team === 'gs' ? scores.gs_total + 1 : scores.gs_total,
        fb_total: team === 'fb' ? scores.fb_total + 1 : scores.fb_total,
        ts_total: team === 'ts' ? scores.ts_total + 1 : scores.ts_total,
        gs_delta: team === 'gs' ? 1 : 0,
        fb_delta: team === 'fb' ? 1 : 0,
        ts_delta: team === 'ts' ? 1 : 0,
        dayKey: dayKey,
        timestamp: timestamp
      };

      // Doküman ID'si timestamp olmalı (ESP32 ile aynı format)
      await setDoc(doc(db, 'scores', timestamp.toString()), newData);

      setSnackbar({
        open: true,
        message: 'Şişe başarıyla eklendi! 🎉',
        severity: 'success'
      });
    } catch (error) {
      console.error('Hata:', error);
      setSnackbar({
        open: true,
        message: 'Hata oluştu: ' + error.message,
        severity: 'error'
      });
    } finally {
      setLoading(prev => ({ ...prev, [team]: false }));
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const teams = [
    {
      id: 'gs',
      name: 'GALATASARAY',
      color: '#FFD700',
      gradient: 'linear-gradient(135deg, rgba(241, 196, 15, 0.9) 0%, rgba(230, 126, 34, 0.9) 100%)',
      logo: '/gs-logo.png',
      total: scores.gs_total
    },
    {
      id: 'fb',
      name: 'FENERBAHÇE',
      color: '#00BFFF',
      gradient: 'linear-gradient(135deg, rgba(52, 152, 219, 0.9) 0%, rgba(41, 128, 185, 0.9) 100%)',
      logo: '/fb-logo.png',
      total: scores.fb_total
    },
    {
      id: 'ts',
      name: 'BEŞİKTAŞ',
      color: '#FFFFFF',
      gradient: 'linear-gradient(135deg, rgba(50, 50, 50, 0.9) 0%, rgba(0, 0, 0, 0.9) 100%)',
      logo: '/bjk-logo.png',
      total: scores.ts_total
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#1a1a1a', pt: 8 }}>
      <AppBar
        position="fixed"
        sx={{
          bgcolor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '2px solid #FFD700'
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              color: '#FFD700',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            ADMİN PANELİ
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography
          variant="h4"
          sx={{
            color: '#fff',
            mb: 4,
            textAlign: 'center',
            fontWeight: 'bold'
          }}
        >
          Manuel Skor Yönetimi
        </Typography>

        <Grid container spacing={3}>
          {teams.map((team) => (
            <Grid item xs={12} key={team.id}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Paper
                  elevation={8}
                  sx={{
                    p: 4,
                    background: 'rgba(0, 0, 0, 0.7)',
                    borderRadius: '20px',
                    border: `2px solid ${team.color}`,
                    boxShadow: `0 0 20px ${team.color}`,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '8px',
                      background: team.gradient
                    }
                  }}
                >
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 2
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        component="img"
                        src={team.logo}
                        alt={`${team.name} Logo`}
                        sx={{
                          width: '60px',
                          height: '60px',
                          objectFit: 'contain',
                          filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))'
                        }}
                      />
                      <Box>
                        <Typography
                          variant="h5"
                          sx={{
                            color: team.color,
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                          }}
                        >
                          {team.name}
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{
                            color: '#fff',
                            fontWeight: 'bold'
                          }}
                        >
                          {team.total} şişe
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => handleAddBottle(team.id)}
                      disabled={loading[team.id]}
                      sx={{
                        bgcolor: team.color,
                        color: team.id === 'ts' ? '#000' : '#000',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        px: 4,
                        py: 1.5,
                        borderRadius: '12px',
                        boxShadow: `0 4px 15px ${team.color}50`,
                        '&:hover': {
                          bgcolor: team.color,
                          transform: 'translateY(-2px)',
                          boxShadow: `0 6px 20px ${team.color}80`
                        },
                        '&:disabled': {
                          bgcolor: 'rgba(255,255,255,0.2)',
                          color: 'rgba(255,255,255,0.5)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {loading[team.id] ? (
                        <CircularProgress size={24} sx={{ color: '#000' }} />
                      ) : (
                        '+ 1 ŞİŞE EKLE'
                      )}
                    </Button>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
            Butona her tıkladığınızda ilgili takımın skoru 1 artacaktır.
          </Typography>
        </Box>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Admin;
