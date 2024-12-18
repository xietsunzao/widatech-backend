import express from 'express';
import { server } from '@core/server';

const app = express();
const port = parseInt(process.env.PORT || '3000');
// Initialize the server with the Express app
server.init(app);

// Start listening
app.listen(port, () => {
    server.listen(port);
});