import { getProperty } from 'treebark';
import { jest } from '@jest/globals';

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

    it('should handle numeric array indices in nested paths', () => {
      const data = { 
        items: [
          { value: 'first', id: 1 }, 
          { value: 'second', id: 2 }
        ]
      };
      expect(getProperty(data, 'items.0.value')).toBe('first');
      expect(getProperty(data, 'items.1.value')).toBe('second');
      expect(getProperty(data, 'items.0.id')).toBe(1);
    });

    it('should handle multi-level numeric indices', () => {
      const data = {
        outer: {
          matrix: [
            [{ val: 'a' }, { val: 'b' }],
            [{ val: 'c' }, { val: 'd' }]
          ]
        }
      };
      expect(getProperty(data, 'outer.matrix.0.0.val')).toBe('a');
      expect(getProperty(data, 'outer.matrix.1.1.val')).toBe('d');
    });

    it('should call fallback handler when property is not found', () => {
      const data = { name: 'Alice' };
      const fallback = jest.fn((path) => `fallback-${path}`);
      
      const result = getProperty(data, 'nonexistent', [], undefined, fallback);
      
      expect(fallback).toHaveBeenCalledWith('nonexistent', data, []);
      expect(result).toBe('fallback-nonexistent');
    });

    it('should not call fallback handler when property exists', () => {
      const data = { name: 'Alice' };
      const fallback = jest.fn();
      
      const result = getProperty(data, 'name', [], undefined, fallback);
      
      expect(fallback).not.toHaveBeenCalled();
      expect(result).toBe('Alice');
    });

    it('should call fallback handler for nested property not found', () => {
      const data = { user: { name: 'Bob' } };
      const fallback = jest.fn((path) => `global-${path}`);
      
      const result = getProperty(data, 'user.missing', [], undefined, fallback);
      
      expect(fallback).toHaveBeenCalledWith('user.missing', data, []);
      expect(result).toBe('global-user.missing');
    });

    it('should call fallback handler when parent context not found', () => {
      const data = { name: 'Alice' };
      const fallback = jest.fn((path) => 'default-value');
      
      const result = getProperty(data, '..parentProp', [], undefined, fallback);
      
      expect(fallback).toHaveBeenCalledWith('..parentProp', data, []);
      expect(result).toBe('default-value');
    });
  });
});
