#!/usr/bin/env python

import collections
import json
import progressbar

class WordList(object):
  def __init__(self, words):
    self.words = words
    self.counters = [collections.Counter(w) for w in self.words]

  def FullWords(self):
    return [i for i, w in enumerate(self.words) if len(w) == 6]

  def AllWords(self):
    return range(len(self.words))

  def TwistContains(self, a_idx, b_idx):
    ac = self.counters[a_idx]
    bc = self.counters[b_idx]

    for letter in bc:
      if ac[letter] < bc[letter]:
        return False
    return True

def BuildStructure(words):
  print 'Filter'
  words = [w for w in words if 3 <= len(w) <= 6]
  print 'Build Word List'
  wl = WordList(words)
  full_words = wl.FullWords()

  print 'Build Structure'
  result = []
  for full_word_idx in progressbar.ProgressBar()(full_words):
    subwords = [w for w in wl.AllWords() if wl.TwistContains(full_word_idx, w)]
    if len(subwords) < 7:
      continue
    result.append((full_word_idx, subwords))

  print 'Tree shake'
  word_set = set()
  for (full_word, subwords) in result:
    word_set.add(wl.words[full_word])
    word_set.update(wl.words[sw] for sw in subwords)
  word_set = sorted(list(word_set))

  print 'Internize'
  word_indices = dict((word, idx) for idx, word in enumerate(word_set))

  indices = []
  for (full_word, subwords) in result:
    indices.append({
      'fullWord': word_indices[wl.words[full_word]],
      'subwords': [word_indices[wl.words[sw]] for sw in subwords]
    })

  return {
    'words': word_set,
    'containment': indices
  }

with open('words/data/words.txt', 'rb') as i, open('words/data/words.json', 'wb') as o:
  words = [word.strip() for word in i]
  struct = BuildStructure(words)
  json.dump(struct, o, indent=2)
  print 'Valid games:', len(struct['containment'])
