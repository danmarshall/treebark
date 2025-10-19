import { getProperty } from 'treebark';

describe('Public API', () => {
  describe('getProperty', () => {
    it('should be exported from the main package', () => {
      expect(typeof getProperty).toBe('function');
    });

    it('should access simple properties', () => {
      const data = { name: 'Alice', age: 30 };
      expect(getProperty(data, 'name')).toBe('Alice');
      expect(getProperty(data, 'age')).toBe(30);
    });

    it('should access nested properties with dot notation', () => {
      const data = { user: { profile: { name: 'Bob' } } };
      expect(getProperty(data, 'user.profile.name')).toBe('Bob');
    });

    it('should return undefined for non-existent properties', () => {
      const data = { name: 'Alice' };
      expect(getProperty(data, 'nonexistent')).toBeUndefined();
    });

    it('should return the data itself when path is "."', () => {
      const data = { name: 'Alice', age: 30 };
      expect(getProperty(data, '.')).toBe(data);
    });

    it('should handle parent property access with parents array', () => {
      const parent = { parentProp: 'parent value' };
      const data = { childProp: 'child value' };
      expect(getProperty(data, '..parentProp', [parent])).toBe('parent value');
    });

    it('should handle multiple parent levels', () => {
      const grandparent = { grandProp: 'grandparent value' };
      const parent = { parentProp: 'parent value' };
      const data = { childProp: 'child value' };
      expect(getProperty(data, '../../grandProp', [grandparent, parent])).toBe('grandparent value');
    });

    it('should return undefined when accessing parents beyond available levels', () => {
      const data = { name: 'Alice' };
      expect(getProperty(data, '..parentProp', [])).toBeUndefined();
    });

    it('should handle arrays', () => {
      const data = [{ name: 'Alice' }, { name: 'Bob' }];
      expect(getProperty(data, '0.name')).toBe('Alice');
      expect(getProperty(data, '1.name')).toBe('Bob');
    });
  });
});
