import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Box, IconButton, Typography } from '@mui/material';

type Props = {
  max?: number;
  min?: number;
  isDisabled?: boolean;
  value: number;
  onChange: (v: number) => void;
};

export const ChairQuantityControl = ({
  max,
  min = 0,
  isDisabled = false,
  value,
  onChange,
}: Props) => {
  const upper = typeof max === 'number' ? max : Number.MAX_SAFE_INTEGER;
  const increase = () => onChange(Math.min(value + 2, upper));
  const decrease = () => onChange(Math.max(min, value - 2));

  const isMinusDisabled = isDisabled || value <= min;
  const isPlusDisabled = isDisabled || value >= upper;

  return (
    <Box display="flex" alignItems="center" gap={2}>
      <IconButton
        onClick={decrease}
        disabled={isMinusDisabled}
        sx={{
          border: '1px solid #ddd',
          borderRadius: 1,
          height: 36,
          width: 36,
        }}>
        <RemoveIcon fontSize="small" />
      </IconButton>

      <Typography fontWeight={600}>{value}</Typography>

      <IconButton
        onClick={increase}
        disabled={isPlusDisabled}
        sx={{
          border: '1px solid #ddd',
          borderRadius: 1,
          height: 36,
          width: 36,
        }}>
        <AddIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};
