import { Box } from '@mui/material';
import { observer } from 'mobx-react-lite';

import { BaseColorSelector } from './BaseColorSelector';
import { BaseSelector } from './BaseSelector';
import { ChairSection } from './ChairSection';
import { DimensionSection } from './DimensionSection';
import { SummarySection } from './SummarySection';
import { TopColorSelector } from './TopColorSelector';
import { TopShapeSelector } from './TopShapeSelector';

export const SideBar = observer(() => {
  return (
    <Box
      sx={{
        bgcolor: 'white',
        borderLeft: { md: '1px solid #eee', xs: 'none' },
        borderTop: { md: 'none', xs: '1px solid #eee' },
        overflowX: 'hidden',
        p: { md: 3, xs: 2 },
        width: { md: 360, xs: '100%' },
      }}>
      <Box id="section-base">
        <BaseSelector />
      </Box>
      <Box id="section-base-colour">
        <BaseColorSelector />
      </Box>
      <Box id="section-top-colour" sx={{ mb: 6 }}>
        <TopColorSelector />
      </Box>
      <Box id="section-top-shape">
        <TopShapeSelector />
      </Box>
      <Box id="section-dimension">
        <DimensionSection />
      </Box>
      <Box id="section-chair">
        <ChairSection />
      </Box>
      <Box id="section-summary">
        <SummarySection />
      </Box>
    </Box>
  );
});
