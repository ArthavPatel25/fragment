const { randomUUID } = require('crypto');
const contentType = require('content-type');

const validTypes = ['text/plain', 'text/markdown', 'text/html', 'application/json'];

const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    if (!ownerId) throw new Error('ownerId is required');
    if (!type || !Fragment.isSupportedType(type)) throw new Error('Invalid or unsupported type');
    if (typeof size !== 'number') throw new Error('size must be a number');
    if (size < 0) throw new Error('size cannot be negative');

    this.id = id || randomUUID();
    this.ownerId = String(ownerId); // Ensure string type
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
    this.type = type;
    this.size = size;
  }

  static isSupportedType(value) {
    try {
      const { type } = contentType.parse(value);
      return validTypes.includes(type);
    } catch {
      return false;
    }
  }

  get mimeType() {
    return contentType.parse(this.type).type;
  }

  get isText() {
    return this.mimeType.startsWith('text/');
  }

  get formats() {
    const mime = this.mimeType;

    if (mime === 'text/plain') return ['text/plain'];
    if (mime === 'text/markdown' || mime === 'text/html' || mime === 'application/json') {
      return [mime, 'text/plain'];
    }

    return [mime];
  }

  static async byUser(ownerId, expand = false) {
    const results = await listFragments(String(ownerId), expand);
    return expand ? results.map((data) => new Fragment(data)) : results;
  }

  static async byId(ownerId, id) {
    const metadata = await readFragment(String(ownerId), id);
    if (!metadata) {
      throw new Error(`Fragment id=${id} for owner=${ownerId} not found`);
    }
    return new Fragment(metadata);
  }

  static delete(ownerId, id) {
    return deleteFragment(String(ownerId), id);
  }

  async save() {
    this.updated = new Date().toISOString();
    this.ownerId = String(this.ownerId); // ✅ Ensure it's a string
    await writeFragment(this);
  }

  async getData() {
    return readFragmentData(String(this.ownerId), this.id);
  }

  async setData(data) {
    if (!Buffer.isBuffer(data)) {
      throw new Error('Data must be a Buffer');
    }

    this.size = data.length;
    this.updated = new Date().toISOString();

    await writeFragmentData(String(this.ownerId), this.id, data);
    await this.save();
  }
}

module.exports.Fragment = Fragment;