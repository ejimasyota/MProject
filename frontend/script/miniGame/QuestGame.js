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
    this.PlayerBaseAttack = 2;
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
    /* 1. CANVASの存在チェック */
    if (!Canvas || !Canvas.getContext) {
      // 1. デバッグログ出力
      console.error("Canvas取得失敗");
      // 2. 処理終了
      return;
    }
    
    /* 2. コンテキスト取得処理 */
    // 1. コンテキストを取得
    const ConText = Canvas.getContext("2d");

    /* 3. コンテキスト存在チェック */
    if (!ConText) {
      // 1. デバッグログ出力
      console.error("コンテキスト取得失敗");
      // 2. 処理終了
      return;
    }

    /* 4. キャンバスサイズ設定 */
    // 1. キャンバス幅
    const Width = Canvas.width;
    // 2. キャンバス高さ
    const Height = Canvas.height;
    // 3. キャンバスクリア
    ConText.clearRect(0, 0, Width, Height);
    // 4. ピクセルを滑らかにしない
    ConText.imageSmoothingEnabled = true;

    /* 5. HPによる背景の変更処理 */
    const HpColor =
      HealthRatio > 0.6 ? "#e74c3c" : HealthRatio > 0.3 ? "#f39c12" : "#c0392b";

    /* 6. HEXからRGBAへの変換処理 */
    const HexToRgba = (HEX, ALPHA) => {
      /* 定義 */
      // 1. 変換されたHEXを保持する
      let NormalizedHex  = (HEX || "").replace("#", "");

      /* 変換処理 */
      if (NormalizedHex.length === 3) {
        NormalizedHex = NormalizedHex.split("").map((Color) => Color + Color).join("");
      }

      /* 色の設定処理 */
      // 1. 赤色を設定
      const Red = parseInt(NormalizedHex.slice(0, 2), 16) || 0;
      // 2. 緑色を設定
      const Green = parseInt(NormalizedHex.slice(2, 4), 16) || 0;
      // 3. 青色を設定
      const Blue = parseInt(NormalizedHex.slice(4, 6), 16) || 0;

      /* 戻り値の設定 */
      return `rgba(${Red}, ${Green}, ${Blue}, ${ALPHA})`;
    };

    /* 6. オーバーレイの設定 */
    const OverlayColor = HexToRgba(HpColor, 0.5);

    /* 7. 敵画像の読み込み */
    // 1. IMGインスタンスを生成
    const Img = new Image();
    // 2. パスのソース設定
    Img.src = "/frontend/asetts/img/game/quest/Quest-Img-1.png";

    /* 8. 敵画像の読み込み */
    Img.onload = () => {
      try {
        // 1. コンテキストをクリア
        ConText.clearRect(0, 0, Width, Height);
        // 2. 画像をキャンバスに描画
        ConText.drawImage(Img, 0, 0, Width, Height);
        // 3. HPによる色付け
        ConText.globalCompositeOperation = "source-atop";
        // 4. オーバーレイ設定
        ConText.fillStyle = OverlayColor;
        // 5. キャンバスサイズ設定
        ConText.fillRect(0, 0, Width, Height);
        // 6. ブレンドモードを戻す
        ConText.globalCompositeOperation = "source-over";
      } catch (e) {
        console.error("クエスト - 敵画像の読込失敗 : ", e);
      }
    };

    /* 9. 敵画像の読み込み失敗時 */
    Img.onerror = (e) => {
      console.error("クエスト - 敵画像の読込失敗 : ", e);
    };
  }

 /* --------------------------------------------
  *  4. タイマーとイベントハンドラの解除
  * --------------------------------------------*/
  Cleanup() {
    /* 1. インターバルが残っている場合クリア */
    if (this.IntervalId) {
      // 1. インターバルをクリア
      try { clearInterval(this.IntervalId); } catch (e) {}
      // 2. インターバルIDを初期化
      this.IntervalId = null;
    }

    /* 2. 登録したタイマーをすべてクリア */
    // 1. タイマーをクリア
    this.Timeouts.forEach((T) => {
      try { clearTimeout(T); } catch (e) {}
    });
    // 2. タイマー配列をクリア
    this.Timeouts = [];
    
    /* 3. 登録したイベントハンドラをすべて解除 */
    // 1. イベントハンドラを解除
    this.Handlers.forEach((Handler) => {
      try { if (Handler.el && Handler.fn) Handler.el.removeEventListener(Handler.type, Handler.fn); } catch (e) {}
    });
    // 2. イベントハンドラ配列をクリア
    this.Handlers = [];
  }

 /* --------------------------------------------
  *  5. ゲーム実行
  * --------------------------------------------*/
  async GameRun() {
    /* 1. 事前定義 */
    // 1. 元のthisの値を保持
    const Self = this;
  
    return new Promise((Resolve) => {
      /* 2. Promiseのエラーハンドリング */
      /* 定義 */
      // 1. Promise解決フラグ
      let Resolved = false;
      
      /* 安全にResolveを返す処理 */
      const SafeResolve = (Value) => {
        /* Resolveに失敗した場合 */
        if (!Resolved) {
          // 1. 解決FLGをTRUEに設定
          Resolved = true;
          // 2. Promiseを解決
          try { Resolve(Value); } catch (error) { console.error("クエスト - Promise解決失敗", error); }
        }
      };

      /* 3. UI構築 */
      function BuildGameUI(Backdrop, DialogBox) {
        /* ----- ★ キャンバス作成 ★ ----- */
        /* 定義 */
        // 1. キャンバスを保持する
        let Canvas;

        /* キャンバスの作成処理 */
        try {
          // 1. CANVASを作成
          Canvas = document.createElement("canvas");
          // 2. クラスを設定
          Canvas.className = "QuestCanvas";
          // 3. キャンバスの幅を設定
          Canvas.width = 32;
          // 4. キャンバスの高さを設定
          Canvas.height = 28;
        } catch (error) {
          /* 例外処理 */
          // 1. デバッグログ
          console.error("クエスト - キャンバス作成失敗", error);
          // 2. Promiseをnullで解決
          SafeResolve(null);
          // 3. 処理終了
          return;
        }

        /* ----- ★ プレイヤーステータスラッパー作成 ★ ----- */
        /* ステータス表示ラップを作成 */
        // 1. DIV要素作成
        const StatWrapeer = document.createElement("div");
        // 2. クラス設定
        StatWrapeer.className = "StatBar"; 

        /* ----- ★ プレイヤーステータス作成 ★ ----- */
        // 1. DIV要素作成
        const PlayerStatus = document.createElement("div");
        // 2. クラス設定
        PlayerStatus.classList.add("StatusBox");

        /* ----- ★ プレイヤー名作成 ★ ----- */
        // 1. SPAN要素作成
        const PlayerName = document.createElement("span");
        // 2. クラス設定
        PlayerName.classList.add("StatText");
        // 3. ラベル設定
        PlayerName.textContent = `${sessionStorage.getItem("PlayerName")}`;

        /* ----- ★ プレイヤーラベル作成 ★ ----- */
        // 1. SPAN要素作成
        const PlayerLabel = document.createElement("span");
        // 2. クラス設定
        PlayerLabel.classList.add("SmallGrey");
        // 3. ラベル設定
        PlayerLabel.textContent = " HP: ";

        /* ----- ★ プレイヤーHP作成 ★ ----- */
        // 1. SPAN要素作成
        const PlayerHp = document.createElement("span");
        // 2. クラス設定
        PlayerHp.classList.add("PlayerHpText");
        // 3. ラベル設定
        PlayerHp.textContent = `${Self.PlayerHp} / ${Self.PlayerMaxHp}`;

        /* ----- ★ プレイヤーHPバー作成 ★ ----- */
        // 1. DIV要素作成
        const PlayerHpBar = document.createElement("div");
        // 2. クラス設定
        PlayerHpBar.classList.add("HpBar");

        /* ----- ★ プレイヤーHPバーの残量作成 ★ ----- */
        // 1. DIV要素作成
        const PlayerHpFill = document.createElement("div");
        // 2. クラス設定
        PlayerHpFill.classList.add("HpFill");
        
        /* ----- ★ プレイヤーHPバーの残量幅設定 ★ ----- */
        // 1. 残量取得
        const PlayerPercent = Math.max(0, Math.min(100, Math.round(Self.PlayerHp / Self.PlayerMaxHp * 100)));
        // 2. 幅を設定
        PlayerHpFill.style.width = PlayerPercent + "%";

        /* ----- ★ プレイヤーステータスのDOM組み立て ★ ----- */
        // 1. HPバー内部の塗り潰し要素をバー本体へ格納
        PlayerHpBar.appendChild(PlayerHpFill);
        // 2. 名前ラベルをステータス行へ格納
        PlayerStatus.appendChild(PlayerName);
        // 3. HPのラベルをステータス行へ格納
        PlayerStatus.appendChild(PlayerLabel);
        // 4．HPの数値表示をステータス行へ格納
        PlayerStatus.appendChild(PlayerHp);
        // 5. HPバーをステータス行へ格納
        PlayerStatus.appendChild(PlayerHpBar);

        /* ----- ★ 敵ステータス作成 ★ ----- */
        // 1. DIV要素作成
        const EnemyStatus = document.createElement("div");
        // 2. クラス設定
        EnemyStatus.classList.add("StatusBox");

        /* ----- ★ 敵名作成 ★ ----- */
        // 1. SPAN要素作成
        const EnemyName = document.createElement("span");
        // 2. クラス設定
        EnemyName.classList.add("StatText");
        // 3. ラベル設定
        EnemyName.textContent = "敵";

        /* ----- ★ 敵ラベル作成 ★ ----- */
        // 1. SPAN要素作成
        const EnemyLabel = document.createElement("span");
        // 2. クラス設定
        EnemyLabel.classList.add("SmallGrey");
        // 3. ラベル設定
        EnemyLabel.textContent = " HP: ";

        /* ----- ★ 敵HP作成 ★ ----- */
        // 1. SPAN要素作成
        const EnemyHp = document.createElement("span");
        // 2. クラス設定
        EnemyHp.classList.add("EnemyHpText");
        // 3. ラベル設定
        EnemyHp.textContent = `${Self.EnemyHp} / ${Self.EnemyMaxHp}`;

        /* ----- ★ 敵HPバー作成 ★ ----- */
        // 1. DIV要素作成
        const EnemyHpBar = document.createElement("div");
        // 2. ラベル設定
        EnemyHpBar.classList.add("HpBar");

        /* ----- ★ 敵HPバーの残量作成 ★ ----- */
        // 1. DIV要素作成
        const EnemyHpFill = document.createElement("div");
        // 2. クラス設定
        EnemyHpFill.classList.add("HpFill");

        /* ----- ★ 敵HPバーの残量幅設定 ★ ----- */
        // 1. 残量取得
        const EnemyPercent = Math.max(0, Math.min(100, Math.round(Self.EnemyHp / Self.EnemyMaxHp * 100)));
        // 2. 幅取得
        EnemyHpFill.style.width = EnemyPercent + "%";

        /* ----- ★ 敵ステータスのDOM組み立て ★ ----- */
        // 1. HPバー内部の塗り潰し要素をバー本体へ格納
        EnemyHpBar.appendChild(EnemyHpFill);
        // 2. 敵の名前ラベルをステータス行へ格納
        EnemyStatus.appendChild(EnemyName);
        // 3. HPラベルをステータス行へ格納
        EnemyStatus.appendChild(EnemyLabel);
        // 4. HPの数値表示をステータス行へ格納
        EnemyStatus.appendChild(EnemyHp);
        // 5. HPバーをステータス行へ格納
        EnemyStatus.appendChild(EnemyHpBar);

        /* ----- ★ 各ステータスのDOM組み立て ★ ----- */
        // 1. ステータスラッパーにプレイヤーステータスを格納
        StatWrapeer.appendChild(PlayerStatus);
        // 2. ステータスラッパーに敵ステータスを格納
        StatWrapeer.appendChild(EnemyStatus);


        /* ----- ★ コマンドボタンラッパーを作成 ★ ----- */
        // 1. DIV要素作成
        const ButtonsWrapeer = document.createElement("div");
        // 2. 横並びに設定
        ButtonsWrapeer.style.display = "flex";
        // 3. 要素間隔設定
        ButtonsWrapeer.style.gap = "8px";
        // 4. マージン設定
        ButtonsWrapeer.style.marginTop = "8px";

        /* ----- ★ 攻撃ボタンを作成 ★ ----- */
        // 1. ボタン要素を作成
        const AttackButton = document.createElement("button");
        // 2. クラスを設定
        AttackButton.classList.add("ButtonInfo", "RedButton");
        // 3. ラベルを設定
        AttackButton.textContent = "攻撃";

        /* ----- ★ 敵デバフボタンを作成 ★ ----- */
        // 1. ボタン要素を作成
        const DebuffButton = document.createElement("button");
        // 2. クラスを設定
        DebuffButton.classList.add("ButtonInfo", "RedButton");
        // 3. ラベルを設定
        DebuffButton.textContent = "デバフ";

        /* ----- ★ 自身バフボタンを作成 ★ ----- */
        // 1. ボタン要素を作成
        const BuffButton = document.createElement("button");
        // 2. クラスを設定
        BuffButton.classList.add("ButtonInfo", "RedButton");
        // 3. ラベルを設定
        BuffButton.textContent = "バフ";

        /* ----- ★ ガードボタンを作成 ★ ----- */
        // 1. ボタン要素を作成
        const GuardButton = document.createElement("button");
        // 2. クラスを設定
        GuardButton.classList.add("ButtonInfo", "RedButton");
        // 3. ラベルを設定
        GuardButton.textContent = "ガード";

        /* ----- ★ 説明欄を作成 ★ ----- */
        // 1. DIV要素作成
        const Instruction = document.createElement("div");
        // 2. クラスを設定
        Instruction.className = "SmallGrey";
        // 3. ラベルを設定
        Instruction.textContent = "敵を倒せ！";

        // リザルト表示要素を作成
        const ResultText = document.createElement("div");
        ResultText.className = "ResultText";
        ResultText.style.minHeight = "18px";
        ResultText.style.marginTop = "8px";

        /* ----- ★ DOM組み立て ★ ----- */
        // 1. 攻撃ボタンをボタンラッパーに格納
        ButtonsWrapeer.appendChild(AttackButton);
        // 2. デバフボタンをボタンラッパーに格納
        ButtonsWrapeer.appendChild(DebuffButton);
        // 3. バフボタンをボタンラッパーに格納
        ButtonsWrapeer.appendChild(BuffButton);
        // 4. ガードボタンをボタンラッパーに格納
        ButtonsWrapeer.appendChild(GuardButton);

        // ダイアログ表示を確実にする
        try { DialogBox.style.display = "flex"; } catch (E) {}

        // DOMへ追加
        try {
          DialogBox.appendChild(Canvas);
          DialogBox.appendChild(StatWrapeer);
          DialogBox.appendChild(Instruction);
          DialogBox.appendChild(ButtonsWrapeer);
          DialogBox.appendChild(ResultText);
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
            // テキスト要素
            const EnemyHpText = DialogBox.querySelector(".EnemyHpText");
            const PlayerHpText = DialogBox.querySelector(".PlayerHpText");

            // 対応するHPバーの .HpFill 要素を StatusBox を辿って探す（安全に）
            const enemyHpFill = EnemyHpText?.closest(".StatusBox")?.querySelector(".HpFill");
            const playerHpFill = PlayerHpText?.closest(".StatusBox")?.querySelector(".HpFill");

            // HPバーの外枠（aria属性を更新するため）
            const enemyHpBar = EnemyHpText?.closest(".StatusBox")?.querySelector(".HpBar");
            const playerHpBar = PlayerHpText?.closest(".StatusBox")?.querySelector(".HpBar");

            // 安全な数値（最大値が0なら1にしてゼロ除算を避ける）
            const eMax = (typeof Self.EnemyMaxHp === "number" && Self.EnemyMaxHp > 0) ? Self.EnemyMaxHp : 1;
            const pMax = (typeof Self.PlayerMaxHp === "number" && Self.PlayerMaxHp > 0) ? Self.PlayerMaxHp : 1;

            // クリップして整数化（手順を明確にするため桁ごとに計算）
            const eCurr = Math.max(0, Math.min(Self.EnemyHp || 0, eMax));
            const pCurr = Math.max(0, Math.min(Self.PlayerHp || 0, pMax));

            const ePercent = Math.round((eCurr / eMax) * 100);
            const pPercent = Math.round((pCurr / pMax) * 100);

            // テキスト更新
            if (EnemyHpText) {
              EnemyHpText.textContent = `${eCurr}/${eMax}`;
              EnemyHpText.setAttribute("data-current", String(eCurr));
              EnemyHpText.setAttribute("data-max", String(eMax));
            }
            if (PlayerHpText) {
              PlayerHpText.textContent = `${pCurr}/${pMax}`;
              PlayerHpText.setAttribute("data-current", String(pCurr));
              PlayerHpText.setAttribute("data-max", String(pMax));
            }

            // aria とバー幅更新（あれば）
            if (enemyHpBar) {
              enemyHpBar.setAttribute("role", "progressbar");
              enemyHpBar.setAttribute("aria-valuemin", "0");
              enemyHpBar.setAttribute("aria-valuemax", String(eMax));
              enemyHpBar.setAttribute("aria-valuenow", String(eCurr));
            }
            if (playerHpBar) {
              playerHpBar.setAttribute("role", "progressbar");
              playerHpBar.setAttribute("aria-valuemin", "0");
              playerHpBar.setAttribute("aria-valuemax", String(pMax));
              playerHpBar.setAttribute("aria-valuenow", String(pCurr));
            }

            if (enemyHpFill) {
              enemyHpFill.style.width = `${Math.max(0, Math.min(100, ePercent))}%`;
              // 色をHP%で変える（任意）
              if (ePercent <= 25) enemyHpFill.style.background = "linear-gradient(90deg, #ff6b6b, #ff3b3b)"; // 赤
              else if (ePercent <= 60) enemyHpFill.style.background = "linear-gradient(90deg, #ffd76b, #ffb84b)"; // 黄
              else enemyHpFill.style.background = "linear-gradient(90deg, #6bd26b, #2da22d)"; // 緑
            }

            if (playerHpFill) {
              playerHpFill.style.width = `${Math.max(0, Math.min(100, pPercent))}%`;
              if (pPercent <= 25) playerHpFill.style.background = "linear-gradient(90deg, #ff6b6b, #ff3b3b)";
              else if (pPercent <= 60) playerHpFill.style.background = "linear-gradient(90deg, #ffd76b, #ffb84b)";
              else playerHpFill.style.background = "linear-gradient(90deg, #6bd26b, #2da22d)";
            }

            // 描画更新（もし DrawEnemy が HP% を受け取るなら安全に渡す）
            if (typeof Self.DrawEnemy === "function") {
              const safeRatio = eMax === 0 ? 0 : (eCurr / eMax);
              Self.DrawEnemy(Canvas, safeRatio);
            }

          } catch (E) {
            // エラーは無言で握りつぶすよりログに出すほうがデバッグしやすい
            console.error("UpdateHpDisplays error:", E);
          }
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
            ResultText.textContent = `攻撃 敵恵島に${Damage}ダメージ`;
            // 一時テキストクリアのタイマーを追加
            const TempTimeout = setTimeout(()=>{ try{ ResultText.textContent = ""; }catch(e){} }, 400);
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

        // 敵へデバフをかける処理
        const OnDebuff = () => {
          try {
            // ボタンを無効化してターンを消費
            SetButtonsEnabled(false);
            // デバフ効果は再付与で持続ターンを上書きする
            Self.EnemyDebuffTurns = DebuffDuration;
            // 敵の現在攻撃力を計算（最低1になるようにする）
            Self.EnemyCurrentAttack = Math.max(1, Self.EnemyBaseAttack - DebuffAmount);
            // 表示更新
            UpdateEffectStatus();
            ResultText.textContent = `敵恵島の攻撃力を-${DebuffAmount}（${DebuffDuration}ターン）`;
            const TempTimeout = setTimeout(()=>{ try{ ResultText.textContent = ""; }catch(e){} }, 600);
            Self.Timeouts.push(TempTimeout);
            // 敵の反撃タイマーをセット
            const CounterTimeout = setTimeout(()=> {
              try { EnemyTurn(); } catch (E) { console.error("[QuestGame] Debuff Counter error:", E); EndGame(false); }
            }, EnemyCounterDelay);
            Self.Timeouts.push(CounterTimeout);
          } catch (E) {
            console.error("[QuestGame] OnDebuff error:", E);
            EndGame(false);
          }
        };

        // 自身にバフをかける処理
        const OnBuff = () => {
          try {
            // ボタンを無効化してターンを消費
            SetButtonsEnabled(false);
            // バフ効果は再付与で持続ターンを上書きする
            Self.PlayerBuffTurns = BuffDuration;
            // 現在攻撃力を反映
            Self.PlayerCurrentAttack = Self.PlayerBaseAttack + BuffAmount;
            // 表示更新
            UpdateEffectStatus();
            ResultText.textContent = `攻撃力が+${BuffAmount}（${BuffDuration}ターン）`;
            const TempTimeout = setTimeout(()=>{ try{ ResultText.textContent = ""; }catch(e){} }, 600);
            Self.Timeouts.push(TempTimeout);
            // 敵の反撃タイマーをセット
            const CounterTimeout = setTimeout(()=> {
              try { EnemyTurn(); } catch (E) { console.error("[QuestGame] Buff Counter error:", E); EndGame(false); }
            }, EnemyCounterDelay);
            Self.Timeouts.push(CounterTimeout);
          } catch (E) {
            console.error("[QuestGame] OnBuff error:", E);
            EndGame(false);
          }
        };

        // ガードを行う処理（次の被ダメを軽減）
        const OnGuard = () => {
          try {
            // ボタンを無効化してターンを消費
            SetButtonsEnabled(false);
            // ガードを有効化（次の被ダメを軽減する）
            Self.PlayerGuardActive = true;
            // 表示更新
            ResultText.textContent = "ガードをした。被ダメージ軽減";
            const TempTimeout = setTimeout(()=>{ try{ ResultText.textContent = ""; }catch(e){} }, 600);
            Self.Timeouts.push(TempTimeout);
            // 敵の反撃タイマーをセット
            const CounterTimeout = setTimeout(()=> {
              try { EnemyTurn(); } catch (E) { console.error("[QuestGame] Guard Counter error:", E); EndGame(false); }
            }, EnemyCounterDelay);
            Self.Timeouts.push(CounterTimeout);
          } catch (E) {
            console.error("[QuestGame] OnGuard error:", E);
            EndGame(false);
          }
        };

        // ボタンにイベントを登録しハンドラ記録へ追加
        AttackButton.addEventListener("click", OnAttack);
        Self.Handlers.push({ el: AttackButton, type: "click", fn: OnAttack });
        DebuffButton.addEventListener("click", OnDebuff);
        Self.Handlers.push({ el: DebuffButton, type: "click", fn: OnDebuff });
        BuffButton.addEventListener("click", OnBuff);
        Self.Handlers.push({ el: BuffButton, type: "click", fn: OnBuff });
        GuardButton.addEventListener("click", OnGuard);
        Self.Handlers.push({ el: GuardButton, type: "click", fn: OnGuard });

        // 敵ターン: 敵が反撃する処理
        function EnemyTurn() {
          try {
            // 敵が生存している場合のみ反撃
            if (Self.EnemyHp > 0) {
              // 敵の攻撃力を取得（現在の攻撃力）
              const EnemyAtk = Self.EnemyCurrentAttack;
              // ダメージ計算（ガードが有効なら半減、切捨て）
              let DamageTaken = EnemyAtk;
              if (Self.PlayerGuardActive) {
                DamageTaken = Math.floor(DamageTaken / 2);
                Self.PlayerGuardActive = false;
              }
              // プレイヤーHP更新
              Self.PlayerHp = Math.max(0, Self.PlayerHp - DamageTaken);
              // プレイヤーHP表示を更新
              UpdateHpDisplays();
              // 被弾テキストを表示
              ResultText.textContent = `みぞおちを殴られた。 -${DamageTaken}ダメージを受けた`;
              const TempTimeout2 = setTimeout(()=>{ try{ ResultText.textContent = ""; }catch(e){} }, 400);
              Self.Timeouts.push(TempTimeout2);
              // プレイヤーが倒れたら終了
              if (Self.PlayerHp <= 0) {
                EndGame(false);
                return;
              }
            }
            // ターン経過: バフ／デバフのターンを減らす
            try {
              if (Self.PlayerBuffTurns > 0) {
                Self.PlayerBuffTurns = Math.max(0, Self.PlayerBuffTurns - 1);
                if (Self.PlayerBuffTurns === 0) {
                  Self.PlayerCurrentAttack = Self.PlayerBaseAttack;
                }
              }
              if (Self.EnemyDebuffTurns > 0) {
                Self.EnemyDebuffTurns = Math.max(0, Self.EnemyDebuffTurns - 1);
                if (Self.EnemyDebuffTurns === 0) {
                  Self.EnemyCurrentAttack = Self.EnemyBaseAttack;
                }
              }
            } catch (E) { console.error("[QuestGame] Turn decrement error:", E); }
            // エフェクト表示更新
            UpdateEffectStatus();
            // プレイヤーが生存していれば次のプレイヤーターンへ（ボタン再有効化）
            try { SetButtonsEnabled(true); } catch (E) {}
          } catch (E) {
            console.error("[QuestGame] EnemyTurn error:", E);
            EndGame(false);
          }
        }

        // ゲーム終了処理（勝敗フラグを受け取る）
        function EndGame(WinFlag) {
          try {
            // タイマーやハンドラをすべて解除
            Self.Cleanup();

            // ゲーム用のバックドロップを確実に削除（もし残っていれば）
            try { if (Backdrop && Backdrop.parentNode) Backdrop.parentNode.removeChild(Backdrop); } catch (E) {}
            // SelectBackdrop が残っている可能性があるので先に削除を試みる
            try { if (typeof SelectBackdrop !== "undefined" && SelectBackdrop && SelectBackdrop.parentNode) SelectBackdrop.parentNode.removeChild(SelectBackdrop); } catch (E) {}
            // 同様に選択ダイアログ変数があれば削除
            try { if (typeof SelectDialog !== "undefined" && SelectDialog && SelectDialog.parentNode) SelectDialog.parentNode.removeChild(SelectDialog); } catch (E) {}

            // 結果表示用のバックドロップとダイアログを作成
            const { Backdrop: ResultBackdrop, DialogBox: ResultCard } = Self.CreateBackdropDialog();

            // 結果メッセージ要素を作成
            const Message = document.createElement("p");
            Message.className = "ResultText";
            Message.textContent = WinFlag ? "勝ちました" : "負けました";
            Message.style.fontWeight = "700";
            ResultCard.appendChild(Message);

            // 詳細メッセージ要素を作成
            const Detail = document.createElement("div");
            Detail.className = "SmallGrey";
            Detail.textContent = WinFlag ? "めでたい" : "雑魚";
            ResultCard.appendChild(Detail);

            // 閉じるボタンを作成
            const CloseBtn = document.createElement("button");
            CloseBtn.textContent = "閉じる";
            CloseBtn.classList.add("ButtonInfo","PinkButton");
            CloseBtn.style.marginTop = "12px";
            CloseBtn.style.cursor = "pointer";

            // 共通：指定要素を安全に削除するユーティリティ（無名）
            const safeRemove = (el) => {
              try { if (el && el.parentNode) el.parentNode.removeChild(el); } catch (E) {}
            };

            // 明確に ConfirmContainer / SelectBackdrop を探して削除するユーティリティ
            const removeConfirmAndSelect = () => {
              try {
                // 1) 変数として存在するケース（スコープ内／外で定義されている可能性）
                try { if (typeof ConfirmContainer !== "undefined" && ConfirmContainer) safeRemove(ConfirmContainer); } catch (E) {}
                try { if (typeof SelectBackdrop !== "undefined" && SelectBackdrop) safeRemove(SelectBackdrop); } catch (E) {}
                try { if (typeof SelectDialog !== "undefined" && SelectDialog) safeRemove(SelectDialog); } catch (E) {}

                // 2) ConfirmContainer をクラス名・ID・data 属性で検索（優先順）
                const byConfirmClass = document.querySelector(".ConfirmContainer");
                if (byConfirmClass) { safeRemove(byConfirmClass); /* continue to also try select */ }

                const byConfirmId = document.getElementById("ConfirmContainer");
                if (byConfirmId) { safeRemove(byConfirmId); }

                const byConfirmData = document.querySelector("[data-confirm='true']");
                if (byConfirmData) { safeRemove(byConfirmData); }

                // 3) SelectBackdrop をクラス名・ID・data 属性で検索（優先順）
                const bySelectClass = document.querySelector(".SelectBackdrop");
                if (bySelectClass) { safeRemove(bySelectClass); }

                const bySelectId = document.getElementById("SelectBackdrop");
                if (bySelectId) { safeRemove(bySelectId); }

                const bySelectData = document.querySelector("[data-select='true']");
                if (bySelectData) { safeRemove(bySelectData); }

                // 4) 最後の手段で既知のミニゲーム変数名を試す（副次的）
                try { if (typeof MiniBackdrop !== "undefined" && MiniBackdrop) safeRemove(MiniBackdrop); } catch (E) {}
                try { if (typeof MiniDialog !== "undefined" && MiniDialog) safeRemove(MiniDialog); } catch (E) {}

                return true;
              } catch (E) {
                console.error("[QuestGame] removeConfirmAndSelect error:", E);
                return false;
              }
            };

            // 閉じる時の処理: 結果ダイアログ削除＋Confirm/Select削除＋Promise解決
            const OnClose = () => {
              try {
                // 結果ダイアログ本体を削除
                safeRemove(ResultBackdrop);

                // 明示的に ConfirmContainer と SelectBackdrop を削除（最優先）
                removeConfirmAndSelect();

                // 互換性のため、DialogBox 変数が残っていれば削除（ただし無差別に全 Dialog を消さない）
                try { if (typeof DialogBox !== "undefined" && DialogBox) safeRemove(DialogBox); } catch (E) {}

              } catch (E) {
                console.error("[QuestGame] EndGame OnClose cleanup error:", E);
              } finally {
                // 最後に Promise 相当の処理を解決（WinFlag が true のとき勝ち）
                try { SafeResolve(WinFlag === true); } catch (E) {}
              }
            };

            // 閉じるボタンにイベントを登録しハンドラ記録へ追加
            CloseBtn.addEventListener("click", OnClose);
            Self.Handlers.push({ el: CloseBtn, type: "click", fn: OnClose });
            ResultCard.appendChild(CloseBtn);

            // 自動で閉じるフォールバックタイマー（8秒） — 自動で閉じたときも同様の掃除を行う
            const AutoClose = setTimeout(() => {
              try {
                OnClose();
              } catch (E) {
                try { safeRemove(ResultBackdrop); } catch (E) {}
                try { SafeResolve(WinFlag === true); } catch (E) {}
              }
            }, 8000);
            Self.Timeouts.push(AutoClose);

          } catch (E) {
            console.error("[QuestGame] EndGame error:", E);
            SafeResolve(null);
          }
        }


        }
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
        try { ReadyText.remove(); } catch (E) {}
        try { BuildGameUI(Backdrop, DialogBox); } catch (E) { console.error("[QuestGame] BuildGameUI call failed:", E); SafeResolve(null); }
      }, 1200);
      this.Timeouts.push(T2);
    });
  } 
} 

// グローバル登録
window.QuestGame = QuestGame;
