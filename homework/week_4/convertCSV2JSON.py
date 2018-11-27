# Stan Helsloot, 10762388
# program desgined for transforming csv/txt files to JSON files.
import pandas as pd
import json

INPUT_CSV = "BMI_data.csv"
COUNTRY_LIST = ["AUT", "BEL", "BGR", "HRV", "CYP", "CZE", "DNK", "EST", "FIN",
                "FRA", "DEU", "GRC", "HUN", "IRL", "ITA", "LVA", "LTU", "LUX",
                "MLT", "NLD", "POL", "PRT", "ROU", "SVK", "SVN", "ESP",
                "SWE", "GBR"]


def read_write_file(filename):
    """Method for reading input file"""
    # use csv file to load dataframe
    df = pd.read_csv(filename)
    # only data of the year 2016 will be used
    df = df.loc[df["Year"] == 2016]
    # only select European countries
    df = df.loc[df["ISO"].isin(COUNTRY_LIST)]
    # only the data of mean BMI, sex, country and year will be used
    df = df[["ISO", "Sex", "Mean BMI"]]
    # sort the data on country code
    df = df.sort_values("ISO")
    # df_processed has to be converted to usable JSON format
    df_json_ready = df.to_dict(orient="split")
    df_json_ready.pop("index")
    with open('data.json', 'w') as outfile:
        json.dump(df_json_ready, outfile)


if __name__ == "__main__":
    read_write_file(INPUT_CSV)
