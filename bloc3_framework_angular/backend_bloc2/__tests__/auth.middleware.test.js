jest.mock('jsonwebtoken', () => ({
    verify: jest.fn()
}));

jest.mock('../models/UserMySQL', () => ({
    findById: jest.fn()
}));

const jwt = require('jsonwebtoken');
const User = require('../models/UserMySQL');
const { auth, adminAuth } = require('../middleware/auth');

const createRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('auth middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'test-secret';
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    test('returns 401 when token is missing', async () => {
        const req = { header: jest.fn().mockReturnValue(null) };
        const res = createRes();
        const next = jest.fn();

        await auth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                message: 'Accès non autorisé - Token manquant'
            })
        );
        expect(next).not.toHaveBeenCalled();
    });

    test('attaches the authenticated user and calls next', async () => {
        const req = {
            header: jest.fn().mockReturnValue('Bearer valid-token')
        };
        const res = createRes();
        const next = jest.fn();
        const user = { id: 42, role: 'user', isActive: true };

        jwt.verify.mockReturnValue({ userId: 42 });
        User.findById.mockResolvedValue(user);

        await auth(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
        expect(User.findById).toHaveBeenCalledWith(42);
        expect(req.userId).toBe(42);
        expect(req.user).toBe(user);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    test('returns 401 when token is invalid', async () => {
        const req = {
            header: jest.fn().mockReturnValue('Bearer invalid-token')
        };
        const res = createRes();
        const next = jest.fn();

        jwt.verify.mockImplementation(() => {
            const error = new Error('invalid token');
            error.name = 'JsonWebTokenError';
            throw error;
        });

        await auth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                message: 'Token invalide'
            })
        );
        expect(next).not.toHaveBeenCalled();
    });

    test('rejects non-admin users in adminAuth', async () => {
        const req = {
            header: jest.fn().mockReturnValue('Bearer admin-check-token')
        };
        const res = createRes();
        const next = jest.fn();
        const user = { id: 7, role: 'user', isActive: true };

        jwt.verify.mockReturnValue({ userId: 7 });
        User.findById.mockResolvedValue(user);

        await adminAuth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                message: 'Accès réservé aux administrateurs'
            })
        );
        expect(next).not.toHaveBeenCalled();
    });
});
