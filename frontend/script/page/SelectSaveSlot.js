/* ==========================================================
* グローバル定義
* ========================================================== */
// 1.ダイアログインスタンス作成
const Dialog = new DialogInfo();

/**
 * セーブスロット選択画面の初期化処理
 */
window.addEventListener("DOMContentLoaded", async function() {
  /* ==========================================================
   * 定義
   * ========================================================== */
    // 1. ローカルストレージからプレイヤーIDを取得
  const PlayerId = localStorage.getItem("M_PlayerId");

  /* ==========================================================
   * 各処理実行
   * ========================================================== */
  // 1. 初期開始時に、セーブをせずに終了したセーブスロットの削除処理
  await DeleteTrashSaveSlot(PlayerId);
  // 2. セーブスロット表示内容の取得処理
  await GetSaveSlot(PlayerId);
});

async function DeleteTrashSaveSlot(PlayerId){
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
      "../../backend/API/Delete/DeleteErrorSaveSlotController.php",
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
      // 1.処理終了
      return;
    }
    
  /* ==========================================================
   * 例外処理
   * ========================================================== */
  } catch (error) {
    // 1.デバッグ用ログを出力
    console.error("不要なセーブスロットの削除処理に失敗:", error);
    // 2.処理終了
    return
  }
}

/**
 * セーブスロットへの表示内容の取得処理
 */
async function GetSaveSlot(PlayerId){
  /* ==========================================================
   * 定義
   * ========================================================== */
  // 1. セーブスロット表示領域取得
  const SaveSlotList = document.getElementById("SaveSlotList");

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
    // 1. レスポンスをJSONに整形
    const Result = await Response.json();
  
    /* ==========================================================
     * 通信失敗時
     * ========================================================== */
    if (!Response.ok) {
      // 1. からのセーブスロットを表示
      RenderEmptySlots(SaveSlotList);
      // 2. 処理終了
      return;
    }
    
    /* ==========================================================
     * 通信成功時
     * ========================================================== */
    if (Result.success && Array.isArray(Result.items) && Result.items.length > 0) {
     /* ------------------------------
      * 1. 取得結果が存在する場合
      * ------------------------------*/
      // 1. セーブスロットリストの初期化
      SaveSlotList.innerHTML = "";
      // 2.セーブスロットの表示処理
      RenderSaveSlots(SaveSlotList, Result.items);
      // 3. 処理終了
      return;
    } else {
     /* ------------------------------
      * 2. 取得結果が存在しない場合
      * ------------------------------*/
      // 1. セーブスロットリストの初期化
      SaveSlotList.innerHTML = "";
      // 2. 空セーブスロットの表示処理
      RenderEmptySlots(SaveSlotList);
      // 3. 処理終了
      return;
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
}

/**
 * セーブスロット描画処理
 */
function RenderSaveSlots(container, SaveItems) {
  /* ==========================================================
   * 事前処理
   * ========================================================== */
  // 1. コンテナが存在しない場合は処理終了
  if (!container){
    return;
  }
  // 2. コンテナ初期化
  container.innerHTML = "";

  // 3. SaveItemsが配列でなければ空配列化
  const SaveItemsArray = Array.isArray(SaveItems) ? SaveItems : [];

  // 4. 表示する総スロット数
  const TotalSaveSlot = 3;

  /* ==========================================================
   * セーブスロット表示処理
   * ========================================================== */
  for (let i = 1; i <= TotalSaveSlot; i++) {
    /* --------------------------------------------
     * 1. セーブスロット作成
     * --------------------------------------------*/
    // 1. DIV要素作成 
    const SaveSlot = document.createElement("div");
    // 2. クラス設定
    SaveSlot.classList.add("SaveSlot");
    // 3. スロットIDを設定（文字列で保持）
    SaveSlot.dataset.slotId = String(i);

    /* --------------------------------------------
     * 2. セーブデータの検索
     * --------------------------------------------*/
    const SaveSlotItem = SaveItemsArray.find(SaveInfo => {
      // 1. セーブ情報が存在しない場合はFALSEを返す
      if (!SaveInfo){
        return false;
      }
      // 2. 該当スロットIDの1件だけ取得
      return SaveInfo.saveslotid != null && Number(SaveInfo.saveslotid) === i;
    });

    /* --------------------------------------------
     * 3. セーブデータが存在する場合の描画
     * --------------------------------------------*/
    if (SaveSlotItem) {
      /* 1. 定義 */
      // 1. プレイヤー名
      const PlayerName = SaveSlotItem.playername ?? "松之迫";
      // 2. 開始年月日
      const StartDate = SaveSlotItem.registdate ?? null;
      // 3. 終了年月日
      const EndDate = SaveSlotItem.updatedate
        ? (() => { 
            const DateObject = new Date(SaveSlotItem.updatedate ?? SaveSlotItem.updateDate); 
            return `${DateObject.getFullYear()}年${(DateObject.getMonth()+1).toString().padStart(2,'0')}月${DateObject.getDate().toString().padStart(2,'0')}日 ${DateObject.getHours().toString().padStart(2,'0')}時${DateObject.getMinutes().toString().padStart(2,'0')}分` 
          })()
        : null;


      // 4. プレイ時間取得
      const PlayTime = CalcPlayTime(StartDate, SaveSlotItem.updatedate);

      /* 2. セーブスロットヘッダー作成 */
      // 1. DIV要素作成
      const SaveSlotHeader = document.createElement("div");
      // 2. クラス設定
      SaveSlotHeader.classList.add("SaveSlotHeader");

      /* 3. プレイヤー名作成 */
      // 1. DIV要素作成
      const PlayerNameArea = document.createElement("div");
      // 2. クラス設定
      PlayerNameArea.classList.add("SaveSlotTitle");
      // 3. プレイヤー名設定（デフォルトを用意）
      PlayerNameArea.textContent = PlayerName;

      /* 4. 削除ボタン作成 */
      // 1. ボタン作成
      const DeleteButton = document.createElement("button");
      // 2. クラス設定
      DeleteButton.classList.add("ButtonInfo", "RedButton");
      // 3. ラベル設定
      DeleteButton.textContent = "削除";
      // 4. サイズを縮小
      DeleteButton.style.transform = "scale(0.8)";
      
      /* 5. 削除ボタンクリックイベント */
      DeleteButton.addEventListener("click", (Event) => {
        // 1. スロットクリックを阻止
        Event.stopPropagation(); 
        // 2. セーブデータ削除処理実行
        DeleteButtonEvent(i, SaveSlotItem);
      });

      /* 6. ヘッダーへの格納 */
      // 1. プレイヤー名格納
      SaveSlotHeader.appendChild(PlayerNameArea);
      // 2. 削除ボタン格納
      SaveSlotHeader.appendChild(DeleteButton);

      /* 7. 終了日・プレイ時間作成 */
      // 1. 終了時間格納
      const EndInfo  = CreateInfoElement(`プレイ終了日 : ${EndDate ?? "-"}`);
      // 2. プレイ時間格納
      const TimeInfo = CreateInfoElement(`プレイ時間   : ${PlayTime}`);

      /* 各情報の格納 */
      // 1. セーブスロットにヘッダー格納
      SaveSlot.appendChild(SaveSlotHeader);
      // 2. 終了時間格納
      SaveSlot.appendChild(EndInfo);
      // 3. プレイ時間格納
      SaveSlot.appendChild(TimeInfo);

    } else {
      /* --------------------------------------------
       * 4. セーブデータが存在しない場合（空スロット表示）
       * --------------------------------------------*/
      // 1. DIV要素作成
      const Empty = document.createElement("div");
      // 2. クラス設定
      Empty.classList.add("SaveSlotEmpty");
      // 3. ラベル設定
      Empty.textContent = `セーブスロット ${i}`;
      // 4. セーブスロットに格納
      SaveSlot.appendChild(Empty);
    }

    /* --------------------------------------------
     * 5. セーブスロットの選択時処理
     * --------------------------------------------*/
    SaveSlot.addEventListener("click", function () {
      // 1. セッションにセーブスロットIDを保持
      sessionStorage.setItem("SaveSlotId", this.dataset.slotId);
      // 2. ゲーム画面へ遷移
      window.location.href = "../pages/Game.php";
    });

    /* --------------------------------------------
     * 6. コンテナにスロットを格納
     * --------------------------------------------*/
    container.appendChild(SaveSlot);
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
        // 1.セッションにセーブスロットIDを保持
        sessionStorage.setItem("SaveSlotId",this.dataset.slotId);
        // 2.ゲーム画面へ遷移
        window.location.href = "../pages/Game.php";
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
function CalcPlayTime(Start, End) {
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
 /* 1. どちらも0の場合は0時間として返す */
  if (DiffHours === 0 && DiffMinutes === 0) {
    return `0時間`;
  } else {
    /* 2. そうでない場合は正常に返す */
    return `${DiffHours}時間${DiffMinutes}分`;
  }
}

/**
 * セーブスロット削除ボタン押下時
 * コンファームによる削除処理の呼び出し中継
 * @param slotId セーブスロットID
 */
function DeleteButtonEvent(SlotId) {
  Dialog.ShowConfirmDialog("削除されたデータは復旧できません。削除を行いますか？").then((result) => {
    // 1.[はい]が選択された場合のみ削除処理を実行
    if (result) {
      DeleteSaveInfo(SlotId)
    }else{
      return;
    }
  })
}

/**
 * セーブスロットの削除処理
 * @param slotId セーブスロットID
 */
async function DeleteSaveInfo(SlotId){
  /* ==========================================================
   * 定義
   * ========================================================== */
  // 1.ローカルストレージからプレイヤーIDを取得
  const PlayerId = localStorage.getItem("M_PlayerId");

  /* ==========================================================
   * 通信処理
   * ========================================================== */
  try {
      /* ------------------------------
     * 1. スピナー表示
     * ------------------------------*/
    ShowSpinner();

    /* ------------------------------
     * 2. APIに対してリクエストを送信
     * ------------------------------*/
    const Response = await fetch(
      "../../backend/API/Delete/DeleteSaveSlotController.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        /* リクエストの内容を設定 */
        body: JSON.stringify({
          // 1. プレイヤーID
          PlayerId: PlayerId,
          // 2. セーブスロットID
          SlotId: SlotId
        }),
      }
    );

    /* ------------------------------
     * 3. 処理結果の取得
     * ------------------------------*/
    const Result = await Response.json();
    
    /* ==========================================================
     * 通信成功時
     * ========================================================== */
    if (Result.success) {
      // 1.メッセージダイアログを表示
      await Dialog.ShowDialog(Result.message);
      // 2.ページ再読み込み
      location.reload();
    } else {
      /* ==========================================================
       * 通信失敗時
       * ========================================================== */
      // 1.メッセージダイアログを表示
      await Dialog.ShowDialog(Result.message);
      // 2.ページ再読み込み
      location.reload();
    }
    
  /* ==========================================================
   * 例外処理
   * ========================================================== */
  } catch (error) {
    // 1.エラーログ
    console.error("通信エラー :", error);
    // 2.ダイアログ表示
    await Dialog.ShowDialog("セーブデータの削除に失敗しました。");
    // 3.処理終了
    return
  }
  /* ==========================================================
   * 終了時処理
   * ========================================================== */
  finally{
    // 1.スピナー削除
    HiddenSpinner();
  }
}

/**
 * 戻るボタン押下時の処理
 */
document.getElementById("BackButton").addEventListener("click", () => {
  window.location.href = "../pages/Start.php";
});
