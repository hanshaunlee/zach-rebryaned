import json
import os
import re

def clean_text(text):
    # Keep only letters, spaces, and newlines
    # Replace multiple spaces with single space
    # Replace multiple newlines with single newline
    text = re.sub(r'[^a-zA-Z\s\n]', '', text)
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'\n+', '\n', text)
    return text.strip()

def clean_title(title):
    # Remove special characters and clean up the title
    # Keep only letters and spaces
    title = re.sub(r'[^a-zA-Z\s]', '', title)
    title = re.sub(r'\s+', ' ', title)
    return title.strip()

def clean_lyrics_file(input_path='app/data/lyrics.json', output_path='app/data/lyrics_clean.json'):
    try:
        # Read existing lyrics
        with open(input_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print(f"Found {len(data)} songs to clean")
        
        # Clean each song
        cleaned_data = []
        for song in data:
            cleaned_song = {
                'title': clean_title(song['title']),
                'lyrics': clean_text(song['lyrics'])
            }
            cleaned_data.append(cleaned_song)
        
        # Save cleaned lyrics
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(cleaned_data, f, indent=4)
        
        print(f"Successfully cleaned and saved {len(cleaned_data)} songs to {output_path}")
        return True
        
    except Exception as e:
        print(f"Error cleaning lyrics: {str(e)}")
        return False

if __name__ == "__main__":
    clean_lyrics_file() 