#!/usr/bin/env python
# Name: Stan Helsloot
# Student number: 10762388
"""
This script scrapes IMDB and outputs a CSV file with highest rated movies.
"""

import csv
import re
from requests import get
from requests.exceptions import RequestException
from contextlib import closing
from bs4 import BeautifulSoup

TARGET_URL = "https://www.imdb.com/search/title?title_type=feature&release_date=2008-01-01,2018-01-01&num_votes=5000,&sort=user_rating,desc"
BACKUP_HTML = 'movies.html'
OUTPUT_CSV = 'movies.csv'


def extract_movies(dom):
    """
    Extract a list of highest rated movies from DOM (of IMDB page).
    Each movie entry should contain the following fields:
    - Title
    - Rating
    - Year of release (only a number!)
    - Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)
    """

    # ADD YOUR CODE HERE TO EXTRACT THE ABOVE INFORMATION ABOUT THE
    # HIGHEST RATED MOVIES
    # NOTE: FOR THIS EXERCISE YOU ARE ALLOWED (BUT NOT REQUIRED) TO IGNORE
    # UNICODE CHARACTERS AND SIMPLY LEAVE THEM OUT OF THE OUTPUT.
    title_list = []
    html_data = open(BACKUP_HTML, 'r')
    soup = BeautifulSoup(html_data, 'html.parser')
    for movie_header in soup.find_all('h3'):
        movie_title = movie_header.find('a')
        if movie_title:
            text = movie_title.get_text()
            # retrieves titles
            text = text.strip()
            title_list.append(text)

    # retrieves rating
    rating_list = []
    for rating in soup.find_all('strong'):
        if "." in rating.text:
            rating_list.append(rating.text)

    # retrieves year of release
    year_list = []
    year = soup.find_all("span", "lister-item-year text-muted unbold")
    for i in year:
        i = i.string
        if " " in i:
            i = i.split()
            i = i[1]
        i = i.strip("()")
        year_list.append(i)

    # actors/actresses
    actor_list = []
    actor = soup.find_all("p", class_="")
    for line in actor:
        line = line.text.strip()
        # select everything after Stars:\n using regex. include newlines
        m = re.search(r'(?<=Stars:\n)\w.*', line, re.DOTALL)
        if m:
            # actors are split into a list which is appended to another list
            actor = m.group(0).split("\n")
            actor_list.append(actor)

    # retrieves list of runtimes
    runtime_list = []
    runtime = soup.find_all("span", "runtime")
    for i in runtime:
        i = i.string.split()
        runtime_list.append(i[0])


    return [title_list, rating_list, year_list, actor_list, runtime_list]


def save_csv(outfile, movies):
    """
    Output a CSV file containing highest rated movies.
    """
    writer = csv.writer(outfile)
    writer.writerow(['Title', 'Rating', 'Year', 'Actors', 'Runtime'])

    rows = zip(movies[0], movies[1], movies[2], movies[3], movies[4])
    for row in rows:
        writer.writerow(row)

    # ADD SOME CODE OF YOURSELF HERE TO WRITE THE MOVIES TO DISK


def simple_get(url):
    """
    Attempts to get the content at `url` by making an HTTP GET request.
    If the content-type of response is some kind of HTML/XML, return the
    text content, otherwise return None
    """
    try:
        with closing(get(url, stream=True)) as resp:
            if is_good_response(resp):
                return resp.content
            else:
                return None
    except RequestException as e:
        print('The following error occurred during HTTP GET request to {0} : {1}'.format(url, str(e)))
        return None


def is_good_response(resp):
    """
    Returns true if the response seems to be HTML, false otherwise
    """
    content_type = resp.headers['Content-Type'].lower()
    return (resp.status_code == 200
            and content_type is not None
            and content_type.find('html') > -1)


if __name__ == "__main__":

    # get HTML content at target URL
    html = simple_get(TARGET_URL)

    # save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # parse the HTML file into a DOM representation
    dom = BeautifulSoup(html, 'html.parser')

    # extract the movies (using the function you implemented)
    movies = extract_movies(dom)

    # write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'w', newline='') as output_file:
        save_csv(output_file, movies)
