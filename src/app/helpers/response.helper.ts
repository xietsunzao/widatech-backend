interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

export class ResponseHelper {
    static success<T>(data: T, message: string = "Operation successful"): ApiResponse<T> {
        return {
            success: true,
            message,
            data
        };
    }

    static error(message: string = "Operation failed", error: unknown): ApiResponse<null> {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
            success: false,
            message,
            error: errorMessage
        };
    }

    static notFound(message: string = "Resource not found"): ApiResponse<null> {
        return {
            success: false,
            message
        };
    }
} 