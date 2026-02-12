import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { NavigationRoutes } from '../../constant';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Box sx={{ bgcolor: '#efefef', minHeight: '100vh' }}>
      <Box
        sx={{
          alignItems: 'center',
          backgroundColor: '#fff',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          px: 2.5,
          py: 1.6,
        }}>
        <img
          src="/assets/images/header_logo.svg"
          alt="Bemade"
          style={{ display: 'block', height: 56 }}
        />
      </Box>

      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 90px)',
          px: 2,
          py: 4,
        }}>
        <Box
          sx={{
            backgroundColor: '#f5f5f5',
            border: '1px solid #dfdfdf',
            borderRadius: 2,
            boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
            maxWidth: 460,
            p: 3.5,
            width: '100%',
          }}>
          <Link
            component="button"
            onClick={() => {
              window.location.assign(NavigationRoutes.Default);
            }}
            sx={{
              color: '#111',
              fontSize: 16,
              mb: 1.5,
              textDecoration: 'none',
            }}>
            Back
          </Link>

          <Typography
            sx={{
              fontSize: 44,
              fontWeight: 700,
              mb: 2.2,
              textAlign: 'center',
            }}>
            Login
          </Typography>

          <Typography sx={{ color: '#6f747a', fontSize: 16, mb: 0.8 }}>
            <Box component="span" sx={{ color: '#ff6d4a' }}>
              *
            </Box>{' '}
            Email
          </Typography>
          <TextField
            fullWidth
            size="small"
            sx={{ mb: 2.2 }}
            InputProps={{ sx: { borderRadius: 1.3 } }}
          />

          <Typography sx={{ color: '#6f747a', fontSize: 16, mb: 0.8 }}>
            <Box component="span" sx={{ color: '#ff6d4a' }}>
              *
            </Box>{' '}
            Password
          </Typography>
          <TextField
            fullWidth
            size="small"
            type={showPassword ? 'text' : 'password'}
            sx={{ mb: 3 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onClick={() => setShowPassword((v) => !v)}
                    sx={{ color: '#9aa0a6' }}>
                    {showPassword ? (
                      <VisibilityOutlinedIcon fontSize="small" />
                    ) : (
                      <VisibilityOffOutlinedIcon fontSize="small" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
              sx: { borderRadius: 1.3 },
            }}
          />

          <Button
            fullWidth
            onClick={() => navigate(NavigationRoutes.Checkout)}
            sx={{
              '&:hover': {
                backgroundColor: '#000',
              },
              backgroundColor: '#000',
              borderRadius: 999,
              color: '#fff',
              fontSize: 17,
              py: 1.05,
              textTransform: 'none',
            }}>
            Login
          </Button>

          <Typography sx={{ fontSize: 16, mt: 2.5, textAlign: 'center' }}>
            Don&apos;t have an account?{' '}
            <Box
              component="span"
              sx={{ fontWeight: 700, textDecoration: 'underline' }}>
              Sign Up
            </Box>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
