/* =========================================================
 * QuestGame クラス（デバッグ用修正版・最小差分）
 * =========================================================*/
class QuestGame {
  constructor(Options = {}) {
    this.Options = Options;
    this.PlayerMaxHp = 10;
    this.EnemyMaxHp = 10;
    this.PlayerHp = this.PlayerMaxHp;
    this.EnemyHp = this.EnemyMaxHp;
    this.IntervalId = null;
    this.Timeouts = [];
    this.Handlers = [];
  }

  CreateBackdropDialog() {
    const qid = `q_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const Backdrop = document.createElement("div");
    Backdrop.className = "ConfirmContainer";
    Backdrop.dataset.qid = qid;
    Backdrop.style.position = "fixed";
    Backdrop.style.left = 0;
    Backdrop.style.top = 0;
    Backdrop.style.right = 0;
    Backdrop.style.bottom = 0;
    Backdrop.style.display = "flex";
    Backdrop.style.alignItems = "center";
    Backdrop.style.justifyContent = "center";
    Backdrop.style.zIndex = 9999;
    Backdrop.style.background = "rgba(0,0,0,0.6)";

    const DialogBox = document.createElement("div");
    DialogBox.className = "DialogBox";
    DialogBox.dataset.qid = qid;
    DialogBox.style.minWidth = "360px";
    DialogBox.style.gap = "12px";
    DialogBox.style.padding = "16px";
    DialogBox.style.background = "#fff";
    DialogBox.style.borderRadius = "8px";
    DialogBox.style.display = "flex";
    DialogBox.style.flexDirection = "column";
    DialogBox.style.alignItems = "center";

    Backdrop.appendChild(DialogBox);
    document.body.appendChild(Backdrop);

    return { Backdrop, DialogBox };
  }

  DrawEnemy(Canvas, HealthRatio) {
    if (!Canvas || !Canvas.getContext) {
      console.error("[QuestGame] Canvas invalid", Canvas);
      return;
    }
    const ctx = Canvas.getContext("2d");
    if (!ctx) {
      console.error("[QuestGame] Failed to get 2d context");
      return;
    }
    const scale = 4;
    const w = Canvas.width;
    const h = Canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = false;
    const pixel = (x, y, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x * scale, y * scale, scale, scale);
    };
    const hpColor =
      HealthRatio > 0.6 ? "#e74c3c" : HealthRatio > 0.3 ? "#f39c12" : "#c0392b";
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
        if (ch === "X") pixel(offsetX + x, offsetY + y, hpColor);
        else pixel(offsetX + x, offsetY + y, "#111");
      }
    }
  }

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
      try { if (h.el && h.fn) h.el.removeEventListener(h.type, h.fn); } catch (e) {}
    });
    this.Handlers = [];
  }

  async GameRun() {
    const self = this;
    return new Promise((Resolve) => {
      let resolved = false;
      const safeResolve = (v) => {
        if (!resolved) {
          resolved = true;
          try { Resolve(v); } catch (e) { console.error("[QuestGame] Resolve threw:", e); }
        }
      };

      // --------- Pre-declare BuildGameUI to avoid hoisting/compat issues  <<<< CHANGED
      function BuildGameUI() {
        console.log('[QuestGame] BuildGameUI entered'); // <<< CHANGED
        // a. Canvas
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
        } catch (e) {
          console.error('[QuestGame] Canvas create failed', e);
          safeResolve(null);
          return;
        }

        // b. Stats
        const StatWrap = document.createElement("div");
        StatWrap.className = "StatBar";
        StatWrap.style.display = "flex";
        StatWrap.style.gap = "12px";
        StatWrap.style.width = "100%";
        StatWrap.style.justifyContent = "space-between";

        const PlayerStat = document.createElement("div");
        PlayerStat.innerHTML = `<span class="StatText">Player</span> <span class="SmallGrey">HP:</span> <span class="PlayerHpText">${self.PlayerHp}/${self.PlayerMaxHp}</span>`;

        const EnemyStat = document.createElement("div");
        EnemyStat.innerHTML = `<span class="StatText">Enemy</span> <span class="SmallGrey">HP:</span> <span class="EnemyHpText">${self.EnemyHp}/${self.EnemyMaxHp}</span>`;

        StatWrap.appendChild(PlayerStat);
        StatWrap.appendChild(EnemyStat);

        // c. Buttons / instruction
        const AttackButton = document.createElement("button");
        AttackButton.className = "AttackButton";
        AttackButton.textContent = "Attack";
        AttackButton.style.padding = "8px 12px";
        AttackButton.style.cursor = "pointer";

        const Instruction = document.createElement("div");
        Instruction.className = "SmallGrey";
        Instruction.textContent = "攻撃ボタンを押して敵を倒そう！ 敵は自動で反撃します.";

        const ResultText = document.createElement("div");
        ResultText.className = "ResultText";
        ResultText.style.minHeight = "18px";

        // ensure DialogBox is visible  <<<< CHANGED
        try { DialogBox.style.display = 'flex'; } catch (e) { console.warn('[QuestGame] DialogBox not found'); }

        // d. append elements
        try {
          DialogBox.appendChild(Canvas);
          DialogBox.appendChild(StatWrap);
          DialogBox.appendChild(Instruction);
          DialogBox.appendChild(AttackButton);
          DialogBox.appendChild(ResultText);
        } catch (e) {
          console.error('[QuestGame] Append to DialogBox failed', e);
          safeResolve(null);
          return;
        }

        // e. initial draw
        try {
          self.DrawEnemy(Canvas, self.EnemyHp / self.EnemyMaxHp);
        } catch (e) {
          console.error('[QuestGame] DrawEnemy failed', e);
        }

        // f. rules
        const PlayerAttackPower = 3;
        const EnemyAttackPower = 2;
        const EnemyAttackInterval = 900;

        // g. player attack
        const OnAttack = () => {
          try {
            self.EnemyHp = Math.max(0, self.EnemyHp - PlayerAttackPower);
            const EnemyHpText = DialogBox.querySelector(".EnemyHpText");
            if (EnemyHpText) EnemyHpText.textContent = `${self.EnemyHp}/${self.EnemyMaxHp}`;
            self.DrawEnemy(Canvas, self.EnemyHp / self.EnemyMaxHp);
            ResultText.textContent = "攻撃！";
            const tmp = setTimeout(()=>{ try{ ResultText.textContent = ""; }catch(e){} }, 300);
            self.Timeouts.push(tmp);
            if (self.EnemyHp <= 0) EndGame(true);
          } catch (e) {
            console.error('[QuestGame] OnAttack error:', e);
            EndGame(false);
          }
        };
        AttackButton.addEventListener("click", OnAttack);
        self.Handlers.push({ el: AttackButton, type: "click", fn: OnAttack });

        // h. enemy attack interval
        self.IntervalId = setInterval(()=> {
          try {
            if (self.EnemyHp > 0) {
              self.PlayerHp = Math.max(0, self.PlayerHp - EnemyAttackPower);
              const PlayerHpText = DialogBox.querySelector(".PlayerHpText");
              if (PlayerHpText) PlayerHpText.textContent = `${self.PlayerHp}/${self.PlayerMaxHp}`;
              ResultText.textContent = "被弾！";
              const tmp2 = setTimeout(()=>{ try{ ResultText.textContent = ""; }catch(e){} }, 300);
              self.Timeouts.push(tmp2);
              self.DrawEnemy(Canvas, self.EnemyHp / self.EnemyMaxHp);
              if (self.PlayerHp <= 0) EndGame(false);
            }
          } catch (e) {
            console.error('[QuestGame] Enemy interval error:', e);
            EndGame(false);
          }
        }, EnemyAttackInterval);

        // EndGame (function declaration stable)
        function EndGame(WinFlag) {
          try {
            // clear timers & handlers
            self.Cleanup();

            // remove game backdrop
            try { if (Backdrop && Backdrop.parentNode) Backdrop.parentNode.removeChild(Backdrop); } catch (e) {}

            // create result dialog
            const { Backdrop: ResultBackdrop, DialogBox: ResultCard } = self.CreateBackdropDialog();
            const Message = document.createElement("p");
            Message.className = "ResultText";
            Message.textContent = WinFlag ? "勝ちました" : "負けました";
            Message.style.fontWeight = "700";
            ResultCard.appendChild(Message);
            const Detail = document.createElement("div");
            Detail.className = "SmallGrey";
            Detail.textContent = WinFlag ? "おめでとう！" : "また挑戦しよう...";
            ResultCard.appendChild(Detail);

            const CloseBtn = document.createElement("button");
            CloseBtn.textContent = "閉じる";
            CloseBtn.className = "ButtonInfo";
            CloseBtn.style.marginTop = "12px";
            CloseBtn.style.cursor = "pointer";

            const onClose = () => {
              try { if (ResultBackdrop && ResultBackdrop.parentNode) ResultBackdrop.parentNode.removeChild(ResultBackdrop); } catch (e) {}
              safeResolve(WinFlag === true);
            };

            CloseBtn.addEventListener("click", onClose);
            self.Handlers.push({ el: CloseBtn, type: "click", fn: onClose });
            ResultCard.appendChild(CloseBtn);

            const autoClose = setTimeout(()=> {
              try { if (ResultBackdrop && ResultBackdrop.parentNode) ResultBackdrop.parentNode.removeChild(ResultBackdrop); } catch (e) {}
              safeResolve(WinFlag === true);
            }, 8000);
            self.Timeouts.push(autoClose);

          } catch (e) {
            console.error('[QuestGame] EndGame error:', e);
            safeResolve(null);
          }
        } // End EndGame
      } // End BuildGameUI

      // --------- Create UI and schedule Start  ---------
      let created;
      try {
        created = this.CreateBackdropDialog();
      } catch (e) {
        console.error("[QuestGame] CreateBackdropDialog threw:", e);
        safeResolve(null);
        return;
      }
      const { Backdrop, DialogBox } = created;

      // READY text
      const ReadyText = document.createElement("p");
      ReadyText.textContent = "よーい…";
      ReadyText.style.fontSize = "18px";
      ReadyText.style.fontWeight = "700";
      DialogBox.appendChild(ReadyText);

      // T1 change text
      const T1 = setTimeout(()=> {
        try { ReadyText.textContent = "開始！"; } catch (e) {}
      }, 700);
      this.Timeouts.push(T1);

      // T2 start game UI (ensure BuildGameUI exists before scheduling)  <<<< CHANGED
      const T2 = setTimeout(()=> {
        try {
          ReadyText.remove();
        } catch (e) {}
        try {
          console.log('[QuestGame] T2 triggered, calling BuildGameUI'); // <<< CHANGED
          BuildGameUI();
        } catch (e) {
          console.error('[QuestGame] BuildGameUI call failed:', e); // <<< CHANGED
          safeResolve(null);
        }
      }, 1200);
      this.Timeouts.push(T2);

    }); // Promise
  } // GameRun
} // class
