/* ==========================================================
* グローバル定義
* ========================================================== */
// 1.ダイアログインスタンス作成
const Dialog = new DialogInfo();

/**
 * セーブスロット選択画面の初期化処理
 */
window.addEventListener("DOMContentLoaded", async () => {
  /* ==========================================================
   * 定義
   * ========================================================== */
  // 1.セーブスロット表示領域取得
  const SaveSlotList = document.getElementById("SaveSlotList");
  // 2.ローカルストレージからプレイヤーIDを取得
  const PlayerId = localStorage.getItem("M_PlayerId");

  /* ==========================================================
   * プレイヤーIDが存在しない場合
   * ========================================================== */
  if (!PlayerId) {
    // 1.空のセーブスロットを3つ作成
    RenderEmptySlots(SaveSlotList);
    // 2.UUIDをユーザーIDとしてローカルストレージにセット
    localStorage.setItem("M_PlayerId",CreateUUID())
    // 3.処理終了
    return;
  }

  /* ==========================================================
   * 通信処理
   * ========================================================== */
  try {
      /* ------------------------------
     * 1. APIに対してリクエストを送信
     * ------------------------------*/
    const Response = await fetch(
      "../../backend/API/Select/SelectSaveSlotController.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        /* リクエストの内容を設定 */
        body: JSON.stringify({
          // 1. プレイヤーID
          PlayerId: PlayerId,
        }),
      }
    );

    /* ------------------------------
     * 2. 処理結果の取得
     * ------------------------------*/
    const Result = await Response.json();
    
    /* ==========================================================
     * 通信成功時
     * ========================================================== */
    if (Result.success && Array.isArray(Result.items)) {
      // 1.セーブスロットの表示処理
      RenderSaveSlots(SaveSlotList, Result.items);
    }
    
  /* ==========================================================
   * 例外処理
   * ========================================================== */
  } catch (error) {
    // 1.デバッグ用ログを出力
    console.error("セーブデータの読み込みに失敗しました:", error);
    // 2.からのセーブスロットを表示
    RenderEmptySlots(SaveSlotList);
    // 3.処理終了
    return
  }
});

/**
 * セーブスロット描画処理
 */
function RenderSaveSlots(container, SaveItems) {
  /* ==========================================================
   * セーブスロット表示処理
   * 固定で3つまでのセーブスロットとする
   * ========================================================== */
  for (let i = 1; i <= 3; i++) {
    /* --------------------------------------------
     * 1. 定義
   　* --------------------------------------------*/
    // 1.セーブスロットの識別キー取得
    const SlotKey = SaveItems[i].saveslotid;

    /* --------------------------------------------
     * 2. セーブスロット作成
   　* --------------------------------------------*/
    /* 1. 定義 */
    // 1.DIV要素作成 
    const Slot = document.createElement("div");
    // 2.クラス設定
    Slot.classList.add("SaveSlot");
    // 3.スロットIDを設定(どうせ連番なのでインデントを設定)
    Slot.dataset.slotId = i;

    /* 2. セーブデータが存在する場合 */
    if (SaveItems[i]) {
      /* 各情報取得 */
      // 1.プレイヤー名取得
      const PlayerName = SaveItems[i].PlayerName;
      // 2.ストーリーID取得
      const StoryId = SaveItems[i].StoryId;
      // 3.開始年月日取得
      const StartDate = SaveItems[i].registdate;
      // 4.終了年月日取得
      const EndDate = SaveItems[i].updatedate;
      // 5.プレイ時間取得
      const PlayTime = calcPlayTime(StartDate, EndDate);

      /* セーブスロットヘッダー作成 */
      // 1.DIV要素作成
      const SaveSlotHeader = document.createElement("div");
      // 2.クラス設定
      SaveSlotHeader.classList.add("SaveSlotHeader");

      /* プレイヤー名作成 */
      // 1.DIV要素作成
      const PlayerNameArea = document.createElement("div");
      // 2.クラス設定
      PlayerNameArea.classList.add("SaveSlotTitle");
      // 3.プレイヤー名設定
      PlayerNameArea.textContent = PlayerName || "プレイヤー名なし";

      /* 削除ボタン作成 */
      // 1.ボタン作成
      const DeleteButton = document.createElement("button");
      // 2.クラス作成
      DeleteButton.classList.add("ButtonInfo", "RedButton");
      // 3.ラベル作成
      DeleteButton.textContent = "削除";
      // 4.クリックイベント定義
      DeleteButton.addEventListener("click", () => DeleteSave(i));

      /* ヘッダーへの格納 */
      // 1.プレイヤー名設定
      SaveSlotHeader.appendChild(PlayerNameArea);
      // 2.削除ボタン設定
      SaveSlotHeader.appendChild(DeleteButton);

      /* 章情報作成 */
      const StoryInfo = CreateInfoElement(`章 : ${StoryId || "-"}`);

      /* プレイ終了日作成 */
      const EndInfo = CreateInfoElement(`プレイ終了日 : ${EndDate || "-"}`);

      /* プレイ時間作成 */
      const TimeInfo = CreateInfoElement(`プレイ時間 : ${PlayTime}`);

      /* 各情報の格納 */
      // 1.スロットにヘッダー格納
      Slot.appendChild(SaveSlotHeader);
      // 2.スロットに章情報を格納
      Slot.appendChild(StoryInfo);
      // 3.スロットにプレイ終了日格納
      Slot.appendChild(EndInfo);
      // 4.スロットにプレイ時間を格納
      Slot.appendChild(TimeInfo);
    } else {
      /* 3. セーブデータが存在しない場合 */
      // 1.DIV要素作成
      const Empty = document.createElement("div");
      // 2.クラス設定
      Empty.classList.add("SaveSlotEmpty");
      // 3.ラベル設定
      Empty.textContent = `セーブスロット ${i}`;
      // 4.スロットに空スロット内容を格納(とどのつまり空のスロット内容の作成・格納処理)
      Slot.appendChild(Empty);
    }
    /* 4. セーブスロットの選択時処理 */
    Slot.addEventListener(("click"),function(){
        // 1.セッションにセーブスロットIDを保持
        sessionStorage.setItem("SaveSlotId",SlotKey);
        // 2.ゲーム画面へ遷移
        window.location.href = "../pages/Game.html";
    })
    /* 5. コンテナにスロットを格納 */
    container.appendChild(Slot);
  }
}

/**
 * 空スロット描画処理
 */
function RenderEmptySlots(container) {
  /* ==========================================================
   * 空セーブスロット表示処理
   * 固定で3つまでのセーブスロットとする
   * ========================================================== */
  for (let i = 1; i <= 3; i++) {
    /* --------------------------------------------
     * 1. セーブスロット作成
   　* --------------------------------------------*/
    // 1.DIV要素作成
    const Slot = document.createElement("div");
    // 2.クラス設定
    Slot.classList.add("SaveSlot");
    // 3.スロットIDの設定
    Slot.dataset.slotId = i;

    /* --------------------------------------------
     * 2. スロット内容作成
   　* --------------------------------------------*/
    // 1.DIV要素作成
    const Empty = document.createElement("div");
    // 2.クラス設定
    Empty.classList.add("SaveSlotEmpty");
    // 3.ラベルの設定
    Empty.textContent = `セーブスロット ${i}`;

    /* --------------------------------------------
     * 3. セーブスロットの選択時イベント
   　* --------------------------------------------*/
    Slot.addEventListener(("click"),function(){
      console.log("dataset.slotId",this.dataset.slotId)
        // 1.セッションにセーブスロットIDを保持
        // sessionStorage.setItem("SaveSlotId",this.dataset.slotId);
        // // 2.ゲーム画面へ遷移
        // window.location.href = "../pages/Game.html";
    })

    /* --------------------------------------------
     * 3. 各格納処理
   　* --------------------------------------------*/
    // 1.スロットに空スロット内容を格納 
    Slot.appendChild(Empty);
    // 2.スロットをコンテナに格納
    container.appendChild(Slot);
  }
}

/**
 * セーブスロット内のプレイ情報行を作成する処理
 */
function CreateInfoElement(PlayInfo) {
  // 1.DIV要素を作成
  const DIV = document.createElement("div");
  // 2.クラスを設定
  DIV.classList.add("SaveSlotInfo");
  // 3.渡されたプレイ情報をラベルに設定
  DIV.textContent = PlayInfo;
  // 4.作成したプレイ情報行を返す
  return DIV;
}

/**
 * プレイ時間計算処理
 */
function calcPlayTime(Start, End) {
 /* ==========================================================
  * バリデーションチェック
  * ========================================================== */
  /* 1.開始年月日または終了年月日が空の場合 */
  if (!Start || !End) {
    // 1.ハイフンを返す
    return "-";
  }

 /* ==========================================================
  * 定義
  * ========================================================== */
  // 1.開始年月日をDATE型に変換
  const StartDate = new Date(Start);
  // 2.終了年月日をDATE型に変換
  const EndDate = new Date(End);
  // 3.プレイ時間を開始年月日と終了年月日の差異で取得
  const DiffDate = EndDate - StartDate;

 /* ==========================================================
  * バリデーションチェック
  * ========================================================== */
  /* 1.差異が0以下の場合 */
  if (DiffDate < 0) {
    // 1.ハイフンを返す
    return "-";
  }

 /* ==========================================================
  * 変換処理
  * ========================================================== */
  // 1.差異となる値を時間形式に変換
  const DiffHours = Math.floor(DiffDate / (1000 * 60 * 60));
  // 2.差異となる値を分形式に変換
  const DiffMinutes = Math.floor((DiffDate % (1000 * 60 * 60)) / (1000 * 60));

 /* ==========================================================
  * 戻り値の設定
  * ========================================================== */
  return `${DiffHours}時間${DiffMinutes}分`;
}

/**
 * セーブスロット削除処理
 * @param slotId セーブスロットID
 */
async function DeleteSave(slotId) {
  const PlayerId = localStorage.getItem("PlayerID");

  try {
    // SaveInfo.json と BackLog.json の両方を取得
    const [saveInfoRes, backLogRes] = await Promise.all([
      fetch("../data/SaveInfo.json"),
      fetch("../data/BackLog.json")
    ]);

    const saveInfo = await saveInfoRes.json();
    const backLog = await backLogRes.json();

    // データ存在確認
    const saveExists = saveInfo.some(
      (entry) => entry.slotId === slotId && entry.playerId === PlayerId
    );
    const logExists = backLog.some(
      (entry) => entry.slotId === slotId && entry.playerId === PlayerId
    );

    if (!saveExists && !logExists) {
      Dialog.ShowDialog("削除を行うデータが存在しません。");
      return;
    }

    // 削除処理
    const updatedSaveInfo = saveInfo.filter(
      (entry) => !(entry.slotId === slotId && entry.playerId === PlayerId)
    );
    const updatedBackLog = backLog.filter(
      (entry) => !(entry.slotId === slotId && entry.playerId === PlayerId)
    );

    // JSON更新はサーバー側が必要（クライアントから直接は書き換え不可）
    // ローカルで確認用に出力
    console.log("削除後SaveInfo:", updatedSaveInfo);
    console.log("削除後BackLog:", updatedBackLog);
    Dialog.ShowDialog("削除が完了しました。");

  } catch (error) {
    console.error("削除処理エラー:", error);
    Dialog.ShowDialog("削除処理中にエラーが発生しました。");
  }
}

/**
 * 戻るボタン押下時の処理
 */
document.getElementById("BackButton").addEventListener("click", () => {
  window.location.href = "../index.html";
});
