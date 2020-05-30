import pandas as pd
import json
from argparse import ArgumentParser

SIRE_RANK = [
    "ディープインパクト",
    "ロードカナロア",
    "ハーツクライ",
    "オルフェーヴル",
    "キングカメハメハ",
    "ルーラーシップ",
    "ダイワメジャー",
    "ゴールドアリュール",
    "キンシャサノキセキ",
    "キズナ",
    "ハービンジャー",
    "エピファネイア",
    "ヘニーヒューズ",
    "ステイゴールド",
    "クロフネ",
    "ブラックタイド",
    "ジャスタウェイ",
    "スクリーンヒーロー",
    "ヴィクトワールピサ",
    "アイルハヴアナザー",
    # 新種牡馬
    "モーリス",
    "ドゥラメンテ",
    "ミッキーアイル",
    "エイシンヒカリ",
    "ラブリーデイ",
    "ホッコータルマエ",
    "リオンディーズ",
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
