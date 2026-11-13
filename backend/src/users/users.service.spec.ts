import { Pool } from 'pg';
import { UsersService } from './users.service';

function createService(rows: unknown[] = []) {
  const query = jest.fn().mockResolvedValue({ rows });
  const service = new UsersService({ query } as unknown as Pool);
  return { service, query };
}

describe('UsersService', () => {
  it('create sends only email and hash, as parameters', async () => {
    const { service, query } = createService([{ id: 1 }]);
    await service.create('a@b.c', 'hash-value');

    const [text, values] = query.mock.calls[0];
    expect(text).not.toContain('a@b.c');
    expect(text).not.toContain('hash-value');
    expect(values).toEqual(['a@b.c', 'hash-value']);
  });

  it('findByEmail returns undefined when no user matches', async () => {
    const { service } = createService([]);
    expect(await service.findByEmail('x@y.z')).toBeUndefined();
  });
});