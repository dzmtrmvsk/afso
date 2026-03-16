import { Container, Typography, Box, Paper } from '@mui/material';

function App() {
  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          AFSO
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Adaptive Field Service Orchestrator
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Typography variant="body1" color="text.secondary">
            Platform is initializing. Start building your field service management UI here.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default App;
