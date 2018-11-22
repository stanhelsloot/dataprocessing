# Stan Helsloot, 10762388
# program desgined for transforming csv/txt files to JSON files.
import pandas as pd
import json
import xlrd

INPUT = "maatwerktabel_verdrinking_2017.xlsx"
INPUT_CSV = "csvfile.csv"

def read_write_file(filename):
    """Method for reading input file"""
    # converting excel file to csv file
    df_xls = pd.read_excel(f"{INPUT}")
    df_xls.to_csv('csvfile.csv', index=False)
    # use csv file to load dataframe
    df = pd.read_csv(INPUT_CSV, sep=",")
    # Only the data of the age group 10-19 will be used
    df_processed = df[["Jaar", "10-19 jaar"]]
    # df_processed has to be converted to usable JSON format
    df_json_ready = df_processed.to_dict(orient="split")
    df_json_ready.pop("index")
    print(df_json_ready)
    with open('data.json', 'w') as outfile:
        json.dump(df_json_ready, outfile)


if __name__ == "__main__":
    read_write_file(INPUT)
