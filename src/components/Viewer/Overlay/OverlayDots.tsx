import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { IconButton } from '@mui/material';

type OverlayDotsProps = {
  isActive: boolean;
  onClick: () => void;
};

export const OverlayDots = ({ isActive, onClick }: OverlayDotsProps) => {
  return (
    <IconButton
      onClick={onClick}
      aria-label="Toggle finish information"
      sx={{
        backgroundColor: isActive ? '#f3f3f3' : '#fff',
        border: '1px solid #bfc3c7',
        borderRadius: 1.3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        color: '#5f6368',
        height: { md: 42, xs: 36 },
        left: { md: 22, xs: 16 },
        pointerEvents: 'auto',
        position: 'absolute',
        bottom: { md: 22, xs: 18 },
        width: { md: 42, xs: 36 },
        zIndex: 21,
        '&:hover': {
          backgroundColor: '#f3f3f3',
        },
      }}>
      <InfoOutlinedIcon fontSize="small" />
    </IconButton>
  );
};
