#!/usr/bin/env python
# Name:
# Student number:
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
with open(INPUT_CSV, newline = "") as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        # collect all ratings per year
        data_dict[row["Year"]].append(row["Rating"])

# make averages of the ratings
for year in range(START_YEAR, END_YEAR):
    rating_list = data_dict[str(year)]
    rating_average = []
    for rating in rating_list:
        rating = float(rating)
        rating_average.append(rating)
    rating_average = sum(rating_average) / float(len(rating_list))
    data_dict[str(year)] = rating_average

    # print(rating_list)


if __name__ == "__main__":
    year_list = []
    data_list = []
    for year in range(START_YEAR, END_YEAR):
        year_list.append(year)
        data_list.append(data_dict[str(year)])
    plt.plot(year_list, data_list)
    plt.axis([2007, 2019, 6, 10])
    plt.show()
