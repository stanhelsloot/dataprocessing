#!/usr/bin/env python
# Name: Stan Helsloot
# Student number: 10762388
"""
This script visualizes data obtained from a .csv file
"""

import csv
import matplotlib.pyplot as plt

# Global constants for the input file, first and last year
INPUT_CSV = "movies.csv"
START_YEAR = 2008
END_YEAR = 2018

# Global dictionary for the data
data_dict = {str(key): [] for key in range(START_YEAR, END_YEAR)}

# add movies.csv data to data_dict
with open(INPUT_CSV, newline="") as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        # collect all ratings per year
        data_dict[row["Year"]].append(row["Rating"])

# make averages of the ratings
for year in range(START_YEAR, END_YEAR):
    rating_list = data_dict[str(year)]
    # convert items in rating_list to floats
    rating_list = [float(rating) for rating in rating_list]
    rating_average = sum(rating_list) / float(len(rating_list))
    data_dict[str(year)] = rating_average


if __name__ == "__main__":
    year_list = []
    data_list = []
    for year in range(START_YEAR, END_YEAR):
        year_list.append(year)
        data_list.append(data_dict[str(year)])
    plt.plot(year_list, data_list)
    plt.axis([2007, 2018, 8, 9])
    plt.xlabel("Year")
    plt.ylabel("Average Rating")
    plt.show()
