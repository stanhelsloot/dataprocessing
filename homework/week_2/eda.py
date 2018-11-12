# Stan Helsloot
# 10762388
import csv
import pandas as pd
import matplotlib.pyplot as plt

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
                        row[key] = split[0]
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
    length = (len(df.index) - 1)//2
    gdp = gdp.sort_values()
    median = gdp.iloc[length]
    print(median)
    mean = gdp.sum()//len(df.index)
    print(mean)
    # mode is most common gdp
    counter = {}
    list_1 = []
    for i in range(len(df.index)):
        list_1.append(int(gdp.iloc[i]))
        if gdp.iloc[i] in counter:
            counter[gdp.iloc[i]] += 1
        else:
            counter[gdp.iloc[i]] = 1
    mode = max(counter, key=counter.get)
    print(mode)
    return list_1


def calculate_mortality(df):
    mortality = df.ix[:, "Infant mortality (per 1000 births)"]
    mortality = mortality.sort_values()
    return mortality


def plot(gdp, mortality):

    plt.subplot(2, 1, 1)
    plt.hist(gdp, density=True, bins=30)
    plt.title('GDP, MORTALITY')
    plt.xlabel('GDP')
    plt.ylabel("Amount of countries")

    plt.subplot(2, 1, 2)
    plt.boxplot(mortality)
    plt.ylabel('MORTALITY')

    plt.show()


if __name__ == "__main__":
    attribute_list = load_input(RAW_INPUT)
    edit_input("input_edited",  attribute_list)
    df = set_pandas(INPUT)
    gdp = calculate_gdp(df)
    mortality = calculate_mortality(df)
    plot(gdp, mortality)
