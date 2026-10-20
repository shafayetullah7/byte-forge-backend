import {
  rankSearchSuggestItems,
  scoreSearchMatch,
  type SearchSuggestCandidate,
} from '../../search-suggest.ranking';

describe('search-suggest.ranking', () => {
  const plant = (
    slug: string,
    name: string,
  ): SearchSuggestCandidate => ({
    type: 'plant',
    slug,
    name,
  });

  describe('scoreSearchMatch', () => {
    it('prefers prefix over contains', () => {
      expect(scoreSearchMatch('alo', 'Aloe Vera', 'aloe-vera')).toBe(0);
      expect(scoreSearchMatch('vera', 'Aloe Vera', 'aloe-vera')).toBe(1);
    });
  });

  describe('rankSearchSuggestItems', () => {
    it('sorts by match quality then name', () => {
      const items = rankSearchSuggestItems(
        'green',
        [
          plant('other', 'Something Greenish'),
          plant('green-house', 'Green House'),
          { type: 'shop', slug: 'green-nursery', name: 'Green Nursery' },
        ],
        20,
      );

      expect(items.map((i) => i.slug)).toEqual([
        'green-house',
        'green-nursery',
        'other',
      ]);
    });

    it('respects limit', () => {
      const items = rankSearchSuggestItems(
        'a',
        [plant('a', 'A'), plant('b', 'B'), plant('c', 'C')],
        2,
      );
      expect(items).toHaveLength(2);
    });
  });
});
