import { BadRequestException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

function createService() {
  const create = jest
    .fn()
    .mockImplementation(async (email: string, passwordHash: string) => ({
      id: 1,
      email,
      passwordHash,
      role: 'user',
    }));
  const service = new AuthService( { create } as unknown as UsersService, {} as unknown as JwtService,);
  return { service, create };
}

const GOOD_PASSWORD = 'correct horse battery';

describe('AuthService.register', () => {
  it('stores an argon2 hash, never the password', async () => {
    const { service, create } = createService();
    await service.register('a@b.com', GOOD_PASSWORD);

    const [, storedHash] = create.mock.calls[0];
    expect(storedHash).toMatch(/^\$argon2id\$/);
    expect(storedHash).not.toContain(GOOD_PASSWORD);
  });

  it('normalizes the email and returns the user without the hash', async () => {
    const { service, create } = createService();
    const result = await service.register('  A@B.com ', GOOD_PASSWORD);

    expect(create.mock.calls[0][0]).toBe('a@b.com');
    expect(result).toEqual({ id: 1, email: 'a@b.com', role: 'user' });
  });

  it('rejects a short password', async () => {
    const { service, create } = createService();
    await expect(service.register('a@b.com', 'short')).rejects.toThrow(
      BadRequestException,
    );
    expect(create).not.toHaveBeenCalled();
  });

  it('rejects an invalid email', async () => {
    const { service } = createService();
    await expect(service.register('not-an-email', GOOD_PASSWORD)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects non-string input', async () => {
    const { service } = createService();
    await expect(
      service.register({ $ne: 1 }, GOOD_PASSWORD),
    ).rejects.toThrow(BadRequestException);
  });

  it('returns a conflict error when the email already exists', async () => {
    const { service, create } = createService();
    create.mockRejectedValueOnce({ code: '23505' });
    await expect(service.register('a@b.com', GOOD_PASSWORD)).rejects.toThrow(
      ConflictException,
    );
  });
});