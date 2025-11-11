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
    // 2.処理終了
    return;
  }

  /* ==========================================================
   * JSON読み取り処理
   * ========================================================== */
  try {
    // 1.レスポンス取得
    const Response = await fetch("../Data/SaveInfo.json");
    // 2.JSON形式に変換
    const JsonData = await Response.json();
    // 3.プレイヤーIDに紐づくデータを取得
    const SaveItems = JsonData.SaveItem[PlayerId] || {};
    // 4.セーブスロットの表示処理
    RenderSaveSlots(container, SaveItems);

  /* ==========================================================
   * 例外処理
   * ========================================================== */
  } catch (error) {
    // 1.デバッグ用ログを出力
    console.error("セーブデータの読み込みに失敗しました:", error);
    // 2.からのセーブスロットを表示
    RenderEmptySlots(container);
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
    const SlotKey = `SaveSlot${i}`;
    // 2.セーブスロットに紐づくデータを取得
    const SlotData = SaveItems[SlotKey];

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
    if (SlotData) {
      /* 各情報取得 */
      // 1.プレイヤー名取得
      const PlayerName = SlotData.PlayerName;
      // 2.ストーリーID取得
      const StoryId = SlotData.StoryId;
      // 3.開始年月日取得
      const StartDate = SlotData.StartDate;
      // 4.終了年月日取得
      const EndDate = SlotData.EndDate;
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
    /* 4. コンテナにスロットを格納 */
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
 * 削除ボタン押下時（実装は後ほど）
 */
function DeleteSave(slotId) {
  console.log(`スロット${slotId}の削除処理（未実装）`);
}
