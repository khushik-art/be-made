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
        height: 42,
        left: 22,
        pointerEvents: 'auto',
        position: 'absolute',
        bottom: 22,
        width: 42,
        zIndex: 21,
        '&:hover': {
          backgroundColor: '#f3f3f3',
        },
      }}>
      <InfoOutlinedIcon fontSize="small" />
    </IconButton>
  );
};
