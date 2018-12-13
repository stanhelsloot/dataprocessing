# Stan Helsloot, 10762388
# program desgined for transforming xml files to JSON files.
import pandas as pd
import json
import xlrd

INPUT = "API_VC.IHR.PSRC.P5_DS2_en_csv_v2_10225554.csv"
INPUT_CSV = "csvfile.csv"

def read_write_file(filename):
    """Method for reading input file"""
    df_csv = pd.read_csv(f"{INPUT}")
    # select country names
    df = df_csv.loc[:, ["Country Name", "Country Code", "2015"]]
    # remove all rows with missing elements
    data = df.dropna()
    df_json_ready = data.to_dict(orient="split")
    df_json_ready.pop("index")
    print(df_json_ready)
    with open('data.json', 'w') as outfile:
        json.dump(df_json_ready, outfile)

if __name__ == "__main__":
    read_write_file(INPUT)
