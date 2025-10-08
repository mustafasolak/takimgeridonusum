import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Chip,
  AppBar,
  Toolbar,
  Button,
  Modal,
  IconButton
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import CloseIcon from '@mui/icons-material/Close';
import RecyclingIcon from '@mui/icons-material/Recycling';
import InfoIcon from '@mui/icons-material/Info';
import EmojiNatureIcon from '@mui/icons-material/EmojiNature';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useNavigate, Routes, Route } from 'react-router-dom';
import Statistics from './components/Statistics';
import Admin from './components/Admin';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: '70%', md: '50%' },
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  borderRadius: '20px',
  boxShadow: 24,
  p: 4,
  overflow: 'auto'
};

function App() {
  const [scores, setScores] = useState({
    gs_total: 0,
    fb_total: 0,
    ts_total: 0,
    gs_delta: 0,
    fb_delta: 0,
    ts_delta: 0
  });

  const [openModal, setOpenModal] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(() => {
    const saved = localStorage.getItem('soundEnabled');
    return saved ? JSON.parse(saved) : true;
  });

  const goalSoundRef = useRef(null);
  useEffect(() => {
    goalSoundRef.current = new Howl({
      src: ['/goal.mp3'],
      volume: isSoundOn ? 1 : 0,
      preload: true,
      html5: true
    });
  }, []);

  useEffect(() => {
    if (goalSoundRef.current) {
      goalSoundRef.current.volume(isSoundOn ? 1 : 0);
    }
  }, [isSoundOn]);

  const navigate = useNavigate();

  const toggleSound = () => {
    const newState = !isSoundOn;
    setIsSoundOn(newState);
    localStorage.setItem('soundEnabled', JSON.stringify(newState));
    if (goalSoundRef.current) {
      goalSoundRef.current.volume(newState ? 1 : 0);
    }
    // Test sound when turning on
    if (newState) {
      if (goalSoundRef.current) {
        goalSoundRef.current.play();
      }
    }
  };

  const handleOpenModal = (modalId) => {
    const menuItem = menuItems.find(item => item.id === modalId);
    if (menuItem && menuItem.type === 'link') {
      if (menuItem.onClick) {
        menuItem.onClick();
      } else if (menuItem.url) {
      window.open(menuItem.url, '_blank');
      }
    } else {
      setOpenModal(modalId);
    }
    setMobileMenuOpen(false);
  };

  const handleCloseModal = () => setOpenModal(null);

  const menuItems = [
    {
      id: 'recycling-info',
      title: 'Geri Dönüşüm Nedir?',
      icon: <RecyclingIcon />,
      content: (
        <>
          <Typography variant="h4" gutterBottom>Geri Dönüşüm Nedir?</Typography>
          <Typography paragraph>
            Geri dönüşüm, kullanılmış malzemelerin yeniden işlenerek ekonomiye kazandırılması sürecidir.
            Bu süreç, doğal kaynakların korunmasına ve çevre kirliliğinin azaltılmasına yardımcı olur.
          </Typography>
          <Typography paragraph>
            Plastik şişeler, geri dönüştürülebilen en yaygın malzemelerden biridir. Bir plastik şişenin
            doğada çözünmesi 400-450 yıl sürerken, geri dönüşümle yeni ürünlere dönüştürülebilir.
          </Typography>
          <Typography variant="h6" gutterBottom>Plastik Şişe Geri Dönüşümünün Faydaları:</Typography>
          <ul>
            <li>Enerji tasarrufu sağlar</li>
            <li>Çevre kirliliğini azaltır</li>
            <li>Hammadde ihtiyacını azaltır</li>
            <li>Ekonomiye katkı sağlar</li>
          </ul>
        </>
      )
    },
    {
      id: 'how-to-recycle',
      title: 'Nasıl Geri Dönüştürmeliyiz?',
      icon: <InfoIcon />,
      content: (
        <>
          <Typography variant="h4" gutterBottom>Doğru Geri Dönüşüm Adımları</Typography>
          <Typography paragraph>
            Plastik şişeleri doğru şekilde geri dönüştürmek için izlemeniz gereken adımlar:
          </Typography>
          <ol>
            <li>Şişeyi boşaltın ve durulayın</li>
            <li>Kapağını çıkarın (ayrıca geri dönüştürülebilir)</li>
            <li>Mümkünse hacmini azaltmak için sıkıştırın</li>
            <li>Geri dönüşüm kutusuna atın</li>
          </ol>
          <Typography variant="h6" gutterBottom>Önemli Notlar:</Typography>
          <Typography paragraph>
            - Kirli şişeler geri dönüşüm sürecini zorlaştırır<br />
            - Etiketleri çıkarmanıza gerek yok<br />
            - Şişeleri birbirinin içine sıkıştırmayın
          </Typography>
        </>
      )
    },
    {
      id: 'external-resources',
      title: 'Bilgi',
      icon: <InfoIcon />,
      type: 'link',
      url: 'https://cevreonline.com/geri-donusum/',
      content: 'Daha fazla bilgi için tıklayın'
    },
    {
      id: 'statistics',
      title: 'İstatistikler',
      icon: <BarChartIcon />,
      type: 'link',
      onClick: () => navigate('/statistics')
    },
    {
      id: 'admin',
      title: 'Admin Paneli',
      icon: <AdminPanelSettingsIcon />,
      type: 'link',
      onClick: () => navigate('/admin')
    }
  ];

  useEffect(() => {
    const q = query(collection(db, 'scores'), orderBy('timestamp', 'desc'), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          const newData = change.doc.data();
          console.log('🔥 Firebase data received:', newData);
          setScores(newData);

          if (newData.gs_delta === 1 || newData.fb_delta === 1 || newData.ts_delta === 1) {
            console.log('⚽ Goal detected!', { gs_delta: newData.gs_delta, fb_delta: newData.fb_delta, ts_delta: newData.ts_delta });
            if (isSoundOn) {
              if (goalSoundRef.current) {
                goalSoundRef.current.play();
              }
            }
          }
        }
      });
    });

    return () => unsubscribe();
  }, [isSoundOn]);


  const TeamScore = ({ team, total, delta, rank, maxScore }) => {
    const teamConfig = {
      gs: {
        name: 'GALATASARAY',
        shortName: 'GS',
        color: '#FFD700',
        logo: '/gs-logo.png',
        gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6B35 100%)',
        glowColor: 'rgba(255, 215, 0, 0.6)',
        borderGradient: 'linear-gradient(135deg, #FFD700 0%, #FF6B35 100%)',
        cardBg: 'linear-gradient(145deg, rgba(255, 215, 0, 0.08), rgba(255, 107, 53, 0.05))'
      },
      fb: {
        name: 'FENERBAHÇE',
        shortName: 'FB',
        color: '#FFE900',
        logo: '/fb-logo.png',
        gradient: 'linear-gradient(135deg, #FFE900 0%, #004D98 50%, #00B4FF 100%)',
        glowColor: 'rgba(0, 180, 255, 0.6)',
        borderGradient: 'linear-gradient(135deg, #FFE900 0%, #00B4FF 100%)',
        cardBg: 'linear-gradient(145deg, rgba(255, 233, 0, 0.08), rgba(0, 77, 152, 0.08))'
      },
      ts: {
        name: 'BEŞİKTAŞ',
        shortName: 'BJK',
        color: '#F0F0F0',
        logo: '/bjk-logo.png',
        gradient: 'linear-gradient(135deg, #FFFFFF 0%, #B0B0B0 50%, #1A1A1A 100%)',
        glowColor: 'rgba(240, 240, 240, 0.6)',
        borderGradient: 'linear-gradient(135deg, #FFFFFF 0%, #666666 100%)',
        cardBg: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(100, 100, 100, 0.08))'
      }
    };

    const config = teamConfig[team];
    const percentage = maxScore > 0 ? (total / maxScore) * 100 : 0;

    const medals = ['🥇', '🥈', '🥉'];
    const isWinner = rank === 1;

    return (
      <Grid item xs={12} md={4}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: rank * 0.1,
            type: "spring",
            stiffness: 100
          }}
          whileHover={{
            scale: 1.05,
            transition: { duration: 0.3 }
          }}
        >
          <Paper
            elevation={isWinner ? 24 : 12}
            sx={{
              p: { xs: 3, sm: 4 },
              m: { xs: 1, sm: 2 },
              textAlign: 'center',
              background: `${config.cardBg}, linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)`,
              backdropFilter: 'blur(30px) saturate(200%)',
              border: `3px solid transparent`,
              borderRadius: '30px',
              position: 'relative',
              overflow: 'visible',
              transform: isWinner ? 'scale(1.08)' : 'scale(1)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isWinner
                ? `0 20px 60px ${config.glowColor}, 0 0 50px ${config.glowColor}, inset 0 0 60px ${config.glowColor}33`
                : `0 10px 40px rgba(0,0,0,0.4), inset 0 0 30px ${config.glowColor}22`,
              '&:hover': {
                transform: isWinner ? 'scale(1.12)' : 'scale(1.08)',
                boxShadow: `0 30px 90px ${config.glowColor}, 0 0 60px ${config.glowColor}, inset 0 0 80px ${config.glowColor}44`,
                border: `3px solid ${config.color}88`,
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -3,
                left: -3,
                right: -3,
                bottom: -3,
                background: config.borderGradient,
                borderRadius: '30px',
                zIndex: -1,
                opacity: isWinner ? 0.6 : 0.4,
                filter: 'blur(15px)',
                transition: 'opacity 0.4s'
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: config.gradient,
                borderRadius: '30px',
                zIndex: -2,
                opacity: 0.05,
                filter: 'blur(50px)'
              }
            }}
          >
            {/* Rank Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -15,
                  right: -15,
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  background: config.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  boxShadow: `0 10px 30px ${config.glowColor}`,
                  border: '4px solid rgba(255,255,255,0.2)',
                  zIndex: 10
                }}
              >
                {medals[rank - 1] || rank}
              </Box>
            </motion.div>

            {/* Logo */}
            <motion.div
              initial={{ scale: 0, rotateY: 180 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
            >
              <Box
                component="img"
                src={config.logo}
                alt={`${config.name} Logo`}
                sx={{
                  width: isWinner ? '140px' : '110px',
                  height: isWinner ? '140px' : '110px',
                  objectFit: 'contain',
                  mb: 2,
                  filter: `drop-shadow(0 0 20px ${config.glowColor})`,
                  transition: 'all 0.3s ease'
                }}
              />
            </motion.div>

            {/* Team Name */}
            <Typography
              variant={isWinner ? "h4" : "h5"}
              sx={{
                fontWeight: 900,
                background: config.gradient,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
                textTransform: 'uppercase',
                letterSpacing: '3px',
                textShadow: `0 0 30px ${config.glowColor}`
              }}
            >
              {config.shortName}
            </Typography>

            {/* Score Display */}
            <Box sx={{ mb: 3 }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={total}
                  initial={{ scale: 0.5, opacity: 0, rotateX: 90 }}
                  animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                  exit={{ scale: 0.5, opacity: 0, rotateX: -90 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <Typography
                    variant="h1"
                    sx={{
                      fontWeight: 900,
                      fontSize: isWinner ? '5rem' : '4rem',
                      color: config.color,
                      textShadow: `0 0 40px ${config.glowColor}, 0 0 80px ${config.glowColor}`,
                      lineHeight: 1
                    }}
                  >
                    {total}
                  </Typography>
                </motion.div>
              </AnimatePresence>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '0.9rem',
                  letterSpacing: '2px',
                  textTransform: 'uppercase'
                }}
              >
                Şişe
              </Typography>
            </Box>

            {/* Progress Bar */}
            <Box sx={{ width: '100%', mb: 2 }}>
              <Box
                sx={{
                  height: '12px',
                  borderRadius: '20px',
                  background: 'rgba(255,255,255,0.1)',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                  style={{
                    height: '100%',
                    background: config.gradient,
                    boxShadow: `0 0 20px ${config.glowColor}`,
                    borderRadius: '20px'
                  }}
                />
              </Box>
              <Typography
                variant="caption"
                sx={{
                  color: config.color,
                  fontSize: '0.75rem',
                  mt: 0.5,
                  display: 'block'
                }}
              >
                {percentage.toFixed(1)}% lider oranı
              </Typography>
            </Box>

            {/* Delta Badge */}
            {delta > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Chip
                  icon={<RecyclingIcon />}
                  label={`+${delta} YENİ!`}
                  sx={{
                    background: config.gradient,
                    color: team === 'ts' ? '#000' : '#fff',
                    fontWeight: 900,
                    fontSize: '0.9rem',
                    px: 1,
                    py: 2.5,
                    boxShadow: `0 5px 20px ${config.glowColor}`,
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.05)' }
                    }
                  }}
                />
              </motion.div>
            )}
          </Paper>
        </motion.div>
      </Grid>
    );
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: '64px',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        backgroundAttachment: 'fixed',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(252, 70, 107, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }
      }}
    >
      <AppBar
        position="fixed"
        sx={{
          background: 'linear-gradient(135deg, rgba(15, 12, 41, 0.85) 0%, rgba(48, 43, 99, 0.85) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '2px solid rgba(255, 215, 0, 0.3)',
          boxShadow: '0 4px 30px rgba(0,0,0,0.5), 0 0 20px rgba(255, 215, 0, 0.1)',
          zIndex: 1100
        }}
      >
        <Toolbar>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            flexGrow: 1
          }}>
            <RecyclingIcon sx={{ 
              color: '#4CAF50',
              mr: 1.5,
              fontSize: { xs: '1.8rem', sm: '2rem', md: '2.2rem' },
              animation: 'spin 4s linear infinite',
              '@keyframes spin': {
                '0%': {
                  transform: 'rotate(0deg)',
                },
                '100%': {
                  transform: 'rotate(360deg)',
                },
              },
              filter: 'drop-shadow(0 0 5px #4CAF50)'
            }} />
            <Typography 
              variant="h6" 
              component="div" 
              onClick={() => navigate('/')}
              sx={{ 
                color: '#FFFFFF',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.2rem' },
                cursor: 'pointer',
                '&:hover': {
                  color: '#FFD700',
                  textShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              TAKIM GERİ DÖNÜŞÜM YARIŞMASI
            </Typography>
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            <Button 
              color="inherit" 
              onClick={() => handleOpenModal('recycling-info')} 
              sx={{ 
                color: '#FFFFFF',
                '&:hover': {
                  backgroundColor: 'rgba(255, 215, 0, 0.1)',
                  color: '#FFD700'
                }
              }}
            >
              <RecyclingIcon sx={{ mr: 1, color: '#FFD700' }} />
              Geri Dönüşüm Nedir?
            </Button>
            <Button 
              color="inherit" 
              onClick={() => handleOpenModal('how-to-recycle')} 
              sx={{ 
                color: '#FFFFFF',
                '&:hover': {
                  backgroundColor: 'rgba(255, 215, 0, 0.1)',
                  color: '#FFD700'
                }
              }}
            >
              <EmojiNatureIcon sx={{ mr: 1, color: '#FFD700' }} />
              Doğaya Faydaları
            </Button>
            <Button 
              color="inherit" 
              onClick={() => handleOpenModal('external-resources')} 
              sx={{ 
                color: '#FFFFFF',
                '&:hover': {
                  backgroundColor: 'rgba(255, 215, 0, 0.1)',
                  color: '#FFD700'
                }
              }}
            >
              <InfoIcon sx={{ mr: 1, color: '#FFD700' }} />
              Bilgi
            </Button>
            <Button
              color="inherit"
              onClick={() => handleOpenModal('statistics')}
              sx={{
                color: '#FFFFFF',
                '&:hover': {
                  backgroundColor: 'rgba(255, 215, 0, 0.1)',
                  color: '#FFD700'
                }
              }}
            >
              <BarChartIcon sx={{ mr: 1, color: '#FFD700' }} />
              İstatistikler
            </Button>
            <Button
              color="inherit"
              onClick={() => handleOpenModal('admin')}
              sx={{
                color: '#FFFFFF',
                '&:hover': {
                  backgroundColor: 'rgba(255, 215, 0, 0.1)',
                  color: '#FFD700'
                }
              }}
            >
              <AdminPanelSettingsIcon sx={{ mr: 1, color: '#FFD700' }} />
              Admin
            </Button>
            <IconButton 
              onClick={toggleSound} 
              sx={{ 
                color: '#FFFFFF',
                '&:hover': {
                  backgroundColor: 'rgba(255, 215, 0, 0.1)',
                  color: '#FFD700'
                }
              }}
              title={isSoundOn ? "Sesi Kapat" : "Sesi Aç"}
            >
              {isSoundOn ? <VolumeUpIcon /> : <VolumeOffIcon />}
            </IconButton>
          </Box>
          <IconButton
            color="inherit"
            edge="end"
            onClick={() => setMobileMenuOpen(true)}
            sx={{ 
              display: { xs: 'flex', md: 'none' },
              color: '#FFFFFF',
              '&:hover': {
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                color: '#FFD700'
              }
            }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: '80%',
            maxWidth: '300px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }
        }}
      >
        <List>
          {menuItems.map((item) => (
            <ListItem 
              button 
              key={item.id}
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                } else if (item.type === 'link' && item.url) {
                  window.open(item.url, '_blank');
                } else {
                  handleOpenModal(item.id);
                }
                setMobileMenuOpen(false);
              }}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <ListItemIcon sx={{ color: '#2c3e50' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.title} sx={{ color: '#2c3e50' }} />
            </ListItem>
          ))}
          <ListItem 
            button 
            onClick={toggleSound}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            <ListItemIcon sx={{ color: '#2c3e50' }}>
              {isSoundOn ? <VolumeUpIcon /> : <VolumeOffIcon />}
            </ListItemIcon>
            <ListItemText primary={isSoundOn ? "Sesi Kapat" : "Sesi Aç"} sx={{ color: '#2c3e50' }} />
          </ListItem>
        </List>
      </Drawer>

      <Toolbar />

      <Routes>
        <Route path="/" element={
          <>
            <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
              {/* Hero Section */}
              <Box sx={{ textAlign: 'center', mb: 6, mt: 4 }}>
                <motion.div
                  initial={{ opacity: 0, y: -30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 900,
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 30%, #FF6B35 60%, #C74B50 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 2,
                      fontSize: { xs: '2rem', sm: '3rem', md: '3.5rem' },
                      letterSpacing: '2px',
                      filter: 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.4))',
                      animation: 'glow 3s ease-in-out infinite',
                      '@keyframes glow': {
                        '0%, 100%': {
                          filter: 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.4))'
                        },
                        '50%': {
                          filter: 'drop-shadow(0 0 50px rgba(255, 165, 0, 0.6))'
                        }
                      }
                    }}
                  >
                    🏆 GERİ DÖNÜŞÜM LİDERLİĞİ 🏆
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'rgba(255,255,255,0.85)',
                      fontSize: { xs: '0.9rem', sm: '1.1rem' },
                      maxWidth: '600px',
                      mx: 'auto',
                      letterSpacing: '1px',
                      textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                    }}
                  >
                    <Box component="span" sx={{ color: '#FFD700' }}>Takımını Destekle</Box> • <Box component="span" sx={{ color: '#4CAF50' }}>Dünyayı Kurtar</Box> • <Box component="span" sx={{ color: '#00B4FF' }}>Şampiyonluğu Kazan</Box>
                  </Typography>
                </motion.div>
              </Box>

              <Grid
                container
                spacing={3}
                justifyContent="center"
                alignItems="stretch"
                sx={{ mb: 6 }}
              >
                {(() => {
                  const teams = [
                    { team: 'gs', total: scores.gs_total, delta: scores.gs_delta },
                    { team: 'fb', total: scores.fb_total, delta: scores.fb_delta },
                    { team: 'ts', total: scores.ts_total, delta: scores.ts_delta }
                  ];

                  const sortedTeams = [...teams].sort((a, b) => b.total - a.total);
                  const maxScore = Math.max(...teams.map(t => t.total));

                  return sortedTeams.map((teamData, index) => (
                    <TeamScore
                      key={teamData.team}
                      team={teamData.team}
                      total={teamData.total}
                      delta={teamData.delta}
                      rank={index + 1}
                      maxScore={maxScore}
                    />
                  ));
                })()}
              </Grid>

              {menuItems.filter(item => !item.type).map((item) => (
                <Modal
                  key={item.id}
                  open={openModal === item.id}
                  onClose={handleCloseModal}
                  aria-labelledby={`modal-${item.id}`}
                >
                  <Box sx={modalStyle}>
                    <IconButton
                      onClick={handleCloseModal}
                      sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: 'grey.500'
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                    {item.content}
                  </Box>
                </Modal>
              ))}

              {/* Stats Summary */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <Box
                  sx={{
                    textAlign: 'center',
                    mt: 4,
                    mb: 4,
                    background: 'linear-gradient(145deg, rgba(76, 175, 80, 0.08), rgba(46, 125, 50, 0.05)), linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                    backdropFilter: 'blur(30px) saturate(200%)',
                    borderRadius: '25px',
                    p: { xs: 3, sm: 4 },
                    maxWidth: '700px',
                    mx: 'auto',
                    border: '2px solid rgba(76, 175, 80, 0.3)',
                    boxShadow: '0 10px 50px rgba(76, 175, 80, 0.3), inset 0 0 30px rgba(76, 175, 80, 0.1)',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -2,
                      left: -2,
                      right: -2,
                      bottom: -2,
                      background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
                      borderRadius: '25px',
                      zIndex: -1,
                      opacity: 0.3,
                      filter: 'blur(15px)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                    <RecyclingIcon
                      sx={{
                        fontSize: '3rem',
                        color: '#4CAF50',
                        mr: 1,
                        filter: 'drop-shadow(0 0 20px rgba(76,175,80,0.6))',
                        animation: 'spin 8s linear infinite',
                        '@keyframes spin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' }
                        }
                      }}
                    />
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 900,
                        background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 50%, #A5D6A7 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(0 0 30px rgba(76,175,80,0.5))'
                      }}
                    >
                      {scores.gs_total + scores.fb_total + scores.ts_total}
                    </Typography>
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'rgba(255,255,255,0.9)',
                      fontWeight: 700,
                      mb: 1,
                      letterSpacing: '2px'
                    }}
                  >
                    TOPLAM GERİ DÖNÜŞTÜRÜLEN ŞİŞE
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: { xs: '0.85rem', sm: '0.95rem' },
                      maxWidth: '500px',
                      mx: 'auto',
                      lineHeight: 1.8
                    }}
                  >
                    🌍 Her şişe bir fark yaratıyor • 🌱 Takımını destekle, dünyayı kurtar • 🏆 Birlikte daha iyisini başarabiliriz!
                  </Typography>
                </Box>
              </motion.div>
            </Container>
          </>
        } />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Box>
  );
}

export default App; 