# Stan Helsloot
# 10762388
import csv
import pandas as pd
import matplotlib.pyplot as plt
import json

RAW_INPUT = "input.csv"
INPUT = "input_edited.csv"


# loading and parsing dataset
def load_input(filename):
    """Save all the empty and "unkown" columns"""
    attribute_list = []
    with open(filename, "r") as file:
        reader = csv.DictReader(file)
        for row in reader:
            attribute_dict = {}
            for key in ["Country", "Region", "Pop. Density (per sq. mi.)",
                        "Infant mortality (per 1000 births)",
                        "GDP ($ per capita) dollars"]:
                if row[key] == "unknown":
                    # edit input
                    population = row["Population"]
                    area = row["Area (sq. mi.)"]
                    population_density = int(population) / int(area)
                    row[key] = round(population_density)
                    attribute_dict[key] = row[key]
                elif row[key]:
                    if type(row[key]) == str:
                        row[key] = row[key].strip()

                    if key == "GDP ($ per capita) dollars":
                        split = row[key].split()
                        row[key] = int(split[0])
                    if key == "Infant mortality (per 1000 births)":
                        row[key] = row[key].replace(",", ".")
                        row[key] = float(row[key])
                    attribute_dict[key] = row[key]
                else:
                    attribute_dict[key] = 0
            attribute_list.append(attribute_dict)

    return attribute_list


def edit_input(filename,  attribute_list):
    """Edit the empty and unkown columns and write all remaining data"""
    with open("input_edited.csv", "w") as csvfile:
        fieldnames = ["Country", "Region", "Pop. Density (per sq. mi.)",
                      "Infant mortality (per 1000 births)",
                      "GDP ($ per capita) dollars"]
        writer = csv.DictWriter(csvfile, fieldnames)
        # write the headers for the columns
        writer.writeheader()
        # write all data to the csv file
        for row in attribute_list:
            writer.writerow(row)


def set_pandas(data):
    df = pd.read_csv(data)
    return df


def calculate_gdp(df):
    gdp = df.ix[:, "GDP ($ per capita) dollars"]
    # sort the colomn to determine outliers
    gdp = gdp.sort_values()
    # gather information on the median, mean and mode
    # select the country corresponding to the median
    country_list = return_countries(df, gdp.median(),
                                    "GDP ($ per capita) dollars")
    print("The median is ", gdp.median(), " dollars. Coutries with a gdp \
corresponding to the median are: ", country_list, "")

    print("""The standard deviation was caluculated. From this was noted that
    the std larger than most of the values. The outlier at 400000 was Suriname,
    which was thereafter excluded from the plot. This reduced the std by
    nearly a factor 3.""")
    # remove Suriname from the series of GDP
    gdp = gdp.drop(193)
    # std = gdp.std()
    # print(std)
    mean = round(gdp.mean())
    print("The mean has a value of", mean, "dollars")
    country_list = return_countries(df, gdp.mode()[0],
                                    "GDP ($ per capita) dollars")
    print("The mode has a value of", gdp.mode()[0], "dollars, \
corresponding with the following countries: ", country_list, "")
    # get the countries representing these numbers
    return gdp


def return_countries(df, value, column):
    country_raw = df.loc[df[column] == value]
    country_raw = country_raw.ix[:, "Country"]
    country_list = []
    for country in country_raw:
        country_list.append(country)
    return(country_list)


def calculate_mortality(df):
    mortality = df.ix[:, "Infant mortality (per 1000 births)"]
    mortality = mortality.sort_values()
    print("""Several countries did not have records on the infant mortality rate
    according to the data. These countries were excluded from the dataset.
    Rows with unreliable data were found by searching for the countries with
    a mortality rate of 0.0. These countries were searched for in the
    and removedinput_edited""")
    # drop countries with unreliable values
    mortality = mortality.drop(labels=[47, 221, 223])
    # calcute the minimum
    minimum = mortality.min()
    print("The lowest reliable value is", minimum, " deaths per 1000 births")
    first_quartile = mortality.quantile(.25)
    print("The first quartile equals ", first_quartile, "deaths per 1000 births")
    median = mortality.median()
    print("The median equals ", median, "deaths per 1000 births")
    third_quartile = mortality.quantile(.75)
    print("The third quartile equals ", third_quartile, "deaths per 1000 births")
    maximum = mortality.max()
    # could not verify that this value is reliable, but maybe it is old data?
    print("The maximum equals ", maximum, "deaths per 1000 births")

    return mortality


def plot(gdp, mortality):

    plt.subplot(3, 1, 1)
    plt.hist(gdp)
    plt.title("The GDP plotted against the amount of countries")
    plt.xlabel("GDP ($ per capita) dollars")
    plt.ylabel("Amount of countries")

    plt.subplot(3, 1, 2)
    plt.boxplot(mortality)
    plt.title("The infant mortality rate plotted as a boxplot")
    # plt.axis("equal")
    plt.ylabel("Infant mortality (per 1000 births)")

    plt.subplots_adjust(hspace=2)
    plt.show()


def make_json(attribute_list):
    # convert attribute_list to json usable format
    dict_json = {}
    for row in attribute_list:
        # make a key to store the country name
        key = row["Country"]
        # remove country name from the row
        row.pop("Country")
        # use country name as key and the remainder of the row as value
        dict_json[key] = row
    with open('data.json', 'w') as outfile:
        json.dump(dict_json, outfile)


if __name__ == "__main__":
    attribute_list = load_input(RAW_INPUT)
    edit_input("input_edited",  attribute_list)
    df = set_pandas(INPUT)
    gdp = calculate_gdp(df)
    mortality = calculate_mortality(df)
    make_json(attribute_list)
    plot(gdp, mortality)
