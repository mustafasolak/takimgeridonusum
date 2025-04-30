import React, { useState, useEffect } from 'react';
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
  IconButton,
  Link
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

  const [goalSound] = useState(() => new Howl({
    src: ['/goal.mp3'],
    volume: isSoundOn ? 1 : 0,
    preload: true,
    html5: true
  }));

  const toggleSound = () => {
    const newState = !isSoundOn;
    setIsSoundOn(newState);
    localStorage.setItem('soundEnabled', JSON.stringify(newState));
    goalSound.volume(newState ? 1 : 0);
    
    // Test sound when turning on
    if (newState) {
      goalSound.play();
    }
  };

  const handleOpenModal = (modalId) => {
    const menuItem = menuItems.find(item => item.id === modalId);
    if (menuItem && menuItem.type === 'link') {
      window.open(menuItem.url, '_blank');
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
              goalSound.play();
            }
          }
        }
      });
    });

    return () => unsubscribe();
  }, [isSoundOn, goalSound]);

  const TeamScore = ({ team, total, delta }) => {
    const teamConfig = {
      gs: {
        name: 'GALATASARAY',
        color: '#F4C430',
        logo: '/gs-logo.png',
        gradient: 'linear-gradient(135deg, rgba(241, 196, 15, 0.9) 0%, rgba(230, 126, 34, 0.9) 100%)',
        recyclingColor: '#FFA500'
      },
      fb: {
        name: 'FENERBAHÇE',
        color: '#E30A17',
        logo: '/fb-logo.png',
        gradient: 'linear-gradient(135deg, rgba(52, 152, 219, 0.9) 0%, rgba(41, 128, 185, 0.9) 100%)',
        recyclingColor: '#00BFFF'
      },
      ts: {
        name: 'BEŞİKTAŞ',
        color: '#E4002B',
        logo: '/bjk-logo.png',
        gradient: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.9) 100%)',
        recyclingColor: '#FF0000'
      }
    };

    const config = teamConfig[team];

    return (
      <Grid item xs={12} md={4}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ 
            scale: 1.05,
            transition: { duration: 0.3 }
          }}
        >
          <Paper
            elevation={8}
            sx={{
              p: 4,
              m: 2,
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.85)',
              color: '#2c3e50',
              borderRadius: '20px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
              backdropFilter: 'blur(5px)',
              '&:hover': {
                boxShadow: `0 0 20px ${config.recyclingColor}, 0 0 40px ${config.recyclingColor}`,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '20px',
                  padding: '2px',
                  background: `linear-gradient(45deg, ${config.recyclingColor}, ${config.color})`,
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                  animation: 'glow 2s linear infinite',
                }
              }
            }}
          >
            <style>
              {`
                @keyframes glow {
                  0% {
                    box-shadow: 0 0 20px ${config.recyclingColor}, 0 0 40px ${config.recyclingColor};
                  }
                  50% {
                    box-shadow: 0 0 30px ${config.recyclingColor}, 0 0 60px ${config.recyclingColor};
                  }
                  100% {
                    box-shadow: 0 0 20px ${config.recyclingColor}, 0 0 40px ${config.recyclingColor};
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
                    width: '80px',
                    height: '80px',
                    objectFit: 'contain',
                    mb: 2,
                    filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
                  }}
                />
              </motion.div>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 'bold',
                  color: '#34495e',
                  mb: 3
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
                        color: '#2c3e50',
                        fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' }
                      }}
                    >
                      {total}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        color: '#7f8c8d',
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
                    label={`+${delta} Yeni Şişe!`}
                    sx={{
                      bgcolor: '#2ecc71',
                      color: 'white',
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
        background: `linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7)), url('/bg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        position: 'relative',
        overflow: 'hidden',
        pt: 4,
        pb: 8
      }}
    >
      <AppBar position="fixed" sx={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#2c3e50' }}>
            Geri Dönüşüm Taraftar Sitesi
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            <Button color="inherit" onClick={() => handleOpenModal('recycling-info')} sx={{ color: '#2c3e50' }}>
              <RecyclingIcon sx={{ mr: 1, color: '#2c3e50' }} />
              Geri Dönüşüm Nedir?
            </Button>
            <Button color="inherit" onClick={() => handleOpenModal('how-to-recycle')} sx={{ color: '#2c3e50' }}>
              <EmojiNatureIcon sx={{ mr: 1, color: '#2c3e50' }} />
              Doğaya Faydaları
            </Button>
            <Button color="inherit" onClick={() => handleOpenModal('external-resources')} sx={{ color: '#2c3e50' }}>
              <InfoIcon sx={{ mr: 1, color: '#2c3e50' }} />
              Bilgi
            </Button>
            <IconButton 
              onClick={toggleSound} 
              sx={{ color: '#2c3e50' }}
              title={isSoundOn ? "Sesi Kapat" : "Sesi Aç"}
            >
              {isSoundOn ? <VolumeUpIcon /> : <VolumeOffIcon />}
            </IconButton>
          </Box>
          <IconButton
            color="inherit"
            edge="end"
            onClick={() => setMobileMenuOpen(true)}
            sx={{ display: { xs: 'flex', md: 'none' }, color: '#2c3e50' }}
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
              onClick={() => item.type === 'link' ? window.open(item.url, '_blank') : handleOpenModal(item.id)}
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

      {menuItems.filter(item => item.type !== 'link').map((item) => (
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

      {/* Decorative Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          zIndex: 0,
          background: `
            radial-gradient(circle at 10% 20%, rgba(46, 204, 113, 0.6) 0%, transparent 35%),
            radial-gradient(circle at 90% 30%, rgba(52, 152, 219, 0.6) 0%, transparent 35%),
            radial-gradient(circle at 50% 80%, rgba(241, 196, 15, 0.6) 0%, transparent 35%)
          `
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>


        <Grid container spacing={3} justifyContent="center">
          <TeamScore team="gs" total={scores.gs_total} delta={scores.gs_delta} />
          <TeamScore team="fb" total={scores.fb_total} delta={scores.fb_delta} />
          <TeamScore team="ts" total={scores.ts_total} delta={scores.ts_delta} />
        </Grid>

        <Box
          sx={{
            textAlign: 'center',
            mb: 6,
            background: 'rgba(255, 255, 255, 0.85)',
            borderRadius: '20px',
            p: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            sx={{
              color: '#2c3e50',
              fontWeight: 'bold',
              mb: 2,
              fontSize: { xs: '2rem', sm: '3rem' }
            }}
          >
            GERİ DÖNÜŞÜM YARIŞMASI
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: '#27ae60',
              fontWeight: 'medium',
              mb: 1
            }}
          >
            Takımını Destekle, Çevreyi Koru!
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#7f8c8d',
              maxWidth: '600px',
              mx: 'auto',
              px: 2
            }}
          >
            Her atılan şişe, daha temiz bir gelecek için atılan bir adımdır.
            Haydi sen de takımını destekleyerek çevreyi koru!
          </Typography>
        </Box>

        <Box
          sx={{
            textAlign: 'center',
            mt: 6,
            background: 'rgba(255, 255, 255, 0.85)',
            borderRadius: '15px',
            p: 2,
            maxWidth: '500px',
            mx: 'auto',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: '#95a5a6'
            }}
          >
            Bu proje, geri dönüşümü eğlenceli hale getirerek çevre bilincini artırmayı amaçlamaktadır.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default App; 