import { Request, Response } from 'express';

type ControllerHandler = (req: Request, res: Response) => Promise<void>;

export abstract class BaseController {
    protected static jsonResponse(res: Response, code: number, message: string, data?: any) {
        return res.status(code).json({
            success: code >= 200 && code < 300,
            message,
            data,
        });
    }

    protected ok<T>(res: Response, data?: T) {
        return BaseController.jsonResponse(res, 200, 'Success', data);
    }

    protected created<T>(res: Response, data?: T) {
        return BaseController.jsonResponse(res, 201, 'Created', data);
    }

    protected badRequest(res: Response, message = 'Bad Request') {
        return BaseController.jsonResponse(res, 400, message);
    }

    protected unauthorized(res: Response, message = 'Unauthorized') {
        return BaseController.jsonResponse(res, 401, message);
    }

    protected notFound(res: Response, message = 'Not Found') {
        return BaseController.jsonResponse(res, 404, message);
    }

    protected conflict(res: Response, message = 'Conflict') {
        return BaseController.jsonResponse(res, 409, message);
    }

    protected error(res: Response, error: Error | string) {
        console.error(error);
        const message = error instanceof Error ? error.message : error;
        return BaseController.jsonResponse(res, 500, message);
    }
}
