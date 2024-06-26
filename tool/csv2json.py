import pandas as pd
import json
from argparse import ArgumentParser

SIRE_RANK = [
    # ランキング上位
    "キズナ",
    "エピファネイア",
    "スワーヴリチャード",
    "モーリス",
    "リアルスティール",
    "ディープインパクト",
    "ロードカナロア",
    "ドレフォン",
    "ブリックスアンドモルタル",
    "ニューイヤーズデイ",
    "ドゥラメンテ",
    "ダイワメジャー",
    "レイデオロ",
    "ルーラーシップ",
    "ヘニーヒューズ",
    "ゴールドシップ",
    # その他
    "ハービンジャー",
    "ハーツクライ",
    "キタサンブラック",
    "シルバーステート",
    "オルフェーヴル"
    # 新種牡馬
    "ルヴァンスレーヴ",
    "ゴールドドリーム",
    "サートゥルナーリア",
    "ウインブライト",
    "アドマイヤマーズ"
]

parser = ArgumentParser()
parser.add_argument("csvfile", type=str, help="csvfile")
parser.add_argument("-o", "--output", type=str, default="horse_catalogue.json", help="output filename")
args = parser.parse_args()

df = pd.read_csv(args.csvfile)
df['sort_order'] = df['sire'].apply(lambda x: len(SIRE_RANK) - SIRE_RANK.index(x) if x in SIRE_RANK else 0)
df = df.sort_values('sort_order', ascending=False)
data = []
for i, row in df.iterrows():
    data.append({"id": row["id"], "name": row["name"], "sire": row["sire"], "mare": row["mare"]})
json.dump(data, open(args.output, "w"), ensure_ascii=False)
