# Stan Helsloot, 10762388
# program desgined for transforming csv/txt files to JSON files.
import pandas as pd
import json

INPUT_CSV = "BMI_data.csv"

def read_write_file(filename):
    """Method for reading input file"""
    # use csv file to load dataframe
    df = pd.read_csv(filename)
    # only the data of mean BMI, sex, country and year will be used
    df = df[["Country", "ISO", "Year", "Sex", "Mean BMI"]]
    # sort the data on BMI_data
    df = df.sort_values("Year", ascending=False)
    # round values to 1 decimal
    df = df.round(1)
    print(df)
    # df_processed has to be converted to usable JSON format
    df_json_ready = df.to_dict(orient="split")
    df_json_ready.pop("index")

    with open('data_years.json', 'w') as outfile:
        json.dump(df_json_ready, outfile)


if __name__ == "__main__":
    read_write_file(INPUT_CSV)
