import { z } from 'zod'
import { Response } from 'express';

interface ValidationError {
    field: string;
    code: string;
    message: string;
    details?: Record<string, any>;
}

interface ValidationResponse {
    success: boolean;
    message: string;
    errors?: ValidationError[];
}

export class Validator {
    static validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
        try {
            return schema.parse(data);
        } catch (error) {
            if (error instanceof z.ZodError) {
                const formattedErrors: ValidationError[] = error.errors.map(err => ({
                    field: err.path.join('.'),
                    code: err.code,
                    message: err.message,
                    details: {
                        ...err,
                        path: undefined,
                        code: undefined,
                        message: undefined
                    }
                }));
                
                throw new Error(JSON.stringify({
                    success: false,
                    message: "Validation failed",
                    errors: formattedErrors
                }));
            }
            throw error;
        }
    }

    static handleError(error: unknown, res: Response): void {
        if (error instanceof Error) {
            try {
                const parsedError = JSON.parse(error.message) as ValidationResponse;
                if (parsedError.errors) {
                    res.status(400).json(parsedError);
                    return;
                }
            } catch {
                res.status(500).json({
                    success: false,
                    message: "An error occurred",
                    error: error instanceof Error ? error.message : "Unknown error"
                });
            }
        }
        
        // Default error response
        res.status(500).json({
            success: false,
            message: "An error occurred",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }

    // validate async
    static async validateAsync<T>(schema: z.ZodSchema<T>, data: unknown): Promise<T> {
        try {
            return await schema.parseAsync(data);
        } catch (error) {
            if (error instanceof z.ZodError) {
                const formattedErrors: ValidationError[] = error.errors.map(err => ({
                    field: err.path.join('.'),
                    code: err.code,
                    message: err.message,
                    details: {
                        ...err,
                        path: undefined,
                        code: undefined,
                        message: undefined
                    }
                }));
                
                throw new Error(JSON.stringify({
                    success: false,
                    message: "Validation failed",
                    errors: formattedErrors
                }));
            }
            throw error;
        }
    }
}