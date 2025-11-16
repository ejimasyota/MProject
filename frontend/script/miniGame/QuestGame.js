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
      function BuildGameUI(Backdrop, DialogBox) {
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

        // DOMへ追加
        try {
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
            ResultText.textContent = `敵の攻撃力を-${DebuffAmount}（${DebuffDuration}ターン）`;
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
            ResultText.textContent = "ガード！ 次の被ダメ軽減";
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
              ResultText.textContent = `被弾 -${DamageTaken}`;
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
            // ゲーム用のバックドロップを確実に削除
            try { if (Backdrop && Backdrop.parentNode) Backdrop.parentNode.removeChild(Backdrop); } catch (E) {}
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
            Detail.textContent = WinFlag ? "おめでとう！" : "また挑戦しよう...";
            ResultCard.appendChild(Detail);
            // 閉じるボタンを作成
            const CloseBtn = document.createElement("button");
            CloseBtn.textContent = "閉じる";
            CloseBtn.className = "ButtonInfo";
            CloseBtn.style.marginTop = "12px";
            CloseBtn.style.cursor = "pointer";
            // 閉じる時の処理: バックドロップ削除とPromise解決
            const OnClose = () => {
              try { if (ResultBackdrop && ResultBackdrop.parentNode) ResultBackdrop.parentNode.removeChild(ResultBackdrop); } catch (E) {}
              SafeResolve(WinFlag === true);
            };
            // 閉じるボタンにイベントを登録しハンドラ記録へ追加
            CloseBtn.addEventListener("click", OnClose);
            Self.Handlers.push({ el: CloseBtn, type: "click", fn: OnClose });
            ResultCard.appendChild(CloseBtn);
            // 自動で閉じるフォールバックタイマー（8秒）
            const AutoClose = setTimeout(() => {
              try { if (ResultBackdrop && ResultBackdrop.parentNode) ResultBackdrop.parentNode.removeChild(ResultBackdrop); } catch (E) {}
              SafeResolve(WinFlag === true);
            }, 8000);
            Self.Timeouts.push(AutoClose);
          } catch (E) {
            console.error("[QuestGame] EndGame error:", E);
            SafeResolve(null);
          }
        } // End EndGame
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
        try { ReadyText.remove(); } catch (E) {}
        try { BuildGameUI(Backdrop, DialogBox); } catch (E) { console.error("[QuestGame] BuildGameUI call failed:", E); SafeResolve(null); }
      }, 1200);
      this.Timeouts.push(T2);
    }); // End Promise
  } // End GameRun
} // End class QuestGame

// グローバル登録
window.QuestGame = QuestGame;
