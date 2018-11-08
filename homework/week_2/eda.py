# Stan Helsloot
# 10762388
import csv

INPUT = "input.csv"

# loading and parsing dataset
def load_input(filename):
    with open(filename, "r") as file:
        reader = csv.DictReader(file)
        for row in reader:
            for key in ["Country", "Region", "Pop. Density (per sq. mi.)", "Infant mortality (per 1000 births)", "GDP ($ per capita) dollars"]:
                if row[key]:
                    pass
                else:
                    print(row["Country"])
                if row[key] == "unknown":
                    print(row["Country"])

def edit_input(filename):
    with open(filename, "w") as file:
        writer = csv.DictWriter(file)
        for row in writer:
            for key in ["Country", "Region", "Pop. Density (per sq. mi.)", "Infant mortality (per 1000 births)", "GDP ($ per capita) dollars"]:
                if row[key]:
                    # write old file data
                elif row[key] == "unknown":
                    # if unknown: calculate POPDENSITY
                else:
                    # fill with same datatype as the rest of the colomn

if __name__ == "__main__":
    edit_input(INPUT)
