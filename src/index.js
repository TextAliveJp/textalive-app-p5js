import P5 from "p5";
import { Player, Ease } from "textalive-app-api";

// プレイヤーの初期化 / Initialize TextAlive Player
const player = new Player({
  app: {
    appAuthor: "TextAlive",
    appName: "p5.js example",
  },
  mediaElement: document.querySelector("#media"),
});

let init = false;

// リスナの登録 / Register listeners
player.addListener({
  onAppReady: (app) => {
    if (!app.managed) {
      // グリーンライツ・セレナーデ / Omoi feat. 初音ミク
      // - 初音ミク「マジカルミライ 2018」テーマソング
      // - 楽曲: http://www.youtube.com/watch?v=XSLhsjepelI
      // - 歌詞: https://piapro.jp/t/61Y2
      player.createFromSongUrl("http://www.youtube.com/watch?v=XSLhsjepelI", {
        video: {
          // 音楽地図訂正履歴: https://songle.jp/songs/1249410/history
          beatId: 3818919,
          chordId: 1207328,
          repetitiveSegmentId: 1942131,
          // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/www.youtube.com%2Fwatch%3Fv%3DXSLhsjepelI
          lyricId: 50145,
          lyricDiffId: 3168
        }
      });
      
      // ブレス・ユア・ブレス / 和田たけあき feat. 初音ミク
      // - 初音ミク「マジカルミライ 2019」テーマソング
      // - 楽曲: http://www.youtube.com/watch?v=a-Nf3QUFkOU
      // - 歌詞: https://piapro.jp/t/Ytwu
      // player.createFromSongUrl("http://www.youtube.com/watch?v=a-Nf3QUFkOU", {
      //   video: {
      //     // 音楽地図訂正履歴: https://songle.jp/songs/1688650/history
      //     beatId: 3818481,
      //     chordId: 1546157,
      //     repetitiveSegmentId: 1942135,
      //     // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/www.youtube.com%2Fwatch%3Fv=a-Nf3QUFkOU
      //     lyricId: 50146,
      //     lyricDiffId: 3143
      //   }
      // });
      
      // 愛されなくても君がいる / ピノキオピー feat. 初音ミク
      // - 初音ミク「マジカルミライ 2020」テーマソング
      // - 楽曲: http://www.youtube.com/watch?v=ygY2qObZv24
      // - 歌詞: https://piapro.jp/t/PLR7
      // player.createFromSongUrl("http://www.youtube.com/watch?v=ygY2qObZv24", {
      //   video: {
      //     // 音楽地図訂正履歴: https://songle.jp/songs/1977449/history
      //     beatId: 3818852,
      //     chordId: 1955797,
      //     repetitiveSegmentId: 1942043,
      //     // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/www.youtube.com%2Fwatch%3Fv=ygY2qObZv24
      //     lyricId: 50150,
      //     lyricDiffId: 3158
      //   }
      // });
    }
  },

  onTextLoad: (body) => {
    // Webフォントを確実に読み込むためDOM要素に歌詞を貼り付ける
    document.querySelector("#dummy").textContent = body?.text;
  },

  onVideoReady: () => {
    if (!player.app.managed) {
      document.querySelector("#message").className = "active";
    }
    document.querySelector("#overlay").className = "inactive";
  },

  onPlay: () => {
    document.querySelector("#message").className = "inactive";
    if (!player.app.managed) {
      document.querySelector("#control").className = "";
    }
    console.log("player.onPlay");
  },

  onPause: () => {
    console.log("player.onPause");
  },

  onSeek: () => {
    console.log("player.onSeek");
  },

  onStop: () => {
    if (!player.app.managed) {
      document.querySelector("#control").className = "active";
    }
    console.log("player.onStop");
  },
});

// 再生終了後に表示する巻き戻しボタン
document.querySelector("#rewind").addEventListener("click", () => {
  player.requestPlay();
});

// p5.js を初期化
new P5((p5) => {
  // キャンバスの大きさなどを計算
  const width = Math.min(640, window.innerWidth);
  const height = Math.min(270, window.innerHeight);
  const margin = 30;
  const numChars = 10;
  const textAreaWidth = width - margin * 2;

  // キャンバスを作成
  p5.setup = () => {
    p5.createCanvas(width, height);
    p5.colorMode(p5.HSB, 100);
    p5.frameRate(30);
    p5.background(40);
    p5.noStroke();
    p5.textFont("Noto Sans JP");
    p5.textAlign(p5.CENTER, p5.CENTER);
  };

  // ビートにあわせて背景を、発声にあわせて歌詞を表示
  p5.draw = () => {
    // プレイヤーが準備できていなかったら何もしない
    if (!player || !player.video) {
      return;
    }
    const position = player.timer.position;

    // 背景
    p5.background(40);
    const beat = player.findBeat(position);
    if (beat) {
      const progress = beat.progress(position);
      const rectHeight = Ease.quintIn(progress) * height;
      p5.fill(0, 0, 0, Ease.quintOut(progress) * 60);
      p5.rect(0, rectHeight, width, height - rectHeight);
    }

    // 歌詞
    // - 再生位置より 100 [ms] 前の時点での発声文字を取得
    // - { loose: true } にすることで発声中でなければ一つ後ろの文字を取得
    let char = player.video.findChar(position - 100, { loose: true });

    if (char) {
      // 位置決めのため、文字が歌詞全体で何番目かも取得しておく
      let index = player.video.findIndex(char);

      while (char) {
        if (char.endTime + 160 < position) {
          // これ以降の文字は表示する必要がない
          break;
        }
        if (char.startTime < position + 100) {
          const x = ((index % numChars) + 0.5) * (textAreaWidth / numChars);
          let transparency,
            y = 0,
            size = 39;

          // 100 [ms] かけてフェードインしてくる
          if (position < char.startTime) {
            const progress = 1 - (char.startTime - position) / 100;
            const eased = Ease.circIn(progress);
            transparency = progress;
            size = 39 * eased + Math.min(width, height) * (1 - eased);
          }
          // 160 [ms] かけてフェードアウトする
          else if (char.endTime < position) {
            const progress = (position - char.endTime) / 160;
            const eased = Ease.quintIn(progress);
            transparency = 1 - eased;
            y = -eased * (height / 2);
          }
          // 発声区間中は完全に不透明
          else {
            transparency = 1;
          }

          p5.fill(0, 0, 100, transparency * 100);
          p5.textSize(size);
          p5.text(char.text, margin + x, height / 2 + y);
        }
        char = char.next;
        index++;
      }
    }
  };
});
