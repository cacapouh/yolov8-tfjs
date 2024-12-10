const komaMap = new Map();

komaMap.set("l", "香");
komaMap.set("n", "桂");
komaMap.set("s", "銀");
komaMap.set("g", "金");
komaMap.set("k", "玉");
komaMap.set("p", "歩");
komaMap.set("r", "飛");
komaMap.set("b", "角");
komaMap.set("+l", "成香");
komaMap.set("+n", "成桂");
komaMap.set("+s", "成銀");
komaMap.set("+p", "と");
komaMap.set("+r", "竜");
komaMap.set("+b", "馬");

komaMap.set("L", "香");
komaMap.set("N", "桂");
komaMap.set("S", "銀");
komaMap.set("G", "金");
komaMap.set("K", "玉");
komaMap.set("P", "歩");
komaMap.set("R", "飛");
komaMap.set("B", "角");
komaMap.set("+L", "成香");
komaMap.set("+N", "成桂");
komaMap.set("+S", "成銀");
komaMap.set("+P", "と");
komaMap.set("+R", "竜");
komaMap.set("+B", "馬");

const positionMap = new Map();
const dans = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];
const dansKanji = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];
const sujis = [9, 8, 7, 6, 5, 4, 3, 2, 1];
for (let x = 0; x < sujis.length; x++) {
  for (let y = 0; y < dans.length; y++) {
    positionMap.set(`${sujis[x]}${dans[y]}`, {
      suji: sujis[x],
      dan: dans[y],
      show: `${sujis[x]}${dansKanji[y]}`,
    });
  }
}

class Position {
  constructor(dan, suji) {
    this.dan = dan;
    this.suji = suji;
  }
}

class KomaWithPosition {
  constructor(koma, position) {
    this.koma = koma;
    this.position = position;
  }
}

export const expectedMovesToHumanReadable = (sfen, usiMoves) => {
  const komas = createKomas(sfen);

  let count = 0;
  if(sfen.split(" ")[1] == "w") { // 後手番
    count = 1;
  }
  return usiMoves.map((move) => {
    const prefix = ["☗", "☖"][count % 2];
    count++;
    return prefix + showMove(komas, move);
  });
};

const createKomas = (sfen) => {
  const komaWithPositions = [];

  const splittedSfen = sfen.split(" ");
  const boardSfen = splittedSfen[0];
  const mochiGomaSfen = splittedSfen[2];

  // SFEN文字列から盤上の駒を解析
  const lines = boardSfen.split("/");
  for (let y = 0; y < dans.length; y++) {
    const line = lines[y];
    const lineWithoutNumber = line.replace(/\d/g, (match) =>
      ".".repeat(Number(match))
    ); // 数字をその数だけドットに置き換える(例: ln1g3nl => ln.g...nl)

    for (let x = 0; x < sujis.length; x++) {
      const maybeKoma = lineWithoutNumber[x];

      if (maybeKoma != ".") {
        if(maybeKoma == "+") {
          komaWithPositions.push(
            new KomaWithPosition('+' + lineWithoutNumber[x + 1], new Position(dans[y], sujis[x]))
          );
          x++;
        } else {
          komaWithPositions.push(
            new KomaWithPosition(maybeKoma, new Position(dans[y], sujis[x]))
          );
        }
      }
    }
  }

  // SFEN文字列から持ち駒を解析
  if (mochiGomaSfen != "-") {
    const withoutNumber = mochiGomaSfen.replace(
      /(\d)([A-Za-z])/g,
      (_, num, char) => char.repeat(Number(num))
    ); // 持ち駒の数値表記を撤廃(例: 2S3p => SSppp)
    Array.from(withoutNumber).forEach((koma) => {
      komaWithPositions.push(new KomaWithPosition(koma));
    });
  }

  return komaWithPositions;
};

const showMove = (komas, usiMove) => {
  // 持ち駒から打つ場合
  if (usiMove.includes("*")) {
    const koma = komaMap.get(usiMove[0]);
    const position = positionMap.get(usiMove[2] + usiMove[3]);
    return `${position["show"]}${koma}打`;
  }

  // 盤上の駒を動かす場合
  const from = positionMap.get(usiMove[0] + usiMove[1]);
  const to = positionMap.get(usiMove[2] + usiMove[3]);
  const maybeKoma = komas.find((koma) => {
    return (
      koma.position && koma.position.suji == from["suji"] && koma.position.dan == from["dan"]
    );
  });
  if(!maybeKoma) {
    console.log(usiMove);
    console.log(komas);
  }

  return `${to["show"]}${komaMap.get(maybeKoma.koma)}(${from["show"]})`;
};
