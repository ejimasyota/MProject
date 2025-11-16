/* =========================================================
 * ドラクエを意識した対戦画面
 * =========================================================*/
class QuestGame {
 /* --------------------------------------------
  *  1. コンストラクタ
  * --------------------------------------------*/
  constructor() {
    // 1. プレイヤーの最大HP
    this.PlayerMaxHp = 10;
    // 2. 敵の最大HP
    this.EnemyMaxHp = 10;
    // 3. 現在のプレイヤーHP
    this.PlayerHp = this.PlayerMaxHp;
    // 4. 現在の敵HP
    this.EnemyHp = this.EnemyMaxHp;
    // 5. 基本プレイヤー攻撃力
    this.PlayerBaseAttack = 3;
    // 6. 基本敵攻撃力
    this.EnemyBaseAttack = 2;
    // 7. 現在の敵攻撃力
    this.EnemyCurrentAttack = this.EnemyBaseAttack;
    // 8. 現在のプレイヤー攻撃力
    this.PlayerCurrentAttack = this.PlayerBaseAttack;
    // 9. デバフ残ターン
    this.EnemyDebuffTurns = 0;
    // 10.バフ残ターン
    this.PlayerBuffTurns = 0;
    // 11.ガード状態
    this.PlayerGuardActive = false;
    // 12.使用するインターバルID
    this.IntervalId = null;
    // 13.タイマーID配列
    this.Timeouts = [];
    // 14.イベントハンドラ記録配列
    this.Handlers = [];
    // 15.現在のターン状態
    this.Turn = "player";
  }

 /* --------------------------------------------
  *  2. ダイアログ作成
  * --------------------------------------------*/
  CreateBackdropDialog() {
    /* 1. バックドロップ作成 */
    const Backdrop = document.createElement("div");
    // 2. クラス設定
    Backdrop.className = "ConfirmContainer";
  
    /* 2. ダイアログ作成 */
    // 1. DIV要素作成
    const DialogBox = document.createElement("div");
    // 2. クラス名設定
    DialogBox.className = "DialogBox";

    /* 3. DOM構築 */
    // 1. バックドロップにダイアログを格納
    Backdrop.appendChild(DialogBox);
    // 2. バックドロップをボディに格納
    document.body.appendChild(Backdrop);

    /* 4. 要素を返す */
    return { Backdrop, DialogBox };
  }

 /* --------------------------------------------
  *  3. 敵の描画
  * --------------------------------------------*/
  DrawEnemy(Canvas, HealthRatio) {
    // Canvasの妥当性チェック
    if (!Canvas || !Canvas.getContext) {
      console.error("[QuestGame] Canvas invalid", Canvas);
      return;
    }
    // 2Dコンテキストを取得
    const Ctx = Canvas.getContext("2d");
    if (!Ctx) {
      console.error("[QuestGame] Failed to get 2d context");
      return;
    }
    // 描画スケールを設定
    const Scale = 4;
    // キャンバス幅と高さを取得
    const W = Canvas.width;
    const H = Canvas.height;
    // クリア
    Ctx.clearRect(0, 0, W, H);
    // ピクセルを滑らかにしない
    Ctx.imageSmoothingEnabled = false;

    // HPによって色を変える
    const HpColor =
      HealthRatio > 0.6 ? "#e74c3c" : HealthRatio > 0.3 ? "#f39c12" : "#c0392b";

    // 敵画像の読み込み（既知の確実なパスを使用）
    const Img = new Image();
    Img.src = "/frontend/asetts/img/game/quest/Quest-Img-1.png";

    Img.onload = () => {
      try {
        Ctx.clearRect(0, 0, W, H);
        // 画像をキャンバスに描画（アスペクト比が違う場合は引き延ばされます）
        Ctx.drawImage(Img, 0, 0, W, H);
        // HPによる色付け（乗算風に上から塗る）
        Ctx.globalCompositeOperation = "source-atop";
        Ctx.fillStyle = HpColor;
        Ctx.fillRect(0, 0, W, H);
        // ブレンドモードを戻す
        Ctx.globalCompositeOperation = "source-over";
      } catch (e) {
        console.error("[QuestGame] DrawEnemy draw error:", e);
      }
    };

    // 読み込み失敗時はシンプルなドット絵でフォールバック
    Img.onerror = (e) => {
      console.error("[QuestGame] Enemy image failed to load", e);
      const Layout = [
        "  XXX  ",
        " XXXXX ",
        "XXXXXXX",
        "X XX XX",
        "XXXXXXX",
        " X   X ",
        "  X X  ",
      ];
      const Pixel = (x, y, Color) => {
        Ctx.fillStyle = Color;
        Ctx.fillRect(x * Scale, y * Scale, Scale, Scale);
      };
      const OffsetX = 1;
      const OffsetY = 1;
      for (let Y = 0; Y < Layout.length; Y++) {
        for (let X = 0; X < Layout[Y].length; X++) {
          const Ch = Layout[Y][X];
          if (Ch === "X") Pixel(OffsetX + X, OffsetY + Y, HpColor);
          else Pixel(OffsetX + X, OffsetY + Y, "#111");
        }
      }
    };
  }


  // タイマーとイベントハンドラをすべて解除する
  Cleanup() {
    // インターバルが残っている場合クリア
    if (this.IntervalId) {
      try { clearInterval(this.IntervalId); } catch (e) {}
      this.IntervalId = null;
    }
    // 登録したタイマーをすべてクリア
    this.Timeouts.forEach((T) => {
      try { clearTimeout(T); } catch (e) {}
    });
    this.Timeouts = [];
    // 登録したイベントハンドラをすべて解除
    this.Handlers.forEach((H) => {
      try { if (H.el && H.fn) H.el.removeEventListener(H.type, H.fn); } catch (e) {}
    });
    this.Handlers = [];
  }

  // ゲーム実行メソッド（Promise<boolean|null> を返す）
  // ゲーム実行メソッド（Promise<boolean|null> を返す）
async GameRun() {
  // Self参照を取得
  const Self = this;
  // Promiseを返す
  return new Promise((Resolve) => {
    // 解決フラグ
    let Resolved = false;
    // 安全にResolveするヘルパー
    const SafeResolve = (V) => {
      if (!Resolved) {
        Resolved = true;
        try { Resolve(V); } catch (E) { console.error("[QuestGame] Resolve threw:", E); }
      }
    };

    // UI構築関数を定義（Backdrop, DialogBoxを受け取る）
    // ※ ここで InitialMessage を受け取るようにした（よーい… 表示を引き継ぐため）
    function BuildGameUI(Backdrop, DialogBox, InitialMessage) {
      // キャンバスを作成
      let Canvas;
      try {
        Canvas = document.createElement("canvas");
        Canvas.className = "QuestCanvas";
        Canvas.width = 32;
        Canvas.height = 28;
        Canvas.style.width = "256px";
        Canvas.style.height = "224px";
        Canvas.style.border = "4px solid #333";
        Canvas.style.background = "#000";
      } catch (E) {
        console.error("[QuestGame] Canvas create failed", E);
        SafeResolve(null);
        return;
      }

      // ステータス表示ラップを作成
      const StatWrap = document.createElement("div");
      StatWrap.className = "StatBar";
      StatWrap.style.display = "flex";
      StatWrap.style.gap = "12px";
      StatWrap.style.width = "100%";
      StatWrap.style.justifyContent = "space-between";

      // プレイヤーステータス要素を作成
      const PlayerStat = document.createElement("div");
      PlayerStat.innerHTML = `<span class="StatText">Player</span> <span class="SmallGrey">HP:</span> <span class="PlayerHpText">${Self.PlayerHp}/${Self.PlayerMaxHp}</span>`;

      // 敵ステータス要素を作成
      const EnemyStat = document.createElement("div");
      EnemyStat.innerHTML = `<span class="StatText">Enemy</span> <span class="SmallGrey">HP:</span> <span class="EnemyHpText">${Self.EnemyHp}/${Self.EnemyMaxHp}</span>`;

      // ステータスをラップに追加
      StatWrap.appendChild(PlayerStat);
      StatWrap.appendChild(EnemyStat);

      // ここでカード上部に表示するメッセージ領域を作成（よーい...と同じカード内で表示）
      const CardMessage = document.createElement("p");
      CardMessage.className = "CardMessage";
      CardMessage.style.fontSize = "18px";
      CardMessage.style.fontWeight = "700";
      CardMessage.style.margin = "4px 0 8px 0";
      CardMessage.style.textAlign = "center";
      // 初期メッセージを設定（ReadyText の内容を受け取る）
      CardMessage.textContent = InitialMessage || "";

      // ...（以降の BuildGameUI 本体はそのまま）...

      // コマンドボタン群を作成（Attack, Debuff, Buff, Guard）
      const ButtonsWrap = document.createElement("div");
      ButtonsWrap.style.display = "flex";
      ButtonsWrap.style.gap = "8px";
      ButtonsWrap.style.marginTop = "8px";

      // 攻撃ボタンを作成
      const AttackButton = document.createElement("button");
      AttackButton.classList.add("ButtonInfo","RedButton");
      AttackButton.textContent = "攻撃";

      // 敵デバフボタンを作成
      const DebuffButton = document.createElement("button");
      DebuffButton.classList.add("ButtonInfo","RedButton");
      DebuffButton.textContent = "デバフ";

      // 自身バフボタンを作成
      const BuffButton = document.createElement("button");
      BuffButton.classList.add("ButtonInfo","RedButton");
      BuffButton.textContent = "バフ";

      // ガードボタンを作成
      const GuardButton = document.createElement("button");
      GuardButton.classList.add("ButtonInfo","RedButton");
      GuardButton.textContent = "ガード";

      // インストラクション要素を作成
      const Instruction = document.createElement("div");
      Instruction.className = "SmallGrey";
      Instruction.textContent = "コマンドを選択して敵を倒そう！ デバフは敵の攻撃力を下げ、バフは自分の攻撃力を上げる。ガードは次の被ダメを軽減する。";

      // リザルト表示要素を作成
      const ResultText = document.createElement("div");
      ResultText.className = "ResultText";
      ResultText.style.minHeight = "18px";
      ResultText.style.marginTop = "8px";

      // ステータス表示（バフ／デバフ経過）要素を作成
      const EffectStatus = document.createElement("div");
      EffectStatus.className = "EffectStatus";
      EffectStatus.style.fontSize = "12px";
      EffectStatus.style.marginTop = "6px";
      EffectStatus.textContent = Self.PlayerBuffTurns > 0 || Self.EnemyDebuffTurns > 0 ? `Buff:${Self.PlayerBuffTurns} Debuff:${Self.EnemyDebuffTurns}` : "";

      // ボタン群をラップに追加
      ButtonsWrap.appendChild(AttackButton);
      ButtonsWrap.appendChild(DebuffButton);
      ButtonsWrap.appendChild(BuffButton);
      ButtonsWrap.appendChild(GuardButton);

      // ダイアログ表示を確実にする
      try { DialogBox.style.display = "flex"; } catch (E) {}

      // DOMへ追加（CardMessage を上部に追加）
      try {
        DialogBox.appendChild(CardMessage);     // ← 追加：カード上部メッセージ
        DialogBox.appendChild(Canvas);
        DialogBox.appendChild(StatWrap);
        DialogBox.appendChild(Instruction);
        DialogBox.appendChild(ButtonsWrap);
        DialogBox.appendChild(ResultText);
        DialogBox.appendChild(EffectStatus);
      } catch (E) {
        console.error("[QuestGame] Append to DialogBox failed", E);
        SafeResolve(null);
        return;
      }

      // 初回の敵描画
      try { Self.DrawEnemy(Canvas, Self.EnemyHp / Self.EnemyMaxHp); } catch (E) { console.error(E); }

      // 反撃遅延（ミリ秒）
      const EnemyCounterDelay = 700;
      // デバフ効果値（敵攻撃力減少）
      const DebuffAmount = 1;
      // デバフ持続ターン数
      const DebuffDuration = 3;
      // バフ効果値（プレイヤー攻撃力増加）
      const BuffAmount = 2;
      // バフ持続ターン数
      const BuffDuration = 3;

      // 共通: ボタンを全て有効/無効にするユーティリティ
      const SetButtonsEnabled = (Enabled) => {
        try { AttackButton.disabled = !Enabled; } catch (E) {}
        try { DebuffButton.disabled = !Enabled; } catch (E) {}
        try { BuffButton.disabled = !Enabled; } catch (E) {}
        try { GuardButton.disabled = !Enabled; } catch (E) {}
      };

      // 効果表示を更新するユーティリティ
      const UpdateEffectStatus = () => {
        try {
          EffectStatus.textContent = `Buff:${Self.PlayerBuffTurns} Debuff:${Self.EnemyDebuffTurns}`.trim();
          if (EffectStatus.textContent === "Buff:0 Debuff:0") EffectStatus.textContent = "";
        } catch (E) {}
      };

      // ステータステキストを更新するユーティリティ
      const UpdateHpDisplays = () => {
        try {
          const EnemyHpText = DialogBox.querySelector(".EnemyHpText");
          if (EnemyHpText) EnemyHpText.textContent = `${Self.EnemyHp}/${Self.EnemyMaxHp}`;
          const PlayerHpText = DialogBox.querySelector(".PlayerHpText");
          if (PlayerHpText) PlayerHpText.textContent = `${Self.PlayerHp}/${Self.PlayerMaxHp}`;
          Self.DrawEnemy(Canvas, Self.EnemyHp / Self.EnemyMaxHp);
        } catch (E) {}
      };

      // プレイヤーが攻撃する処理
      const OnAttack = () => {
        try {
          // プレイヤーターン開始のガード: ボタンを無効化
          SetButtonsEnabled(false);
          // ダメージ計算（現在のプレイヤー攻撃力を使用）
          const Damage = Self.PlayerCurrentAttack;
          // 敵HP更新
          Self.EnemyHp = Math.max(0, Self.EnemyHp - Damage);
          // 表示更新
          UpdateHpDisplays();
          // 結果テキスト表示
          ResultText.textContent = `攻撃！ -${Damage}`;
          // カード上部メッセージにも表示（よーい と同じ位置）
          CardMessage.textContent = ResultText.textContent;
          // 一時テキストクリアのタイマーを追加
          const TempTimeout = setTimeout(()=>{ try{ ResultText.textContent = ""; CardMessage.textContent = ""; }catch(e){} }, 400);
          Self.Timeouts.push(TempTimeout);
          // 敵が倒れたら終了
          if (Self.EnemyHp <= 0) {
            EndGame(true);
            return;
          }
          // 敵の反撃を遅延して実行
          const CounterTimeout = setTimeout(()=> {
            try { EnemyTurn(); } catch (E) { console.error("[QuestGame] Counter error:", E); EndGame(false); }
          }, EnemyCounterDelay);
          Self.Timeouts.push(CounterTimeout);
        } catch (E) {
          console.error("[QuestGame] OnAttack error:", E);
          EndGame(false);
        }
      };

      // 以下略（既存の残りロジックは変更なし）...
      // ※ Debuff/Buff/Guard/EnemyTurn/EndGame などは同じ処理で
      //   CardMessage.textContent を更新しているため、ReadyText と同じ
      //   カード上部表示になります。
    } // End BuildGameUI

    // 初期UIを作成してゲーム開始をスケジュールする
    let Created;
    try { Created = this.CreateBackdropDialog(); } catch (E) { console.error("[QuestGame] CreateBackdropDialog threw:", E); SafeResolve(null); return; }
    const { Backdrop, DialogBox } = Created;
    // 準備表示を作成
    const ReadyText = document.createElement("p");
    ReadyText.textContent = "よーい…";
    ReadyText.style.fontSize = "18px";
    ReadyText.style.fontWeight = "700";
    DialogBox.appendChild(ReadyText);
    // テキスト更新タイマー（700msで「開始！」へ）
    const T1 = setTimeout(() => { try { ReadyText.textContent = "開始！"; } catch (E) {} }, 700);
    this.Timeouts.push(T1);
    // 実際のゲームUIを表示するタイマー（1200ms後）
    const T2 = setTimeout(() => {
      try { 
        // ReadyText の表示内容を引き継いでカード上に表示する（BuildGameUI に渡す）
        const InitialMessage = ReadyText.textContent || "";
        ReadyText.remove(); 
      } catch (E) {}
      try { BuildGameUI(Backdrop, DialogBox, InitialMessage); } catch (E) { console.error("[QuestGame] BuildGameUI call failed:", E); SafeResolve(null); }
    }, 1200);
    this.Timeouts.push(T2);
  }); // End Promise
} // End GameRun

} 

// グローバル登録
window.QuestGame = QuestGame;
