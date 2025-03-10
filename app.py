from flask import Flask, render_template, jsonify, request, url_for
from flask_cors import CORS
import json
import os
import random
import nltk
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.tag import pos_tag
from nltk.corpus import cmudict
from nltk.sentiment import SentimentIntensityAnalyzer
from gensim.models import Word2Vec, LdaModel
from gensim.corpora import Dictionary
import numpy as np
from collections import defaultdict

app = Flask(__name__, static_url_path='/static', static_folder='static')
CORS(app)

# Download required NLTK data
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')
nltk.download('cmudict')
nltk.download('vader_lexicon')

class LyricGenerator:
    def __init__(self):
        self.lyrics_data = []
        self.markov_chains = {1: {}, 2: {}, 3: {}}  # Store different n-gram chains
        self.word2vec_model = None
        self.topic_model = None
        self.dictionary = None
        self.pos_patterns = defaultdict(list)  # Store common POS patterns
        self.rhyme_dict = cmudict.dict()
        self.sentiment_analyzer = SentimentIntensityAnalyzer()
        self.common_phrases = defaultdict(int)  # Store frequent country music phrases
        self.syllable_dict = defaultdict(list)  # Store syllable counts
        self.sentiment_patterns = []  # Store sentiment scores
        self.use_pos_patterns = False  # Disable POS patterns if tagger fails
        self.current_chords = []  # Track current chord progression
        self.load_lyrics()
        self.build_markov_chains()
        self.train_models()
        self.extract_patterns()

    def load_lyrics(self):
        try:
            # Load lyrics from cleaned JSON file
            with open(os.path.join('app', 'data', 'lyrics_clean.json'), 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Extract lyrics into list format
                self.lyrics_data = [song['lyrics'] for song in data]
                print(f"Loaded {len(self.lyrics_data)} songs from cleaned dataset")
                self.extract_common_phrases()
                self.build_syllable_dict()
        except Exception as e:
            print(f"Error loading lyrics: {str(e)}")
            # Fallback to sample data
            self.lyrics_data = [
                "Oklahoma sun beating down on me",
                "Whiskey in my soul setting me free",
                "Cold beer on a Friday night",
                "Under stars burning bright"
            ]

    def extract_common_phrases(self):
        # Extract common 2-4 word phrases from the lyrics
        for lyrics in self.lyrics_data:
            words = word_tokenize(lyrics.lower())
            for i in range(len(words)):
                for length in range(2, 5):
                    if i + length <= len(words):
                        phrase = ' '.join(words[i:i+length])
                        self.common_phrases[phrase] += 1

        # Keep only frequently occurring phrases
        self.common_phrases = {k: v for k, v in self.common_phrases.items() 
                             if v >= 3}  # Appears in at least 3 songs

    def build_syllable_dict(self):
        # Build dictionary of words to syllable counts
        for word in set(word for lyrics in self.lyrics_data 
                       for word in word_tokenize(lyrics.lower())):
            try:
                phones = self.rhyme_dict[word][0]
                syllables = len([p for p in phones if p[-1].isdigit()])
                self.syllable_dict[word].append(syllables)
            except:
                # Estimate syllables based on vowel groups if not in CMU dict
                vowels = 'aeiouy'
                count = len([char for char in word if char in vowels])
                self.syllable_dict[word].append(max(1, count))

    def get_syllable_count(self, word):
        if word.lower() in self.syllable_dict:
            return self.syllable_dict[word.lower()][0]
        return 1

    def extract_patterns(self):
        print("Extracting patterns...")
        try:
            # Test POS tagger
            test_tags = pos_tag(['test', 'sentence'])
            self.use_pos_patterns = True
        except:
            print("Warning: POS tagger not available, disabling POS pattern features")
            self.use_pos_patterns = False

        for line in self.lyrics_data:
            words = word_tokenize(line)
            
            # Only extract POS patterns if tagger is working
            if self.use_pos_patterns:
                try:
                    pos_tags = pos_tag(words)
                    for i in range(len(pos_tags) - 2):
                        for length in range(3, 6):
                            if i + length <= len(pos_tags):
                                pattern = tuple(tag for _, tag in pos_tags[i:i+length])
                                self.pos_patterns[length].append(pattern)
                except Exception as e:
                    print(f"Warning: POS tagging failed for line: {e}")
            
            # Calculate line sentiment
            sentiment = self.sentiment_analyzer.polarity_scores(line)
            self.sentiment_patterns.append(sentiment['compound'])

    def get_sentiment_score(self, text):
        return self.sentiment_analyzer.polarity_scores(text)['compound']

    def find_matching_phrase(self, target_sentiment, syllable_target=None):
        # Find a phrase that matches the target sentiment and syllable count
        matching_phrases = []
        for phrase in self.common_phrases:
            if syllable_target:
                syllables = sum(self.get_syllable_count(word) 
                              for word in word_tokenize(phrase))
                if syllables != syllable_target:
                    continue
            
            sentiment = self.get_sentiment_score(phrase)
            if abs(sentiment - target_sentiment) < 0.3:  # Allow some variance
                matching_phrases.append(phrase)
        
        return random.choice(matching_phrases) if matching_phrases else None

    def generate_line(self, seed=None, max_words=10, rhyme_with=None, 
                     topic_words=None, target_sentiment=None, syllable_target=None,
                     used_words=None, line_position=0, temperature=1.0, force_seed=False):
        """Generate a single line word by word using Markov chains"""
        if force_seed and not seed:
            raise ValueError("force_seed is True but no seed word provided")
            
        metrics = {
            'transition_prob': 0.0,
            'topic_coherence': 0.0,
            'sentiment_match': 0.0,
            'syllable_match': 0.0
        }
        
        if not any(self.markov_chains.values()):
            return "Not enough data to generate lyrics", metrics

        used_words = used_words or set()
        line = []
        current_syllables = 0
        total_transitions = 0
        total_prob = 0
        seed_used = False
        
        # If forcing seed usage, start with it
        if force_seed and seed:
            current = seed.lower()
            seed_used = True
        else:
            # Normal word selection logic
            if seed and seed.lower() in self.markov_chains[1]:
                current = seed.lower()
                seed_used = True
            elif topic_words:
                available_topics = [word for word, score in topic_words.items() 
                                  if word not in used_words and word in self.markov_chains[1]]
                if available_topics:
                    current = random.choice(available_topics)
                else:
                    available_starts = [k[0] for k in self.markov_chains[1].keys() 
                                      if isinstance(k, tuple) and k[0] not in used_words]
                    current = random.choice(available_starts if available_starts else 
                                          [k[0] for k in self.markov_chains[1].keys() if isinstance(k, tuple)])
            else:
                available_starts = [k[0] for k in self.markov_chains[1].keys() 
                                  if isinstance(k, tuple) and k[0] not in used_words]
                current = random.choice(available_starts if available_starts else 
                                      [k[0] for k in self.markov_chains[1].keys() if isinstance(k, tuple)])
        
        line.append(current)
        current_syllables = self.get_syllable_count(current)
        
        while len(line) < max_words and (not syllable_target or current_syllables < syllable_target):
            candidates = defaultdict(float)
            
            # If we need to use the seed word and haven't yet, prioritize it
            if seed and not seed_used and len(line) < max_words - 2:
                if seed.lower() in self.markov_chains[1].get(tuple([line[-1]]), {}):
                    candidates[seed.lower()] = 100.0  # Very high probability
                    seed_used = True
            
            # Try different n-gram lengths
            for n in [3, 2, 1]:
                if len(line) >= n:
                    current_ngram = tuple(line[-n:])
                    if current_ngram in self.markov_chains[n]:
                        transitions = self.markov_chains[n][current_ngram]
                        weight = 1.0 + (n - 1) * 0.5
                        
                        for word, prob in transitions.items():
                            if word in used_words and not (rhyme_with and len(line) == max_words - 1):
                                continue
                                
                            new_syllables = current_syllables + self.get_syllable_count(word)
                            if syllable_target and new_syllables > syllable_target:
                                continue
                            
                            base_prob = prob * weight
                            
                            # Apply stronger topic influence
                            if topic_words and word in topic_words:
                                topic_boost = topic_words[word] * 3.0
                                base_prob *= (1.0 + topic_boost)
                            
                            # Apply sentiment guidance
                            if target_sentiment is not None:
                                sent_score = self.get_sentiment_score(word)
                                sent_diff = abs(sent_score - target_sentiment)
                                base_prob *= max(0.1, 1 - sent_diff)
                            
                            # Apply rhyming boost
                            if rhyme_with and len(line) == max_words - 1:
                                rhyme_score = self.get_rhyme_score(word, rhyme_with)
                                base_prob *= (1 + rhyme_score * 2)
                            
                            candidates[word] += base_prob
            
            if not candidates:
                # If we haven't used the seed word and we're running out of words, force it
                if seed and not seed_used and force_seed:
                    line.append(seed.lower())
                    seed_used = True
                    continue
                break
            
            # Apply temperature and normalize probabilities
            candidates_list = list(candidates.items())
            words, probs = zip(*candidates_list)
            
            # Apply temperature scaling
            probs = [p ** (1/temperature) for p in probs]
            total = sum(probs)
            if total > 0:
                probs = [p/total for p in probs]
                next_word = random.choices(words, weights=probs, k=1)[0]
                next_prob = candidates[next_word]
                
                line.append(next_word)
                if next_word == seed:
                    seed_used = True
                current_syllables += self.get_syllable_count(next_word)
                total_transitions += 1
                total_prob += next_prob
                
                # Update metrics
                if topic_words:
                    topic_score = topic_words.get(next_word, 0)
                    metrics['topic_coherence'] += topic_score
                if target_sentiment is not None:
                    sent_diff = abs(self.get_sentiment_score(next_word) - target_sentiment)
                    metrics['sentiment_match'] += max(0, 1 - sent_diff)
                if syllable_target:
                    syl_diff = abs(syllable_target - current_syllables)
                    metrics['syllable_match'] += max(0, 1 - syl_diff/syllable_target)
            else:
                break
        
        # If we still haven't used the seed word and we must use it, regenerate the line
        if force_seed and seed and not seed_used:
            return self.generate_line(
                seed=seed,
                max_words=max_words,
                rhyme_with=rhyme_with,
                topic_words=topic_words,
                target_sentiment=target_sentiment,
                syllable_target=syllable_target,
                used_words=used_words,
                line_position=line_position,
                temperature=temperature * 1.2,  # Increase temperature to encourage variation
                force_seed=True
            )
        
        # Normalize metrics
        if total_transitions > 0:
            metrics['transition_prob'] = total_prob / total_transitions
            if topic_words:
                metrics['topic_coherence'] /= total_transitions
            if target_sentiment is not None:
                metrics['sentiment_match'] /= total_transitions
            if syllable_target:
                metrics['syllable_match'] /= total_transitions
        
        return " ".join(line), metrics

    def get_rhyme_score(self, word1, word2):
        """Calculate rhyme similarity score between two words"""
        try:
            phones1 = self.rhyme_dict[word1.lower()][0]
            phones2 = self.rhyme_dict[word2.lower()][0]
            
            # Get last syllable phones
            vowel_index1 = max(i for i, phone in enumerate(phones1) if any(c.isdigit() for c in phone))
            vowel_index2 = max(i for i, phone in enumerate(phones2) if any(c.isdigit() for c in phone))
            
            last_syl1 = phones1[vowel_index1:]
            last_syl2 = phones2[vowel_index2:]
            
            # Calculate similarity score
            if last_syl1 == last_syl2:
                return 1.0
            elif last_syl1[-1] == last_syl2[-1]:  # Same final consonant sound
                return 0.8
            elif last_syl1[0] == last_syl2[0]:  # Same vowel sound
                return 0.6
            return 0.0
        except:
            return 0.0

    def generate_chord_progression(self, sentiment=0.0, is_chorus=False, key='G'):
        """Generate a chord progression based on sentiment, section type, and key"""
        # Define progression patterns (roman numerals)
        major_progressions = [
            ["I", "IV", "V", "I"],       # Classic country
            ["I", "vi", "IV", "V"],      # Common emotional
            ["IV", "I", "V", "vi"],      # Modern country
            ["I", "V", "vi", "IV"],      # Pop country
            ["I", "IV", "vi", "V"],      # Nashville style
            ["I", "iii", "IV", "V"],     # Folk influence
            ["IV", "V", "I", "vi"],      # Alternative
            ["I", "V", "IV", "IV"],      # Rock country
            ["vi", "IV", "I", "V"],      # Modern emotional
            ["I", "IV", "I", "V"]        # Traditional
        ]
        
        minor_progressions = [
            ["i", "VI", "III", "VII"],   # Natural minor
            ["i", "iv", "VI", "V"],      # Harmonic minor
            ["i", "VII", "VI", "V"],     # Descending
            ["i", "iv", "v", "i"],       # Traditional minor
            ["i", "VI", "VII", "i"],     # Dark country
            ["i", "III", "VII", "VI"],   # Epic minor
            ["i", "v", "VI", "VII"],     # Modern minor
            ["VI", "VII", "i", "i"],     # Minor resolution
            ["i", "VII", "VI", "III"],   # Minor descent
            ["i", "iv", "III", "VII"]    # Blues minor
        ]

        # Define key mappings
        major_keys = {
            'C': {'I': 'C', 'ii': 'Dm', 'iii': 'Em', 'IV': 'F', 'V': 'G', 'vi': 'Am', 'vii°': 'B°'},
            'G': {'I': 'G', 'ii': 'Am', 'iii': 'Bm', 'IV': 'C', 'V': 'D', 'vi': 'Em', 'vii°': 'F#°'},
            'D': {'I': 'D', 'ii': 'Em', 'iii': 'F#m', 'IV': 'G', 'V': 'A', 'vi': 'Bm', 'vii°': 'C#°'},
            'A': {'I': 'A', 'ii': 'Bm', 'iii': 'C#m', 'IV': 'D', 'V': 'E', 'vi': 'F#m', 'vii°': 'G#°'},
            'E': {'I': 'E', 'ii': 'F#m', 'iii': 'G#m', 'IV': 'A', 'V': 'B', 'vi': 'C#m', 'vii°': 'D#°'},
            'F': {'I': 'F', 'ii': 'Gm', 'iii': 'Am', 'IV': 'Bb', 'V': 'C', 'vi': 'Dm', 'vii°': 'E°'}
        }
        
        minor_keys = {
            'Am': {'i': 'Am', 'ii°': 'B°', 'III': 'C', 'iv': 'Dm', 'v': 'Em', 'VI': 'F', 'VII': 'G'},
            'Em': {'i': 'Em', 'ii°': 'F#°', 'III': 'G', 'iv': 'Am', 'v': 'Bm', 'VI': 'C', 'VII': 'D'},
            'Bm': {'i': 'Bm', 'ii°': 'C#°', 'III': 'D', 'iv': 'Em', 'v': 'F#m', 'VI': 'G', 'VII': 'A'},
            'F#m': {'i': 'F#m', 'ii°': 'G#°', 'III': 'A', 'iv': 'Bm', 'v': 'C#m', 'VI': 'D', 'VII': 'E'},
            'Dm': {'i': 'Dm', 'ii°': 'E°', 'III': 'F', 'iv': 'Gm', 'v': 'Am', 'VI': 'Bb', 'VII': 'C'}
        }

        # Choose progression based on sentiment and section
        if is_chorus:
            # Chorus tends to be more uplifting
            progression_pattern = random.choice(major_progressions)
            key_map = major_keys.get(key, major_keys['G'])  # Default to G if key not found
        else:
            # Verses can be major or minor based on sentiment
            if sentiment > 0:
                progression_pattern = random.choice(major_progressions)
                key_map = major_keys.get(key, major_keys['G'])
            else:
                progression_pattern = random.choice(minor_progressions)
                # Convert major key to relative minor
                relative_minor = {'C': 'Am', 'G': 'Em', 'D': 'Bm', 'A': 'F#m', 'E': 'C#m', 'F': 'Dm'}
                minor_key = relative_minor.get(key, 'Em')
                key_map = minor_keys.get(minor_key, minor_keys['Em'])

        # Convert progression to actual chords
        return [key_map[numeral] for numeral in progression_pattern]

    def generate_verse(self, num_lines=4, seed=None, rhyme_scheme="ABAB", verse_index=0, temperature=1.0, key='G'):
        """Generate a verse with the specified number of lines and rhyme scheme"""
        lines = []
        chords = []
        last_words = {}
        used_words = set()
        
        base_sentiment = random.uniform(-0.3, 0.3)
        sentiment_progression = np.linspace(base_sentiment, base_sentiment + 0.4, num_lines)
        
        topic_words = self.get_topic_words(seed) if seed else None
        syllable_patterns = [8, 6, 8, 6]
        
        # Generate chord progression for the verse
        verse_progression = self.generate_chord_progression(
            sentiment=base_sentiment,
            is_chorus=(verse_index == -1),
            key=key
        )
        
        for i in range(num_lines):
            rhyme_with = None
            if rhyme_scheme:
                current_rhyme = rhyme_scheme[i % len(rhyme_scheme)]
                if current_rhyme in last_words:
                    rhyme_with = last_words[current_rhyme]
            
            # Force seed usage in first line of first verse or chorus
            force_seed = bool(seed and verse_index in [0, -1] and i == 0)
            
            line, metrics = self.generate_line(
                seed=seed,
                rhyme_with=rhyme_with,
                topic_words=topic_words,
                target_sentiment=sentiment_progression[i],
                syllable_target=syllable_patterns[i % len(syllable_patterns)],
                used_words=used_words,
                line_position=i,
                temperature=temperature,
                force_seed=force_seed
            )
            
            words = word_tokenize(line.lower())
            used_words.update(words)
            
            if rhyme_scheme and words:
                last_words[rhyme_scheme[i % len(rhyme_scheme)]] = words[-1]
            
            lines.append(line)
            chords.append(verse_progression[i % len(verse_progression)])
        
        return lines, chords

    def generate_song(self, num_verses=3, chorus_lines=4, seed=None, key='G'):
        """Generate a complete song with verses and choruses."""
        song = []
        song_chords = []
        used_phrases = set()
        used_rhymes = set()
        
        # Generate chorus with specific constraints
        chorus_lines, chorus_chords = self.generate_verse(
            num_lines=chorus_lines,
            seed=seed,
            rhyme_scheme="AABB",
            verse_index=-1,
            temperature=1.0,
            key=key
        )
        
        # Update used phrases from chorus
        for line in chorus_lines:
            words = word_tokenize(line.lower())
            for i in range(len(words)):
                for length in range(2, min(5, len(words) - i + 1)):
                    phrase = ' '.join(words[i:i+length])
                    used_phrases.add(phrase)
            if len(words) > 0:
                used_rhymes.add(words[-1])
        
        # Add initial chorus
        song.extend(chorus_lines)
        song_chords.extend(chorus_chords)
        
        # Generate verses
        sentiments = np.linspace(-0.5, 0.5, num_verses)
        for i in range(num_verses):
            temperature = 1.2 + (i * 0.2)
            
            verse_lines, verse_chords = self.generate_verse(
                num_lines=4,
                seed=seed if i == 0 else None,
                rhyme_scheme="ABAB",
                verse_index=i,
                temperature=temperature,
                key=key
            )
            
            # Update used phrases
            for line in verse_lines:
                words = word_tokenize(line.lower())
                for i in range(len(words)):
                    for length in range(2, min(5, len(words) - i + 1)):
                        phrase = ' '.join(words[i:i+length])
                        used_phrases.add(phrase)
                if len(words) > 0:
                    used_rhymes.add(words[-1])
            
            song.extend(verse_lines)
            song_chords.extend(verse_chords)
            
            if i < num_verses - 1:
                song.extend(chorus_lines)
                song_chords.extend(chorus_chords)
        
        # Add final chorus
        song.extend(chorus_lines)
        song_chords.extend(chorus_chords)
        
        # Store current chords for metrics calculation
        self.current_chords = song_chords
        
        # Verify seed word usage
        if seed:
            seed_lower = seed.lower()
            seed_found = any(seed_lower in line.lower() for line in song)
            if not seed_found:
                # Regenerate first verse with forced seed usage
                new_verse_lines, new_verse_chords = self.generate_verse(
                    num_lines=4,
                    seed=seed,
                    rhyme_scheme="ABAB",
                    verse_index=0,
                    temperature=1.0,
                    key=key
                )
                verse_start = chorus_lines
                verse_end = verse_start + 4
                song[verse_start:verse_end] = new_verse_lines
                song_chords[verse_start:verse_end] = new_verse_chords
                self.current_chords = song_chords
        
        metrics = self.calculate_metrics(song)
        return song, song_chords, metrics

    def get_similar_words(self, word, n=5):
        try:
            similar_words = self.word2vec_model.wv.most_similar(word.lower(), topn=n)
            return [w for w, _ in similar_words]
        except:
            return []

    def build_markov_chains(self):
        print("Building Markov chains...")
        # Initialize counters for transitions
        for n in [1, 2, 3]:
            self.markov_chains[n] = defaultdict(lambda: defaultdict(float))
        
        # Count transitions across all songs
        for line in self.lyrics_data:
            words = word_tokenize(line.lower())
            
            # Build chains for different n-grams
            for n in [1, 2, 3]:
                for i in range(len(words) - n):
                    current = tuple(words[i:i+n])
                    next_word = words[i+n]
                    self.markov_chains[n][current][next_word] += 1
        
        # Normalize probabilities
        for n in [1, 2, 3]:
            for current in self.markov_chains[n]:
                total = sum(self.markov_chains[n][current].values())
                for next_word in self.markov_chains[n][current]:
                    self.markov_chains[n][current][next_word] /= total

    def train_models(self):
        print("Training models...")
        # Prepare sentences for training
        sentences = [word_tokenize(line.lower()) for line in self.lyrics_data]
        
        # Train Word2Vec with larger window and vector size for better semantic capture
        self.word2vec_model = Word2Vec(sentences, vector_size=200, window=8, min_count=2, sg=1)
        
        # Train Topic Model with more topics and passes for better topic separation
        self.dictionary = Dictionary(sentences)
        corpus = [self.dictionary.doc2bow(text) for text in sentences]
        self.topic_model = LdaModel(
            corpus, 
            num_topics=10,  # More topics for finer granularity
            id2word=self.dictionary,
            passes=20,  # More passes for better convergence
            alpha='auto',  # Learn the topic distribution
            random_state=42
        )

    def get_rhyming_word(self, word, candidates):
        try:
            word_phones = self.rhyme_dict[word.lower()][0]
            word_rhyme = word_phones[-2:]  # Get last two phonemes for rhyming
            
            rhyming_words = [w for w in candidates if 
                           w.lower() in self.rhyme_dict and 
                           any(phones[-2:] == word_rhyme for phones in self.rhyme_dict[w.lower()])]
            
            return random.choice(rhyming_words) if rhyming_words else random.choice(candidates)
        except:
            return random.choice(candidates)

    def get_topic_words(self, text, n=10):
        """Get topic-related words with their probabilities"""
        if not text:
            return []
            
        # Get topic distribution for seed text
        bow = self.dictionary.doc2bow(word_tokenize(text.lower()))
        topic_dist = self.topic_model[bow]
        
        if not topic_dist:
            return []
            
        # Get words from top 3 most relevant topics
        topic_words = {}
        sorted_topics = sorted(topic_dist, key=lambda x: x[1], reverse=True)[:3]
        
        for topic_id, topic_prob in sorted_topics:
            # Get top words for this topic with their probabilities
            topic_terms = self.topic_model.get_topic_terms(topic_id, topn=n)
            for term_id, term_prob in topic_terms:
                word = self.dictionary[term_id]
                # Combine topic probability with term probability
                score = topic_prob * term_prob
                if word in topic_words:
                    topic_words[word] = max(topic_words[word], score)
                else:
                    topic_words[word] = score
        
        # Add semantically similar words from word2vec
        try:
            seed_words = word_tokenize(text.lower())
            for word in seed_words:
                if word in self.word2vec_model.wv:
                    similar_words = self.word2vec_model.wv.most_similar(word, topn=5)
                    for sim_word, sim_score in similar_words:
                        if sim_word in topic_words:
                            topic_words[sim_word] = max(topic_words[sim_word], sim_score)
                        else:
                            topic_words[sim_word] = sim_score
        except:
            pass
            
        # Normalize scores
        max_score = max(topic_words.values())
        return {word: score/max_score for word, score in topic_words.items()}

    def get_similar_words_with_prob(self, word, n=5):
        """Get similar words with their probabilities"""
        try:
            # Calculate probability for original word from Markov chains
            original_prob = 0
            original_count = 0
            for chain in self.markov_chains[1].values():
                if word.lower() in chain:
                    total = sum(chain.values())
                    original_prob += chain[word.lower()] / total
                    original_count += 1
            
            # If word exists in chains, average its probability
            if original_count > 0:
                original_prob /= original_count
            else:
                original_prob = 0.1  # Fallback probability if word not in chains
            
            # Get similar words with raw similarity scores
            similar_words = self.word2vec_model.wv.most_similar(word.lower(), topn=n*3)  # Get more candidates
            
            # Filter and calculate probabilities
            valid_words = []
            total_prob = original_prob
            
            for w, sim in similar_words:
                # Convert similarity (-1 to 1) to initial probability (0 to 1)
                prob = (sim + 1) / 2
                
                # Check if word appears in original lyrics and in Markov chains
                if any(w in line.lower() for line in self.lyrics_data) and \
                   any(w in chain for chain in self.markov_chains[1].values()):
                    # Calculate transition probability if available
                    trans_prob = 0
                    count = 0
                    for chain in self.markov_chains[1].values():
                        if w in chain:
                            total = sum(chain.values())
                            trans_prob += chain[w] / total
                            count += 1
                    
                    if count > 0:
                        # Combine similarity with transition probability
                        prob = (prob + (trans_prob / count)) / 2
                    
                    valid_words.append({'word': w, 'probability': prob})
                    total_prob += prob
                
                if len(valid_words) >= n:
                    break
            
            # Add original word to the list
            all_words = [{'word': word, 'probability': original_prob}] + valid_words
            
            # Normalize all probabilities to sum to 1
            if total_prob > 0:
                scale_factor = 1.0 / total_prob
                for word_data in all_words:
                    word_data['probability'] *= scale_factor
            
            # Sort by probability
            all_words.sort(key=lambda x: x['probability'], reverse=True)
            
            return all_words[:n]  # Return top n words
        except:
            # Fallback with just the original word
            return [{'word': word, 'probability': 1.0}]

    def calculate_metrics(self, lyrics):
        """Calculate numerical metrics for generated lyrics"""
        metrics = {}
        
        # 1. Transition Probability Score (0-1)
        total_prob = 0
        total_words = 0
        for line in lyrics:
            words = word_tokenize(line.lower())
            for i in range(len(words) - 1):
                if tuple([words[i]]) in self.markov_chains[1]:
                    next_word_dist = self.markov_chains[1][tuple([words[i]])]
                    if words[i + 1] in next_word_dist:
                        total = sum(next_word_dist.values())
                        prob = next_word_dist[words[i + 1]] / total
                        total_prob += prob
                        total_words += 1
        metrics['transition_probability'] = round(total_prob / max(1, total_words), 3)

        # 2. Topic Coherence (0-1)
        all_words = ' '.join(lyrics).lower()
        bow = self.dictionary.doc2bow(word_tokenize(all_words))
        topic_dist = self.topic_model[bow]
        if topic_dist:
            # Calculate entropy of topic distribution
            probs = [prob for _, prob in topic_dist]
            entropy = -sum(p * np.log2(p) for p in probs if p > 0)
            # Convert to 0-1 scale (lower entropy = higher coherence)
            metrics['topic_coherence'] = round(1 - (entropy / np.log2(len(probs))), 3)
        else:
            metrics['topic_coherence'] = 0.0

        # 3. Sentiment Consistency (0-1)
        sentiments = []
        for line in lyrics:
            sentiment = self.sentiment_analyzer.polarity_scores(line)['compound']
            sentiments.append(sentiment)
        sentiment_std = np.std(sentiments)
        # Convert std dev to 0-1 scale (lower std = higher consistency)
        metrics['sentiment_consistency'] = round(1 - min(sentiment_std, 1), 3)

        # 4. Syllable Pattern Score (0-1)
        target_syllables = 8  # Common in country music
        syllable_scores = []
        for line in lyrics:
            words = word_tokenize(line)
            syllable_count = sum(self.get_syllable_count(word) for word in words)
            syllable_scores.append(1 - min(abs(syllable_count - target_syllables) / target_syllables, 1))
        metrics['syllable_score'] = round(sum(syllable_scores) / len(syllable_scores), 3)

        # 5. Rhyme Score (0-1)
        rhyme_scores = []
        for i in range(0, len(lyrics) - 1, 2):
            if i + 1 < len(lyrics):
                words1 = word_tokenize(lyrics[i])
                words2 = word_tokenize(lyrics[i + 1])
                if words1 and words2:
                    rhyme_score = self.get_rhyme_score(words1[-1], words2[-1])
                    rhyme_scores.append(rhyme_score)
        metrics['rhyme_score'] = round(sum(rhyme_scores) / max(1, len(rhyme_scores)), 3)

        # 6. Topic Influence Score (0-1)
        topic_scores = []
        for line in lyrics:
            words = word_tokenize(line.lower())
            topic_words = self.get_topic_words(' '.join(words))
            if topic_words:
                # Calculate how many words in the line are topic-related
                topic_matches = sum(1 for word in words if word in topic_words)
                topic_scores.append(topic_matches / len(words))
        metrics['topic_influence'] = round(sum(topic_scores) / max(1, len(topic_scores)), 3)

        # 7. Chord-Sentiment Match Score (0-1)
        chord_sentiment_scores = []
        for i, line in enumerate(lyrics):
            if i < len(self.current_chords):  # Only if we have chords
                line_sentiment = self.sentiment_analyzer.polarity_scores(line)['compound']
                # Major chords are "positive", minor chords are "negative"
                chord = self.current_chords[i]
                chord_sentiment = 0.5  # neutral for major chords
                if chord.endswith('m'):  # minor chord
                    chord_sentiment = -0.5
                # Calculate how well the chord type matches the line sentiment
                match_score = 1 - abs(line_sentiment - chord_sentiment)
                chord_sentiment_scores.append(match_score)
        if chord_sentiment_scores:
            metrics['chord_sentiment_match'] = round(sum(chord_sentiment_scores) / len(chord_sentiment_scores), 3)
        else:
            metrics['chord_sentiment_match'] = 0.0

        # Overall Score (0-1)
        weights = {
            'transition_probability': 0.2,
            'topic_coherence': 0.15,
            'sentiment_consistency': 0.15,
            'syllable_score': 0.15,
            'rhyme_score': 0.15,
            'topic_influence': 0.1,
            'chord_sentiment_match': 0.1
        }
        metrics['overall_score'] = round(sum(metrics[k] * weights[k] for k in weights), 3)

        return metrics

    def do_words_rhyme(self, word1, word2):
        """Check if two words rhyme using CMU pronunciation dictionary"""
        try:
            pron1 = self.rhyme_dict[word1][0]
            pron2 = self.rhyme_dict[word2][0]
            return pron1[-2:] == pron2[-2:]  # Compare last two phonemes
        except:
            return False

generator = LyricGenerator()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    try:
        num_verses = max(1, min(5, int(data.get('num_verses', 3))))
        chorus_lines = max(2, min(8, int(data.get('chorus_lines', 4))))
        seed = data.get('seed')
        key = data.get('key', 'G')  # Default to G if no key specified
        regenerate_type = data.get('regenerate_type', 'both')  # 'lyrics', 'chords', or 'both'
        current_lyrics = data.get('current_lyrics', [])
        current_chords = data.get('current_chords', [])
        
        if regenerate_type == 'lyrics' and current_chords:
            # Only regenerate lyrics, keep existing chords
            lyrics, _, metrics = generator.generate_song(
                num_verses=num_verses,
                chorus_lines=chorus_lines,
                seed=seed,
                key=key
            )
            return jsonify({
                'lyrics': lyrics,
                'chords': current_chords,
                'metrics': metrics,
                'similar_words': generator.get_similar_words(seed) if seed else []
            })
        elif regenerate_type == 'chords' and current_lyrics:
            # Only regenerate chords, keep existing lyrics
            # Generate new sentiment-based chord progressions
            chords = []
            current_index = 0
            
            # Generate chorus chords
            chorus_sentiment = sum(generator.get_sentiment_score(line) for line in current_lyrics[:chorus_lines]) / chorus_lines
            chorus_progression = generator.generate_chord_progression(
                sentiment=chorus_sentiment,
                is_chorus=True,
                key=key
            )
            for i in range(chorus_lines):
                chords.append(chorus_progression[i % len(chorus_progression)])
            current_index += chorus_lines
            
            # Generate verse chords
            while current_index < len(current_lyrics):
                verse_lines = current_lyrics[current_index:current_index + 4]
                verse_sentiment = sum(generator.get_sentiment_score(line) for line in verse_lines) / len(verse_lines)
                verse_progression = generator.generate_chord_progression(
                    sentiment=verse_sentiment,
                    is_chorus=False,
                    key=key
                )
                for i in range(len(verse_lines)):
                    chords.append(verse_progression[i % len(verse_progression)])
                current_index += 4
                
                # Add chorus chords if there's more content
                if current_index + chorus_lines <= len(current_lyrics):
                    for i in range(chorus_lines):
                        chords.append(chorus_progression[i % len(chorus_progression)])
                    current_index += chorus_lines
            
            return jsonify({
                'lyrics': current_lyrics,
                'chords': chords,
                'metrics': generator.calculate_metrics(current_lyrics),
                'similar_words': generator.get_similar_words(seed) if seed else []
            })
        else:
            # Generate both lyrics and chords
            lyrics, chords, metrics = generator.generate_song(
                num_verses=num_verses,
                chorus_lines=chorus_lines,
                seed=seed,
                key=key
            )
            return jsonify({
                'lyrics': lyrics,
                'chords': chords,
                'metrics': metrics,
                'similar_words': generator.get_similar_words(seed) if seed else []
            })
    except ValueError as e:
        return jsonify({
            'error': 'Invalid input parameters',
            'message': str(e)
        }), 400

@app.route('/similar-words/<word>')
def get_similar_words(word):
    similar = generator.get_similar_words(word)
    return jsonify({'similar_words': similar})

@app.route('/get_similar_words', methods=['POST'])
def get_similar_words_post():
    word = request.json.get('word', '')
    similar_words = generator.get_similar_words_with_prob(word)
    return jsonify({'words': similar_words})

if __name__ == '__main__':
    app.run(debug=True, port=5000) 