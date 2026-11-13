import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

const GOOD_PASSWORD = 'correct horse battery';
const SECRET = 'x'.repeat(48);

function createJwt(secret = SECRET) {
  return new JwtService({
    secret,
    signOptions: { algorithm: 'HS256', expiresIn: 900 },
    verifyOptions: { algorithms: ['HS256'] },
  });
}

async function createService() {
  const storedUser = {
    id: 7,
    email: 'a@b.com',
    passwordHash: await argon2.hash(GOOD_PASSWORD),
    role: 'admin' as const,
  };
  const findByEmail = jest.fn().mockResolvedValue(storedUser);
  const jwt = createJwt();
  const service = new AuthService({ findByEmail } as unknown as UsersService, jwt);
  return { service, jwt };
}

describe('AuthService.login', () => {
  it('issues a token that contains only the user id', async () => {
    const { service, jwt } = await createService();
    const { accessToken } = await service.login('a@b.com', GOOD_PASSWORD);

    const payload = await jwt.verifyAsync(accessToken);
    expect(payload.sub).toBe(7);
    expect(payload).not.toHaveProperty('role');
    expect(payload).not.toHaveProperty('email');
    expect(payload).not.toHaveProperty('passwordHash');
  });

  it('issues a token that expires after 15 minutes', async () => {
    const { service, jwt } = await createService();
    const { accessToken } = await service.login('a@b.com', GOOD_PASSWORD);

    const payload = await jwt.verifyAsync(accessToken);
    expect(payload.exp - payload.iat).toBe(900);
  });

  it('rejects a token signed with a different secret', async () => {
    const { service } = await createService();
    const { accessToken } = await service.login('a@b.com', GOOD_PASSWORD);

    const otherJwt = createJwt('y'.repeat(48));
    await expect(otherJwt.verifyAsync(accessToken)).rejects.toThrow();
  });

  it('rejects an unsigned token that claims alg none', async () => {
    const { jwt } = await createService();
    const encode = (obj: object) =>
      Buffer.from(JSON.stringify(obj)).toString('base64url');
    const forged = `${encode({ alg: 'none', typ: 'JWT' })}.${encode({ sub: 7 })}.`;

    await expect(jwt.verifyAsync(forged)).rejects.toThrow();
  });
});