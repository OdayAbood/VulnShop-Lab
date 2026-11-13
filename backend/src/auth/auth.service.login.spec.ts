import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

const GOOD_PASSWORD = 'correct horse battery';

async function createService(withUser = true) {
  const storedUser = {
    id: 7,
    email: 'a@b.com',
    passwordHash: await argon2.hash(GOOD_PASSWORD),
    role: 'user' as const,
  };
  const findByEmail = jest
    .fn()
    .mockResolvedValue(withUser ? storedUser : undefined);
  const service = new AuthService({ findByEmail } as unknown as UsersService);
  return { service, findByEmail };
}

describe('AuthService.validateUser', () => {
  it('returns the user without the hash for correct credentials', async () => {
    const { service } = await createService();
    const result = await service.validateUser('a@b.com', GOOD_PASSWORD);
    expect(result).toEqual({ id: 7, email: 'a@b.com', role: 'user' });
  });

  it('looks the user up with a normalized email', async () => {
    const { service, findByEmail } = await createService();
    await service.validateUser('  A@B.com ', GOOD_PASSWORD);
    expect(findByEmail).toHaveBeenCalledWith('a@b.com');
  });

  it('rejects a wrong password', async () => {
    const { service } = await createService();
    await expect(
      service.validateUser('a@b.com', 'wrong password!!'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('gives the same error for an unknown email as for a wrong password', async () => {
    const known = await createService();
    const unknown = await createService(false);

    const wrongPassword = await known.service
      .validateUser('a@b.com', 'wrong password!!')
      .catch((e: Error) => e);
    const unknownEmail = await unknown.service
      .validateUser('nobody@b.com', GOOD_PASSWORD)
      .catch((e: Error) => e);

    expect(unknownEmail).toBeInstanceOf(UnauthorizedException);
    expect((unknownEmail as Error).message).toBe(
      (wrongPassword as Error).message,
    );
  });

  it('rejects non-string input before touching the database', async () => {
    const { service, findByEmail } = await createService();
    await expect(
      service.validateUser({ $ne: 1 }, GOOD_PASSWORD),
    ).rejects.toThrow(BadRequestException);
    expect(findByEmail).not.toHaveBeenCalled();
  });
});