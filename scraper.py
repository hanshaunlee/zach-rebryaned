import requests
import json
import os
import time
import re
from bs4 import BeautifulSoup

class LyricsScraper:
    def __init__(self):
        self.base_url = "https://www.lyrics.com"
        self.artist_url = f"{self.base_url}/artist/Zach-Bryan/2137860881"
        self.lyrics_data = []
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

    def clean_text(self, text):
        # Keep only letters, spaces, and newlines
        # Replace multiple spaces with single space
        # Replace multiple newlines with single newline
        text = re.sub(r'[^a-zA-Z\s\n]', '', text)
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'\n+', '\n', text)
        text = text.strip()
        return text

    def clean_title(self, title):
        # Remove special characters and clean up the title
        # Keep only letters and spaces
        title = re.sub(r'[^a-zA-Z\s]', '', title)
        title = re.sub(r'\s+', ' ', title)
        return title.strip()

    @staticmethod
    def clean_existing_lyrics():
        input_path = os.path.join('app', 'data', 'lyrics.json')
        output_path = os.path.join('app', 'data', 'lyrics_clean.json')
        
        try:
            # Read existing lyrics
            with open(input_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            print(f"Found {len(data)} songs to clean")
            
            # Clean each song
            cleaned_data = []
            for song in data:
                # Create new instance to use cleaning methods
                scraper = LyricsScraper()
                cleaned_song = {
                    'title': scraper.clean_title(song['title']),
                    'lyrics': scraper.clean_text(song['lyrics'])
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

    def get_song_urls(self):
        try:
            print("Getting song URLs from artist page...")
            all_song_urls = []
            
            # Get the main artist page
            response = requests.get(self.artist_url, headers=self.headers)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Find all song links in the table
            table = soup.find('table', {'class': 'tdata'})
            if table:
                rows = table.find_all('tr')
                for row in rows:
                    link = row.find('a', href=lambda x: x and x.startswith('/lyric'))
                    if link and 'href' in link.attrs:
                        song_url = f"{self.base_url}{link['href']}"
                        all_song_urls.append(song_url)
            
            print(f"Found {len(all_song_urls)} song URLs")
            return all_song_urls
        except Exception as e:
            print(f"Error getting song URLs: {str(e)}")
            return []

    def scrape_lyrics(self):
        try:
            print("Starting to scrape lyrics from lyrics.com...")
            song_urls = self.get_song_urls()
            
            if not song_urls:
                print("No song URLs found. Using sample data...")
                self.use_sample_data()
                self.save_lyrics()
                return False
            
            # Process each song URL
            for song_url in song_urls:
                try:
                    print(f"Scraping: {song_url}")
                    
                    song_response = requests.get(song_url, headers=self.headers)
                    song_soup = BeautifulSoup(song_response.text, 'html.parser')
                    
                    # Extract lyrics
                    lyrics_div = song_soup.find('pre', {'id': 'lyric-body-text'})
                    if lyrics_div:
                        lyrics = lyrics_div.get_text().strip()
                        # Clean lyrics and title
                        lyrics = self.clean_text(lyrics)
                        title = self.clean_title(song_url.split('/')[-1])
                        
                        if lyrics and len(lyrics.split()) > 10:  # Ensure we have meaningful lyrics
                            self.lyrics_data.append({
                                'title': title,
                                'lyrics': lyrics
                            })
                            print(f"Successfully scraped: {title}")
                            
                            # Save after each successful scrape
                            self.save_lyrics()
                    
                    # Be nice to the server
                    time.sleep(2)
                    
                except Exception as e:
                    print(f"Error scraping song: {str(e)}")
                    continue
            
            if not self.lyrics_data:
                print("No lyrics were scraped. Using sample data instead...")
                self.use_sample_data()
            else:
                print(f"Successfully scraped {len(self.lyrics_data)} songs")
            
            self.save_lyrics()
            return True
            
        except Exception as e:
            print(f"Error scraping lyrics: {str(e)}")
            print("Using sample data instead...")
            self.use_sample_data()
            self.save_lyrics()
            return False

    def use_sample_data(self):
        # Backup sample data in case scraping fails
        self.lyrics_data = [
            {
                "title": "Something in the Orange",
                "lyrics": "Dirty hat waiting on a woman\nBurning up that highway to her town\nShes all I can see right now\nHer favorite songs coming on the radio\nSunset starting to show\nIm just waiting on a woman\n\nSomething in the orange\nTells me were not done\nShes somewhere between being gone and\nStaying staying staying\nSomething in the orange\nTells me were not done"
            },
            {
                "title": "Oklahoma Smokeshow",
                "lyrics": "Well shes an Oklahoma smokeshow\nWith a heart of gold\nShes got that look in her eyes\nThat will save your soul\nShes a backroads baby\nWith a wild side\nShes an Oklahoma smokeshow\nAnd shes all mine"
            }
        ]

    def save_lyrics(self):
        output_path = os.path.join('app', 'data', 'lyrics.json')
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.lyrics_data, f, indent=4)
        print(f"Saved {len(self.lyrics_data)} songs to {output_path}")

if __name__ == "__main__":
    # Clean existing lyrics instead of scraping
    LyricsScraper.clean_existing_lyrics() 