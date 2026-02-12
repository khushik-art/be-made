import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Box, IconButton, Slider, Typography } from '@mui/material';

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
};

const STEP = 100;

export const DimensionControl = ({
  label,
  value,
  min,
  max,
  onChange,
}: Props) => {
  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    onChange(newValue as number);
  };

  const remainder = max % STEP;
  const hasOffsetMax = remainder !== 0;
  const firstDropValue = hasOffsetMax ? max - remainder : max - STEP;

  const increase = () => {
    if (hasOffsetMax && value === firstDropValue) {
      onChange(max);
      return;
    }

    onChange(Math.min(value + STEP, max));
  };

  const decrease = () => {
    if (hasOffsetMax && value === max) {
      onChange(Math.max(firstDropValue, min));
      return;
    }

    onChange(Math.max(value - STEP, min));
  };

  return (
    <Box mb={4}>
      {/* Label - Set to Bold and larger per screenshot */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          fontSize: '1.1rem',
          mb: 2.5,
          color: '#000',
        }}>
        {label}
      </Typography>

      {/* Controls Container */}
      <Box display="flex" alignItems="center" gap={2}>
        {/* Minus Button */}
        <IconButton
          onClick={decrease}
          disableRipple
          sx={{
            border: '1px solid #ccc',
            borderRadius: '6px', // Matches the slightly rounded look
            width: 44,
            height: 44,
            backgroundColor: '#fff',
            '&:hover': { backgroundColor: '#f5f5f5' },
          }}>
          <RemoveIcon sx={{ color: '#555', fontSize: '1.2rem' }} />
        </IconButton>

        {/* Slider */}
        <Slider
          value={value}
          min={min}
          max={max}
          step={STEP}
          onChange={handleSliderChange}
          valueLabelDisplay="off"
          sx={{
            flex: 1,
            height: 5,
            padding: '13px 0',
            '& .MuiSlider-track': {
              background: 'linear-gradient(90deg, #d3d9db 0%, #e8dec8 100%)',
              border: 'none',
            },
            '& .MuiSlider-rail': {
              backgroundColor: '#e0e0e0',
              opacity: 1,
            },
            '& .MuiSlider-thumb': {
              width: 26,
              height: 26,
              backgroundColor: '#fff',
              border: '1.5px solid #9e9e9e',
              boxShadow: 'none',
              '&:before': {
                display: 'none',
              },
              '&:hover, &.Mui-focusVisible, &.Mui-active': {
                boxShadow: 'none',
              },
            },
          }}
        />

        {/* Plus Button */}
        <IconButton
          onClick={increase}
          disableRipple
          sx={{
            border: '1px solid #ccc',
            borderRadius: '6px',
            width: 44,
            height: 44,
            backgroundColor: '#fff',
            '&:hover': { backgroundColor: '#f5f5f5' },
          }}>
          <AddIcon sx={{ color: '#555', fontSize: '1.2rem' }} />
        </IconButton>
      </Box>

      {/* Value Display */}
      <Typography
        sx={{
          textAlign: 'center',
          mt: 2,
          fontWeight: 500,
          fontSize: '1rem',
          color: '#000',
          letterSpacing: '0.02em',
        }}>
        {value}mm
      </Typography>
    </Box>
  );
};
