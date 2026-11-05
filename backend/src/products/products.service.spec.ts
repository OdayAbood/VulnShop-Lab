import { Pool } from 'pg';
import { ProductsService } from './products.service';

function createService() {
  const query = jest.fn().mockResolvedValue({ rows: [] });
  const service = new ProductsService({ query } as unknown as Pool);
  return { service, query };
}

describe('ProductsService.findAll', () => {
  it('lists all products without any query parameters', async () => {
    const { service, query } = createService();
    await service.findAll();

    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0]).toHaveLength(1);
    
  });

  it('sends the search term as a parameter, not inside the SQL text', async () => {
    const { service, query } = createService();
    await service.findAll('mouse');

    const [text, values] = query.mock.calls[0];
    expect(text).toContain('$1');
    expect(text).not.toContain('mouse');
    expect(values).toEqual(['%mouse%']);
  });

  it('produces the same SQL text for a SQL injection payload', async () => {
    const { service, query } = createService();
    const payload = "' OR 1=1 --";
    await service.findAll('mouse');
    await service.findAll(payload);

    const [normalText] = query.mock.calls[0];
    const [attackText, attackValues] = query.mock.calls[1];
    expect(attackText).toBe(normalText);
    expect(attackText).not.toContain('OR 1=1');
    expect(attackValues).toEqual([`%${payload}%`]);
  });

  it('escapes LIKE wildcards so they match literally', async () => {
    const { service, query } = createService();
    await service.findAll('50%_');

    const [, values] = query.mock.calls[0];
    expect(values).toEqual(['%50\\%\\_%']);
  });
});