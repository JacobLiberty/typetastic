// 1000 most common English words (truncated for brevity, fill in the rest as needed)
const COMMON_WORDS = [
  'the', 'of', 'to', 'and', 'a', 'in', 'is', 'it', 'you', 'that',
  'he', 'was', 'for', 'on', 'are', 'with', 'as', 'I', 'his', 'they',
  'be', 'at', 'one', 'have', 'this', 'from', 'or', 'had', 'by', 'hot',
  'but', 'some', 'what', 'there', 'we', 'can', 'out', 'other', 'were', 'all',
  'your', 'when', 'up', 'use', 'word', 'how', 'said', 'an', 'each', 'she',
  'which', 'do', 'their', 'time', 'if', 'will', 'way', 'about', 'many', 'then',
  'them', 'would', 'write', 'like', 'so', 'these', 'her', 'long', 'make', 'thing',
  'see', 'him', 'two', 'has', 'look', 'more', 'day', 'could', 'go', 'come',
  'did', 'my', 'sound', 'no', 'most', 'number', 'who', 'over', 'know', 'water',
  'than', 'call', 'first', 'people', 'may', 'down', 'side', 'been', 'now', 'find',
  'any', 'new', 'work', 'part', 'take', 'get', 'place', 'made', 'live', 'where',
  'after', 'back', 'little', 'only', 'round', 'man', 'year', 'came', 'show', 'every',
  'good', 'me', 'give', 'our', 'under', 'name', 'very', 'through', 'just', 'form',
  'much', 'great', 'think', 'say', 'help', 'low', 'line', 'before', 'turn', 'cause',
  'same', 'mean', 'differ', 'move', 'right', 'boy', 'old', 'too', 'does', 'tell',
  'sentence', 'set', 'three', 'want', 'air', 'well', 'also', 'play', 'small', 'end',
  'put', 'home', 'read', 'hand', 'port', 'large', 'spell', 'add', 'even', 'land',
  'here', 'must', 'big', 'high', 'such', 'follow', 'act', 'why', 'ask', 'men',
  'change', 'went', 'light', 'kind', 'off', 'need', 'house', 'picture', 'try', 'us',
  'again', 'animal', 'point', 'mother', 'world', 'near', 'build', 'self', 'earth', 'father',
  'head', 'stand', 'own', 'page', 'should', 'country', 'found', 'answer', 'school', 'grow',
  'study', 'still', 'learn', 'plant', 'cover', 'food', 'sun', 'four', 'thought', 'let',
  'keep', 'eye', 'never', 'last', 'door', 'between', 'city', 'tree', 'cross', 'since',
  'hard', 'start', 'might', 'story', 'saw', 'far', 'sea', 'draw', 'left', 'late',
  'run', "don't", 'while', 'press', 'close', 'night', 'real', 'life', 'few', 'stop',
  'open', 'seem', 'together', 'next', 'white', 'children', 'begin', 'got', 'walk', 'example',
  'ease', 'paper', 'often', 'always', 'those', 'both', 'mark', 'book', 'letter', 'until',
  'mile', 'river', 'car', 'feet', 'care', 'second', 'group', 'carry', 'took', 'rain',
  'eat', 'room', 'friend', 'began', 'idea', 'fish', 'mountain', 'north', 'once', 'base',
  'hear', 'horse', 'cut', 'sure', 'watch', 'color', 'face', 'wood', 'main'
];

const PUNCTUATION = [
  '.', ',', '!', '?', ':', ';'];

export function generateText(
  wordCount: number,
  options?: { includeNumbers?: boolean; includePunctuation?: boolean }
): string {
  const { includeNumbers = false, includePunctuation = false } = options || {};
  const words = [];
  let lastWasNumber = false;
  let lastHadPunctuation = false;
  for (let i = 0; i < wordCount; i++) {
    // Occasionally insert a number, but never two in a row
    if (includeNumbers && !lastWasNumber && Math.random() < 0.1) {
      words.push(String(Math.floor(Math.random() * 1000) + 1));
      lastWasNumber = true;
      lastHadPunctuation = false;
      continue;
    }
    const idx = Math.floor(Math.random() * COMMON_WORDS.length);
    let word = COMMON_WORDS[idx];
    // Occasionally add punctuation after the word, but never two in a row
    if (includePunctuation && !lastHadPunctuation && Math.random() < 0.125) {
      const punc = PUNCTUATION[Math.floor(Math.random() * PUNCTUATION.length)];
      word += punc;
      lastHadPunctuation = true;
    } else {
      lastHadPunctuation = false;
    }
    words.push(word);
    lastWasNumber = false;
  }
  return words.join(' ');
} 