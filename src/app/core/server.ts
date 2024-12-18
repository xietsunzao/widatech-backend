import type { Express } from 'express';
import { api } from '@routes/api';
import express from 'express';

export const server = {
    init: (app: Express): void => {
        // Add middleware for parsing JSON
        app.use(express.json());
        
        // Use the API routes
        app.use(api);

        // Handle 404 - Place this after all routes
        app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                message: 'Route not found',
                path: req.originalUrl
            });
        });
    },
    listen: (port: number): void => {
        console.log(`Server is running on http://localhost:${port}`);
    }
}