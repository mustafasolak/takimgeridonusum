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
        if (change.type === 'added') {
          const newData = change.doc.data();
          setScores(newData);
          
          if (newData.gs_delta === 1 || newData.fb_delta === 1 || newData.ts_delta === 1) {
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


  const TeamScore = ({ team, total, delta }) => {
    const teamConfig = {
      gs: {
        name: 'GALATASARAY',
        color: '#F4C430',
        logo: '/gs-logo.png',
        gradient: 'linear-gradient(135deg, rgba(241, 196, 15, 0.9) 0%, rgba(230, 126, 34, 0.9) 100%)',
        borderColor: '#FFD700'
      },
      fb: {
        name: 'FENERBAHÇE',
        color: '#E30A17',
        logo: '/fb-logo.png',
        gradient: 'linear-gradient(135deg, rgba(52, 152, 219, 0.9) 0%, rgba(41, 128, 185, 0.9) 100%)',
        borderColor: '#00BFFF'
      },
      ts: {
        name: 'BEŞİKTAŞ',
        color: '#E4002B',
        logo: '/bjk-logo.png',
        gradient: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.9) 100%)',
        borderColor: '#FF0000'
      }
    };

    const config = teamConfig[team];

    return (
      <Grid item xs={12} sm={6} md={4}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ 
            scale: 1.02,
            transition: { duration: 0.2 }
          }}
        >
          <Paper
            elevation={8}
            sx={{
              p: { xs: 2, sm: 3, md: 4 },
              m: { xs: 1, sm: 1.5, md: 2 },
              textAlign: 'center',
              background: 'rgba(0, 0, 0, 0.7)',
              color: '#FFFFFF',
              borderRadius: '20px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: `0 0 20px ${config.borderColor}`,
              border: `2px solid ${config.borderColor}`,
              backdropFilter: 'blur(5px)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: `0 0 30px ${config.borderColor}`,
                transform: 'translateY(-5px)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '20px',
                  background: config.gradient,
                  opacity: 0.1,
                  transition: 'opacity 0.3s ease'
                }
              }
            }}
          >
            <style>
              {`
                @keyframes glow {
                  0% {
                    box-shadow: 0 0 20px ${config.borderColor}, 0 0 40px ${config.borderColor};
                  }
                  50% {
                    box-shadow: 0 0 30px ${config.borderColor}, 0 0 60px ${config.borderColor};
                  }
                  100% {
                    box-shadow: 0 0 20px ${config.borderColor}, 0 0 40px ${config.borderColor};
                  }
                }
              `}
            </style>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '8px',
                  background: config.gradient
                }}
              />
            </motion.div>
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.3 }}
              >
                <Box
                  component="img"
                  src={config.logo}
                  alt={`${config.name} Logo`}
                  sx={{
                    width: '100px',
                    height: '100px',
                    objectFit: 'contain',
                    mb: 2,
                    filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))'
                  }}
                />
              </motion.div>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 'bold',
                  color: '#FFFFFF',
                  mb: 3,
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                {config.name}
              </Typography>
              
              <Box
                sx={{
                  position: 'relative',
                  mb: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.4 }}
                >
                  <motion.div
                    key={total}
                    animate={{ rotate: 360 }}
                    transition={{ 
                      duration: 1,
                      ease: "easeInOut",
                      repeat: 1,
                      repeatType: "reverse"
                    }}
                  >
                    <Box
                      component="img"
                      src="/bottle-icon.png"
                      alt="Plastic Bottle"
                      sx={{
                        width: '40px',
                        height: '40px',
                        mb: 2,
                        opacity: 0.7
                      }}
                    />
                  </motion.div>
                </motion.div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={total}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  >
                    <Typography
                      variant="h2"
                      sx={{
                        fontWeight: 'bold',
                        color: '#FFFFFF',
                        fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' }
                      }}
                    >
                      {total}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        color: '#FFFFFF',
                        mt: 1
                      }}
                    >
                      Geri Dönüştürülen Şişe
                    </Typography>
                  </motion.div>
                </AnimatePresence>
              </Box>

              {delta > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.5 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.5 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  <Chip
                    label={`+${delta} GOL!`}
                    sx={{
                      bgcolor: config.borderColor,
                      color: '#FFFFFF',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      p: 2,
                      '& .MuiChip-label': {
                        px: 2
                      }
                    }}
                  />
                </motion.div>
              )}
            </Box>
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
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        backgroundAttachment: 'fixed'
      }}
    >
      <AppBar 
        position="fixed" 
        sx={{ 
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '2px solid #FFD700',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
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
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
              <Grid 
                container 
                spacing={2} 
                justifyContent="center"
                sx={{ 
                  mt: { xs: 1, md: 2 },
                  mb: { xs: 2, md: 4 }
                }}
              >
                <TeamScore team="gs" total={scores.gs_total} delta={scores.gs_delta} />
                <TeamScore team="fb" total={scores.fb_total} delta={scores.fb_delta} />
                <TeamScore team="ts" total={scores.ts_total} delta={scores.ts_delta} />
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

              <Box
                sx={{
                  textAlign: 'center',
                  mt: { xs: 2, md: 4 },
                  background: 'rgba(0, 0, 0, 0.7)',
                  borderRadius: '15px',
                  p: { xs: 2, sm: 2.5, md: 3 },
                  maxWidth: '500px',
                  mx: 'auto',
                  boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
                  border: '1px solid #FFD700'
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    color: '#FFD700',
                    fontWeight: 'bold',
                    mb: 1.2,
                    textTransform: 'uppercase',
                    fontSize: { xs: '1.0rem', sm: '1.2rem', md: '1.3rem' },
                    letterSpacing: '1px'
                  }}
                >
                  TAKIMINI DESTEKLE, ŞAMPİYON OL!
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#FFFFFF',
                    maxWidth: '400px',
                    mx: 'auto',
                    fontSize: { xs: '0.7rem', sm: '0.9rem' },
                    opacity: 0.9
                  }}
                >
                  Her atılan şişe, takımının puan hanesine yazılır.
                  Haydi sen de takımını destekleyerek şampiyonluğa koş!
                </Typography>
              </Box>
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