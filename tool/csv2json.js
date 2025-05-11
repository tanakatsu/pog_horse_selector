const fs = require('fs');
const csv = require('csv-parser');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');


const argv = yargs(hideBin(process.argv))
    .option('output', {
        alias: 'o',
        type: 'string',
        default: 'horse_catalogue.json',
        description: 'output filename'
    })
    .demandCommand(1)
    .help()
    .argv;

const csvfile = argv._[0];
const outputFile = argv.output;

const results = [];
const missingRows = [];

fs.createReadStream(csvfile)
    .pipe(csv())
    .on('data', (row) => {
        results.push(row);
    })
    .on('end', () => {
        // 欠損値のチェック
        const validRows = results.filter(row => {
            const isValid = row.name && row.sire && row.mare;
            if (!isValid) {
                if (!row.name) {
                    console.log(`Missing name: ${row.id}`);
                }
                if (!row.sire) {
                    console.log(`Missing sire: ${row.id}`);
                }
                if (!row.mare) {
                    console.log(`Missing mare: ${row.id}`);
                }
                missingRows.push(row);
            }
            return isValid;
        });

        // 種牡馬ごとの出現回数をカウント
        const sireCounts = {};
        validRows.forEach(row => {
            if (row.sire) {
                sireCounts[row.sire] = (sireCounts[row.sire] || 0) + 1;
            }
        });

        // 種牡馬の出現回数を各行に追加
        const rowsWithSireCount = validRows.map(row => ({
            ...row,
            sire_count: sireCounts[row.sire] || 0
        }));

        // 種牡馬の出現回数で降順ソート
        rowsWithSireCount.sort((a, b) => b.sire_count - a.sire_count);

        // 必要なデータだけを抽出
        const data = rowsWithSireCount.map(row => ({
            id: row.id,
            name: row.name,
            sire: row.sire,
            mare: row.mare,
            sire_count: row.sire_count
        }));

        // JSONファイルに書き込み
        fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
        console.log(`Converted data saved to ${outputFile}`);
    });
