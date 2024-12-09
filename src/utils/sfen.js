const sfenMap = new Map();

const multiSet = (klass, sfen, num) => {
    for (let i = 2; i <= num; num++) {
        sfenMap.set(
            klass + '-' + i,
            sfen.repeat(i)
        );
    }
}

sfenMap.set('white-lance', 'l');
sfenMap.set('white-knight', 'n');
sfenMap.set('white-silver', 's');
sfenMap.set('white-gold', 'g');
sfenMap.set('white-king', 'k');
sfenMap.set('white-rook', 'r');
sfenMap.set('white-bishop', 'b');
sfenMap.set('white-pawn', 'p');
sfenMap.set('white-prom-pawn', '+p');
sfenMap.set('white-prom-knight', '+n');
sfenMap.set('white-prom-lance', '+l');
sfenMap.set('white-prom-silver', '+s');
sfenMap.set('white-horse', '+b');
sfenMap.set('white-dragon', '+r');
multiSet('white-lance', 'l', 4);
multiSet('white-knight', 'n', 4);
multiSet('white-silver', 's', 4);
multiSet('white-gold', 'g', 4);
multiSet('white-rook', 'r', 4);
multiSet('white-bishop', 'b', 4);
multiSet('white-pawn', 'p', 18);

sfenMap.set('black-lance', 'L');
sfenMap.set('black-knight', 'N');
sfenMap.set('black-silver', 'S');
sfenMap.set('black-gold', 'G');
sfenMap.set('black-king', 'K');
sfenMap.set('black-rook', 'R');
sfenMap.set('black-bishop', 'B');
sfenMap.set('black-pawn', 'P');
sfenMap.set('black-prom-pawn', '+P');
sfenMap.set('black-prom-knight', '+N');
sfenMap.set('black-prom-lance', '+L');
sfenMap.set('black-prom-silver', '+S');
sfenMap.set('black-horse', '+B');
sfenMap.set('black-dragon', '+R');
multiSet('black-lance', 'l', 4);
multiSet('black-knight', 'n', 4);
multiSet('black-silver', 's', 4);
multiSet('black-gold', 'g', 4);
multiSet('black-rook', 'r', 4);
multiSet('black-bishop', 'b', 4);
multiSet('black-pawn', 'p', 18);

const isInRange = (koma, x1, y1, x2, y2) => {
  const x = (koma["x1"] + koma["x2"]) / 2;
  const y = (koma["y1"] + koma["y2"]) / 2;

  return x1 < x && x < x2 && y1 < y && y < y2;
};

const replaceDots = (input) => {
    return input.split('/').map(row => {
        return row.replace(/\.+/g, dots => dots.length); // 連続するドットをその長さに置換
    }).join('/');
}

export const createSfen = (result) => {
  const board = result.filter((e) => e["class"] == "board")[0];
  const boardWidth = board["x2"] - board["x1"];
  const boardHeight = board["y2"] - board["y1"];
  const gridWidth = boardWidth / 9; // 1マスあたりの幅
  const gridHeight = boardHeight / 9; // 1マスあたりの高さ

  const komas = result.filter((e) => e["class"] != "board");

  // 盤上の駒に対してSFEN文字列を生成
  let sfenXs = [];
  for (let y = board["y1"]; y < board["y2"]; y = y + gridHeight) {
    let sfenX = '';
    for (let x = board["x1"]; x < board["x2"]; x = x + gridWidth) {
      let nextX = Math.min(x + gridWidth, board["x2"]);
      let nextY = Math.min(y + gridHeight, board["y2"]);

      const maybeKoma = komas.filter((koma) =>
        isInRange(koma, x, y, nextX, nextY)
      );

      if(maybeKoma.length == 1) {
        const koma = sfenMap.get(maybeKoma[0]["class"])
        if(koma) {
            sfenX += koma;
        } else {
            sfenX += ".";
        }
      } else {
        sfenX += ".";
      }
    }
    sfenXs.push(sfenX);
  }
  let resultSfen = replaceDots(sfenXs.join('/'))

  console.log(resultSfen);
};
