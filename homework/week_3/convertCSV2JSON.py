# Stan Helsloot, 10762388
# program desgined for transforming csv/txt files to JSON files.
import pandas as pd
import json

INPUT = "KNMI_20181118.txt"


def read_write_file(filename):
    """Method for reading input file"""
    df = pd.read_csv(f"{INPUT}", sep=",", header=None, comment="#")
    df.columns = ["station_id", "date", "max temperature", "max windspeed"]
    # print(df)
    df = df.drop(labels="station_id", axis=1)
    # with open(f"{filename}.json", "w") as JSON_file:
        # json.dump(df, JSON_file)
    df_json_format = df.to_json(orient="records")
    # df_json_format = dict(df_json_format)
    # print(df_json_format)
    with open('data.json', 'w') as outfile:
        json.dump(df_json_format, outfile)
    # with open(filename, "r") as input_file:
    #     for line in input_file:
    #         # what to read: everything without pound sign
    #         if line.startswith("#"):
    #             pass
    #         else:
    #             # lines consist of: station_id,date,  highest T in 0.1 C,
    #             # max windspeed in 0.1 m/s
    #             # split lines at the ","

if __name__ == "__main__":
    read_write_file(INPUT)
