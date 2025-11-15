/* =========================================================
 * QuestGame クラス（ドラクエ風の簡易対戦）
 * - must implement GameRun(): Promise<boolean>
 * - 表示は ConfirmContainer / DialogBox を使用
 * - createElement で作成、PascalCase 名称
 * =========================================================*/
class QuestGame {
  constructor(Options = {}) {
    // 1. オプション保持（未使用だが拡張用）
    this.Options = Options;

    // 2. ステート
    this.PlayerMaxHp = 10;
    this.EnemyMaxHp = 10;
    this.PlayerHp = this.PlayerMaxHp;
    this.EnemyHp = this.EnemyMaxHp;

    // 3. リソース管理
    this.IntervalId = null;
    this.Timeouts = [];
    this.Handlers = [];
  }

  /* --------------------------------------------
   * CreateBackdropDialog
   * - Backdrop(.ConfirmContainer) と DialogBox(.DialogBox) を作成して返す
   * --------------------------------------------*/
  CreateBackdropDialog() {
    // 1. バックドロップ作成
    const Backdrop = document.createElement("div");
    Backdrop.className = "ConfirmContainer";

    // 2. ダイアログカード作成
    const DialogBox = document.createElement("div");
    DialogBox.className = "DialogBox";
    DialogBox.style.minWidth = "360px";
    DialogBox.style.gap = "12px";

    // 3. DOM に追加
    Backdrop.appendChild(DialogBox);
    document.body.appendChild(Backdrop);

    return { Backdrop, DialogBox };
  }

  /* --------------------------------------------
   * DrawEnemy
   * - canvas に簡易ドット絵で敵を描画する
   * --------------------------------------------*/
  DrawEnemy(Canvas, HealthRatio) {
    const ctx = Canvas.getContext("2d");
    const scale = 4;
    const w = Canvas.width;
    const h = Canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = false;

    const pixel = (x, y, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x * scale, y * scale, scale, scale);
    };

    const hpColor = HealthRatio > 0.6 ? "#e74c3c" : (HealthRatio > 0.3 ? "#f39c12" : "#c0392b");

    const layout = [
      "  XXX  ",
      " XXXXX ",
      "XXXXXXX",
      "X XX XX",
      "XXXXXXX",
      " X   X ",
      "  X X  ",
    ];

    const offsetX = 1;
    const offsetY = 1;
    for (let y = 0; y < layout.length; y++) {
      for (let x = 0; x < layout[y].length; x++) {
        const ch = layout[y][x];
        if (ch === "X") {
          pixel(offsetX + x, offsetY + y, hpColor);
        } else {
          pixel(offsetX + x, offsetY + y, "#111");
        }
      }
    }
  }

  /* --------------------------------------------
   * GameRun
   * - メインの実行メソッド（Promise<boolean> を返す）
   * --------------------------------------------*/
  GameRun() {
    return new Promise((Resolve) => {
      /* ------------------------------
       * 1. 画面作成（READY → START → ゲームUI）
       * ------------------------------*/
      const { Backdrop, DialogBox } = this.CreateBackdropDialog();

      // READY テキスト
      const ReadyText = document.createElement("p");
      ReadyText.textContent = "よーい…";
      ReadyText.style.fontSize = "18px";
      ReadyText.style.fontWeight = "700";
      DialogBox.appendChild(ReadyText);

      // READY -> START
      const T1 = setTimeout(() => {
        ReadyText.textContent = "開始！";
      }, 700);
      this.Timeouts.push(T1);

      const T2 = setTimeout(() => {
        try { ReadyText.remove(); } catch (e) {}
        BuildGameUI.call(this);
      }, 1200);
      this.Timeouts.push(T2);

      /* ------------------------------
       * 2. BuildGameUI (内部関数)
       * ------------------------------*/
      function BuildGameUI() {
        // a. Canvas の作成
        const Canvas = document.createElement("canvas");
        Canvas.className = "QuestCanvas";
        Canvas.width = 32;
        Canvas.height = 28;
        Canvas.style.width = "256px";
        Canvas.style.height = "224px";
        Canvas.style.border = "4px solid #333";
        Canvas.style.background = "#000";

        // b. ステータス表示
        const StatWrap = document.createElement("div");
        StatWrap.className = "StatBar";

        const PlayerStat = document.createElement("div");
        PlayerStat.innerHTML = `<span class="StatText">Player</span> <span class="SmallGrey">HP:</span> <span id="PlayerHpText">${this.PlayerHp}/${this.PlayerMaxHp}</span>`;

        const EnemyStat = document.createElement("div");
        EnemyStat.innerHTML = `<span class="StatText">Enemy</span> <span class="SmallGrey">HP:</span> <span id="EnemyHpText">${this.EnemyHp}/${this.EnemyMaxHp}</span>`;

        StatWrap.appendChild(PlayerStat);
        StatWrap.appendChild(EnemyStat);

        // c. ボタン等
        const AttackButton = document.createElement("button");
        AttackButton.className = "AttackButton";
        AttackButton.textContent = "Attack";

        const Instruction = document.createElement("div");
        Instruction.className = "SmallGrey";
        Instruction.textContent = "攻撃ボタンを押して敵を倒そう！ 敵は自動で反撃します。";

        const ResultText = document.createElement("div");
        ResultText.className = "ResultText";

        // d. DialogBox に追加
        DialogBox.appendChild(Canvas);
        DialogBox.appendChild(StatWrap);
        DialogBox.appendChild(Instruction);
        DialogBox.appendChild(AttackButton);
        DialogBox.appendChild(ResultText);

        // e. 初期描画
        this.DrawEnemy(Canvas, this.EnemyHp / this.EnemyMaxHp);

        // f. ルール
        let PlayerAttackPower = 3;
        let EnemyAttackPower = 2;
        const EnemyAttackInterval = 900;

        // g. プレイヤー攻撃処理
        const OnAttack = () => {
          this.EnemyHp = Math.max(0, this.EnemyHp - PlayerAttackPower);
          const EnemyHpText = DialogBox.querySelector("#EnemyHpText");
          if (EnemyHpText) EnemyHpText.textContent = `${this.EnemyHp}/${this.EnemyMaxHp}`;
          this.DrawEnemy(Canvas, this.EnemyHp / this.EnemyMaxHp);

          ResultText.textContent = "攻撃！";
          const tmp = setTimeout(() => { if (ResultText) ResultText.textContent = ""; }, 300);
          this.Timeouts.push(tmp);

          if (this.EnemyHp <= 0) {
            EndGame.call(this, true);
          }
        };

        AttackButton.addEventListener("click", OnAttack);
        this.Handlers.push({ el: AttackButton, type: "click", fn: OnAttack });

        // h. 敵の自動反撃タイマー
        this.IntervalId = setInterval(() => {
          if (this.EnemyHp > 0) {
            this.PlayerHp = Math.max(0, this.PlayerHp - EnemyAttackPower);
            const PlayerHpText = DialogBox.querySelector("#PlayerHpText");
            if (PlayerHpText) PlayerHpText.textContent = `${this.PlayerHp}/${this.PlayerMaxHp}`;

            ResultText.textContent = "被弾！";
            const tmp2 = setTimeout(() => { if (ResultText) ResultText.textContent = ""; }, 300);
            this.Timeouts.push(tmp2);

            this.DrawEnemy(Canvas, this.EnemyHp / this.EnemyMaxHp);

            if (this.PlayerHp <= 0) {
              EndGame.call(this, false);
            }
          }
        }, EnemyAttackInterval);

        /* --------------------------------------------
         * EndGame 共通処理（勝敗確定時）
         * - ゲームUIを閉じ、結果用 DialogBox を表示して
         *   閉じるボタンで Resolve(true/false) を返す
         * --------------------------------------------*/
        const EndGame = (WinFlag) => {
          // 1. cleanup
          Cleanup.call(this);

          // 2. ゲームUIを閉じる（Backdrop を削除）
          try { Backdrop.remove(); } catch (e) {}

          // 3. 結果用カード作成
          const { Backdrop: ResultBackdrop, DialogBox: ResultCard } = this.CreateBackdropDialog();

          // 4. 結果テキスト
          const Message = document.createElement("p");
          Message.className = "ResultText";
          Message.textContent = WinFlag ? "勝ちました" : "負けました";
          ResultCard.appendChild(Message);

          // 5. 補足テキスト
          const Detail = document.createElement("div");
          Detail.className = "SmallGrey";
          Detail.textContent = WinFlag ? "おめでとう！" : "また挑戦しよう...";
          ResultCard.appendChild(Detail);

          // 6. 閉じるボタン（これで Promise を resolve）
          const CloseBtn = document.createElement("button");
          CloseBtn.textContent = "閉じる";
          CloseBtn.className = "ButtonInfo";
          CloseBtn.style.marginTop = "12px";

          CloseBtn.addEventListener("click", () => {
            try { ResultBackdrop.remove(); } catch (e) {}
            Resolve(WinFlag === true);
          });

          ResultCard.appendChild(CloseBtn);
        };

      } // BuildGameUI end
    }); // Promise end
  } // GameRun end

  /* --------------------------------------------
   * Cleanup
   * - タイマー・イベントを解除して DOM 漏れを防ぐ
   * --------------------------------------------*/
  Cleanup() {
    if (this.IntervalId) {
      try { clearInterval(this.IntervalId); } catch (e) {}
      this.IntervalId = null;
    }
    this.Timeouts.forEach((t) => {
      try { clearTimeout(t); } catch (e) {}
    });
    this.Timeouts = [];

    this.Handlers.forEach((h) => {
      try { h.el.removeEventListener(h.type, h.fn); } catch (e) {}
    });
    this.Handlers = [];
  }
} 