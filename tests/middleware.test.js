import { isLoggedIn, isInstructor, isStudent } from '../middleware.js';

describe('Middleware Tests', () => {
  test('isLoggedIn middleware should call next() if user is authenticated', () => {
    const req = { isAuthenticated: () => true };
    const res = {};
    const next = jest.fn();

    isLoggedIn(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('isInstructor middleware should call next() if user is an instructor', () => {
    const req = {
      isAuthenticated: () => true,
      user: { user_type: 'instructor' },
    };
    const res = {};
    const next = jest.fn();

    isInstructor(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('isStudent middleware should call next() if user is a student', () => {
    const req = {
      isAuthenticated: () => true,
      user: { user_type: 'student' },
    };
    const res = {};
    const next = jest.fn();

    isStudent(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
