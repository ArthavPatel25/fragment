const MemoryDB = require('../../src/model/data/memory/memory-db');
const {writeFragment, readFragment, writeFragmentData, readFragmentData} = require('../../src/model/data/memory/index');

describe('memory-db', () => {
  let db;

  
  beforeEach(() => {
    db = new MemoryDB();
  });

  test('put() returns nothing', async () => {
    const result = await db.put('a', 'b', {});
    expect(result).toBe(undefined);
  });

  test('get() returns what we put() into the db', async () => {
    const data = { value: 123 };
    await db.put('a', 'b', data);
    const result = await db.get('a', 'b');
    expect(result).toEqual(data);
  });

  test('put() and get() work with Buffers', async () => {
    const data = Buffer.from([1, 2, 3]);
    await db.put('a', 'b', data);
    const result = await db.get('a', 'b');
    expect(result).toEqual(data);
  });

  test('get() with incorrect secondaryKey returns nothing', async () => {
    await db.put('a', 'b', 123);
    const result = await db.get('a', 'c');
    expect(result).toBe(undefined);
  });

  test('query() returns all secondaryKey values', async () => {
    await db.put('a', 'a', { value: 1 });
    await db.put('a', 'b', { value: 2 });
    await db.put('a', 'c', { value: 3 });

    const results = await db.query('a');
    expect(Array.isArray(results)).toBe(true);
    expect(results).toEqual([{ value: 1 }, { value: 2 }, { value: 3 }]);
  });
  
  test('query() returns empty array', async () => {
    await db.put('b', 'a', { value: 1 });
    await db.put('b', 'b', { value: 2 });
    await db.put('b', 'c', { value: 3 });

    const results = await db.query('a');
    expect(Array.isArray(results)).toBe(true);
    expect(results).toEqual([]);
  });

  test('del() removes value put() into db', async () => {
    await db.put('a', 'a', { value: 1 });
    expect(await db.get('a', 'a')).toEqual({ value: 1 });
    await db.del('a', 'a');
    expect(await db.get('a', 'a')).toBe(undefined);
  });

  test('del() throws if primaryKey and secondaryKey not in db', () => {
    expect(() => db.del('a', 'a')).rejects.toThrow();
  });

  test('get() expects string keys', () => {
    expect(async () => await db.get()).rejects.toThrow();
    expect(async () => await db.get(1)).rejects.toThrow();
    expect(async () => await db.get(1, 1)).rejects.toThrow();
  });

  test('put() expects string keys', () => {
    expect(async () => await db.put()).rejects.toThrow();
    expect(async () => await db.put(1)).rejects.toThrow();
    expect(async () => await db.put(1, 1)).rejects.toThrow();
  });

  test('query() expects string key', () => {
    expect(async () => await db.query()).rejects.toThrow();
    expect(async () => await db.query(1)).rejects.toThrow();
  });

  test('del() expects string keys', () => {
    expect(async () => await db.del()).rejects.toThrow();
    expect(async () => await db.del(1)).rejects.toThrow();
    expect(async () => await db.del(1, 1)).rejects.toThrow();
  });
});

describe('In-Memory Fragment DB operations', () => {
  const fragment = {
    id: 'frag1',
    ownerId: 'user1',
    type: 'text/plain',
    size: 100,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };

  const fragmentBuffer = Buffer.from('This is fragment data');

  test('writeFragment() stores metadata and readFragment() retrieves it', async () => {
    await writeFragment(fragment);
    const result = await readFragment(fragment.ownerId, fragment.id);

    expect(result).toEqual(fragment);
  });

  test('readFragment() returns undefined for non-existing fragment', async () => {
    const result = await readFragment('nonuser', 'nonfrag');
    expect(result).toBeUndefined();
  });

  test('writeFragmentData() stores data and readFragmentData() retrieves it', async () => {
    await writeFragmentData(fragment.ownerId, fragment.id, fragmentBuffer);
    const result = await readFragmentData(fragment.ownerId, fragment.id);

    expect(result).toEqual(fragmentBuffer);
  });

  test('readFragmentData() returns undefined for non-existing data', async () => {
    const result = await readFragmentData('nonuser', 'nonfrag');
    expect(result).toBeUndefined();
  });
});
