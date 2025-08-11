// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');
const logger = require('../logger');
// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

const SUPPORTED_TYPES = [
  'text/plain',
  'text/markdown',
  'text/html',
  'application/json',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
];

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    if (!ownerId) throw new Error('ownerId is required');
    if (!type) throw new Error('type is required');
    if (typeof size !== 'number' || size < 0) throw new Error('size must be a non-negative number');
    if (!Fragment.isSupportedType(type)) throw new Error('unsupported type');

    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.type = type;
    this.size = size;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    const fragments = await listFragments(ownerId, expand);
    return expand ? fragments.map((f) => new Fragment(f)) : fragments;
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    const data = await readFragment(ownerId, id);
    if (!data) {
      throw new Error(`Fragment with id ${id} not found`);
    }
    return new Fragment(data);
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static delete(ownerId, id) {
    return deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment (metadata) to the database
   * @returns Promise<void>
   */
  async save() {
    this.updated = new Date().toISOString();
    logger.debug(`Saving fragment ${this.id} for ${this.ownerId}`);
    await writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  async getData() {
    return await readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    if (!Buffer.isBuffer(data)) throw new Error('Data must be a Buffer');

    this.size = data.length;
    this.updated = new Date().toISOString();
    logger.debug(`Setting data for fragment ${this.id} (${this.size} bytes)`);

    await writeFragmentData(this.ownerId, this.id, data);
    await this.save();
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    return this.mimeType.startsWith('text/') || this.mimeType === 'application/json';
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    const mime = this.mimeType;
    const map = {
      // Fix: plain text is not convertible to HTML for this project’s rules/tests
      'text/plain': ['text/plain'],
      'text/markdown': ['text/markdown', 'text/html', 'text/plain'],
      'text/html': ['text/html', 'text/plain'],
      'application/json': ['application/json', 'text/plain'],
      'image/png': ['image/png', 'image/jpeg', 'image/webp'],
      'image/jpeg': ['image/png', 'image/jpeg', 'image/webp'],
      'image/webp': ['image/png', 'image/jpeg', 'image/webp'],
      'image/gif': ['image/gif'],
    };
    return map[mime] || [mime];
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    const { type } = contentType.parse(value);
    return SUPPORTED_TYPES.includes(type);
  }

  static async put(ownerId, id, data, type) {
    try {
      // 1. Get the existing fragment to ensure it exists
      const existingFragment = await Fragment.byId(ownerId, id);

      // 2. Validate the new content type
      if (!Fragment.isSupportedType(type)) {
        throw new Error('Unsupported content type');
      }

      // 3. Update the fragment's metadata and data
      existingFragment.type = type;
      await existingFragment.setData(data);

      return existingFragment;
    } catch (err) {
      logger.error({ err }, 'Failed to put fragment');
      throw err;
    }
  }
}

module.exports.Fragment = Fragment;

