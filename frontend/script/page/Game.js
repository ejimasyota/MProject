/* =========================================================
 * グローバル定義
 * =========================================================*/
/* --------------------------------------------
 *  1. 各データ管理変数
 * --------------------------------------------*/
// 1. バックログ内容管理用配列
const BACKLOG_INFO = [];
// 2. ストーリーJSON内容管理用配列
const STORY_INFO = [];
// 3. 次のストーリーIDを保持する変数(次というのは、クリック時に表示を行う内容のこと)
let NEXT_STORY_ID = null;
// 4. プレイヤーID
const PLAYER_ID = localStorage.getItem("M_PlayerId");
// 5. 選択されたセーブスロットID
const SAVE_SLOT_ID = sessionStorage.getItem("SaveSlotId");
// 6. プレイヤー名
let PLAYER_NAME = "";
// 7. 現在参照しているストーリーID
let STORY_ID = null;

/* --------------------------------------------
 *  2. パス管理変数
 * --------------------------------------------*/
// 1. ストーリー管理JSON
const STORY_INFO_JSON_PATH = "../Data/StoryInfo.json";
// 2. セーブデータ取得API
const SELECT_SAVE_API_PATH = "../../backend/API/Select/SelectSaveInfoController.php";

/* --------------------------------------------
 *  3. インスタンス管理変数
 * --------------------------------------------*/
// 1. メッセージダイアログ
const MESSAGE_DIALOG = new DialogInfo();
// 2. 名前入力フォームインスタンス
const NAME_FORM_DIALOG = new NameFormDialog();
// 3. メッセージボックスダイアログ
const MESSAGE_BOX_DIALOG = new MessageBoxDialog();

/* =========================================================
 * 画面ロード時処理
 * =========================================================*/
document.addEventListener("DOMContentLoaded", function() {
    // 1. ストーリー内容のJSONを読み込み・配列化
    StoryInfoGetJson();
    // 2. セーブデータの取得処理呼び出し
    GetSaveDataInfo();
});

/* =========================================================
 * ストーリーJSONの読み込み・配列化
 * =========================================================*/
async function StoryInfoGetJson() {
  // 1. JSONファイルを読み込み
  const Response = await fetch(STORY_INFO_JSON_PATH);
  // 2. 読み込み成功時
  if(Response.ok) {
    // 3. レスポンスをJSONにパース
    const JsonResponse = await Response.json();
    // 4. ストーリー内容を保持する配列に展開
    STORY_INFO.push(...JsonResponse);
  }
}

/* =========================================================
 * セーブデータの取得処理
 * =========================================================*/
async function GetSaveDataInfo(){
    try {
       /* --------------------------------------------
        *  1. 事前処理
        * --------------------------------------------*/
        // 1. スピナー表示
        ShowSpinner();

       /* --------------------------------------------
        *  2. 通信処理
        * --------------------------------------------*/
        const Response = await fetch(
            SELECT_SAVE_API_PATH, 
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
                SaveSlotId: SAVE_SLOT_ID,
                PlayerId: PLAYER_ID
            }),
        });
        console.log("Response",Response)

       /* --------------------------------------------
        *  3. レスポンス処理
        * --------------------------------------------*/
        // 1. レスポンスをJSONにパース
         const Result = await Response.json();

       /* --------------------------------------------
        *  4. 通信成功時
        * --------------------------------------------*/
        if (Result && Result.success) {
           /* --------------------------------------------
            *  5. 取得内容が存在する場合
            * --------------------------------------------*/
           if(Result.items && Result.items.SaveInfo.length > 0){
            /* 1. バックログの設定処理 */
            Result.items.BackLogInfo.forEach((BackLogItem)=>{
                BACKLOG_INFO.push({
                   // 1. ストーリーテキスト
                   StoryText :  BackLogItem.storytext,
                   // 2. キャラ名
                   Narrator : BackLogItem.narrator,
                   // 3. ログID(既存ログの取得時のみ保持される属性。新規ログ登録時はDBでシーケンスの登録を行う)
                   LogId : BackLogItem.logid
                })

            })
            /* 2. プレイヤー名設定 */
            PLAYER_NAME = Result.items.PlayerInfo.playername;
            /* 3. ストーリーIDを渡す */
            GameDisplayInfo(Result.items.SaveInfo.storyid);
           }else{
                /* --------------------------------------------
                *  6. 取得内容が存在しない場合
                * --------------------------------------------*/
                // 1. メッセージダイアログを表示
                MESSAGE_DIALOG.ShowDialog("セーブデータが存在しないため最初から開始します。").then((Result) => {
                    if(Result){
                        // 2. 名前入力ダイアログを表示
                        NAME_FORM_DIALOG.ShowNameDialog().then((Result) => {
                            // 3. Promise解決時(rejectは無い)
                            if(Result){
                                // 4. プレイヤー名を保持
                                PLAYER_NAME = sessionStorage.getItem("PlayerName");
                                // 5. セッションからプレイヤー名を削除(セッション内容の管理が複雑になるのは嫌なので)
                                sessionStorage.removeItem("PlayerName");
                                // 6. ストーリーIDを固定で[1]を渡す
                                GameDisplayInfo(1);
                            }
                        })
                    }
                });
            }
        }
    /* 6. 例外処理 */
    } catch (Error) {
        // 3. 処理終了
        return;
    /* 7. 終了時処理 */
    } finally{
        // 1. スピナーを削除
        HiddenSpinner();
    }
}

/* =========================================================
 * ストーリーIDに基づいて画面を設定する処理
 * =========================================================*/
async function GameDisplayInfo(StoryId){
   /* --------------------------------------------
    *  1. ストーリーIDが存在しない場合
    * --------------------------------------------*/
    if(!StoryId){
        // 1. デバッグログ
        console.error("ストーリーID取得失敗");
        // 2. 処理終了
        return;
    }

   /* --------------------------------------------
    *  2. 現在のストーリーIDを保持
    * --------------------------------------------*/
   STORY_ID = StoryId;

   /* --------------------------------------------
    *  3. ストーリーIDに紐づく要素を取得
    * --------------------------------------------*/
    const StoryItem = STORY_INFO.find(Item => {
        // 1. Item内と引数のStoryIdの値が完全一致するものを検索
        return Number(Item.StoryId) === Number(STORY_ID);
    });

   /* --------------------------------------------
    *  4. ストーリーIDに紐づく要素が存在しない場合
    * --------------------------------------------*/
    if(!StoryItem){
        // 1. デバッグログ
        console.error("ストーリー取得失敗");
        // 2. 処理終了
        return;
    }

    /* --------------------------------------------
    *  5. テキスト内のプレイヤー名置換処理
    * --------------------------------------------*/
    // 1. ストーリーテキストを取得
    let StoryText = StoryItem.StoryText;

    // 2. {PlayerName} が含まれている場合はプレイヤー名で置換処理を実行
    if (typeof StoryText === "string" && StoryText.includes("{PlayerName}")) {
        StoryText = StoryText.replaceAll("{PlayerName}", PLAYER_NAME);
    }

    /* --------------------------------------------
    *  6. キャラ名のプレイヤー名置換処理
    * --------------------------------------------*/
    // 1. キャラ名を取得
    let CharaName = StoryItem.Narrator;

    // 2. {PlayerName} が含まれている場合はプレイヤー名で置換処理を実行
    if (typeof CharaName === "string" && CharaName.includes("{PlayerName}")) {
        CharaName = CharaName.replaceAll("{PlayerName}", PLAYER_NAME) ?? "";
    }

   /* --------------------------------------------
    *  7. メッセージボックス表示FLGがTRUEの場合
    * --------------------------------------------*/
    if(StoryItem.Flg[0].MessageBoxFlg){
      await MESSAGE_BOX_DIALOG.ShowMessage(
        // 1. テキスト設定
        StoryText,
        // 2. キャラ名設定
        CharaName,
        // 3. 顔アイコンの表示
        ""
      );
    }else{
       /* --------------------------------------------
        *  8. メッセージボックス表示FLGがFALSEの場合
        * --------------------------------------------*/
       // 1. メッセージボックスの非表示処理を実行
       await MESSAGE_BOX_DIALOG.HideMessage();
    }
    /* --------------------------------------------
     *  9. バックログ内容の作成
     * --------------------------------------------*/
     BACKLOG_INFO.push({
        // 1. ストーリーテキスト
        StoryText :  StoryText,
        // 2. キャラ名
        Narrator : CharaName,
    })

    /* --------------------------------------------
     *  10. 選択肢表示を行わない場合
     * --------------------------------------------*/
    if(StoryItem.Select.length === 0 && StoryItem.Next){
        // 1. 次のシーンIDを保持
        NEXT_STORY_ID = StoryItem.Next;
    }else{
        /* --------------------------------------------
        *  11. 選択肢表示を行う場合
        * --------------------------------------------*/
       // 1. 選択肢の表示
       DisplaySelectButton(StoryItem.Select);
       // 2. 処理終了
       return;
    }

   /* --------------------------------------------
    *  12. 背景画像パスが指定されている場合
    * --------------------------------------------*/
    /* 1. 定義 */
    // 1. ゲーム画面のコンテナの取得
    const GameContainer = document.querySelector(".GameContainer");
    console.log("GameContainer",GameContainer)

    /* 2. ゲーム画面のコンテナの取得が行えない場合 */
    if (!GameContainer) {
      // 1. 処理終了
      return;
    }
    console.log("StoryItem.BgPath",StoryItem.BgPath)
    /* 3. 背景画像が指定されている場合 */
    if (StoryItem.BgPath && StoryItem.BgPath !== "") {
      // 1. 背景画像設定
      GameContainer.style.background =
          `url('${StoryItem.BgPath}') no-repeat center center fixed`;
      // 2. 要素全体を必ず覆うよう設定
      GameContainer.style.backgroundSize = "cover";
    }else{
      /* 4. 背景画像が指定されていない場合 */
      // 1. デフォルト背景画像設定
      GameContainer.style.background =
          "url('../asetts/img/bg/Default.jpg') no-repeat center center fixed";
      // 2. 要素全体を必ず覆うよう設定
      GameContainer.style.backgroundSize = "cover";
    }
}


/* =========================================================
 * 選択肢ボタン表示処理（バックドロップ対応）
 * =========================================================*/
function DisplaySelectButton(SelectArray) {
   /* --------------------------------------------
    *  1. 事前定義
    * --------------------------------------------*/
    // 1. 選択肢コンテナを呼び出し
    let SelectContainer = document.getElementById("SelectContainer");
    // 2. バックドロップを呼び出し
    let SelectBackdrop = document.getElementById("SelectBackdrop");

   /* --------------------------------------------
    *  2. バックドロップが存在しない場合は作成
    * --------------------------------------------*/
    if (!SelectBackdrop) {
      // 1. DIV要素作成
      SelectBackdrop = document.createElement("div");
      // 2. ID設定
      SelectBackdrop.id = "SelectBackdrop";
      // 3. クラス設定
      SelectBackdrop.classList.add("SelectBackdrop");
      // 4. 背景のクリックイベントを停止させる
      SelectBackdrop.addEventListener("click", (Event) => {
          Event.stopPropagation();
          Event.preventDefault();
      });
      // 5. ボディにバックドロップを格納
      document.body.appendChild(SelectBackdrop);
    }

   /* --------------------------------------------
    *  3. コンテナが存在しない場合は作成
    * --------------------------------------------*/
    if (!SelectContainer) {
        // 1. DIV要素作成
        SelectContainer = document.createElement("div");
        // 2. ID設定
        SelectContainer.id = "SelectContainer";
        // 3. クラス設定
        SelectContainer.classList.add("SelectContainer");
        // 4. ボディにコンテナを格納
        document.body.appendChild(SelectContainer);
    }

   /* --------------------------------------------
    *  4. 既存の選択肢を初期化
    * --------------------------------------------*/
    SelectContainer.innerHTML = "";

   /* --------------------------------------------
    *  5. 選択肢の作成
    * --------------------------------------------*/
    SelectArray.forEach((SelectItem) => {
        /* 1. 定義 */
        // 1. ボタン要素作成
        const SelectButton = document.createElement("button");
        // 2. ラベル設定
        SelectButton.textContent = SelectItem.StoryText;
        // 3. クラス設定
        SelectButton.classList.add("SelectButton");
        // 4. アクセシビリティ向上のため tabindex を付与
        SelectButton.setAttribute("tabindex", "0");

        /* 2. 選択肢選択時処理 */
        SelectButton.addEventListener("click", () => {
            try {
                // 1. 選択肢押下時に次のストーリーIDを渡して画面表示を更新
                GameDisplayInfo(SelectItem.Next);
            } finally {
                // 2. 選択肢ボタンを削除
                if (SelectContainer){
                   SelectContainer.remove();
                };
                // 3. バックドロップを削除
                if (SelectBackdrop) {
                   SelectContainer.remove();
                }
            }
        });

        /* 3. コンテナに選択肢を格納 */
        SelectContainer.appendChild(SelectButton);
    });
}


/* =========================================================
 * バックログダイアログ表示処理
 * =========================================================*/
function ShowBacklogDialog() {
 /* --------------------------------------------
  *  1. バックログコンテナを作成
  * --------------------------------------------*/
  // 1. DIV要素の作成
  const BacklogContainer = document.createElement("div");
  // 2. クラス設定
  BacklogContainer.className = "ConfirmContainer";

 /* --------------------------------------------
  *  2. ダイアログのカード作成
  * --------------------------------------------*/
  // 1. DIV要素の作成
  const BacklogDialog = document.createElement("div");
  // 2. クラス設定
  BacklogDialog.className = "DialogBox";

 /* --------------------------------------------
  *  3. バックログ内容の作成
  * --------------------------------------------*/
  BACKLOG_INFO.forEach((Item) => {
    /* 1. 事前処理 */
    // 1. DIV要素作成
    const StoryLine = document.createElement("div");
    // 2. クラス設定
    StoryLine.className = "BacklogLine";
    
    /* 2. キャラ名が存在する場合 */
    if (Item.Narrator) {
        // 1. span要素作成
        const CharaName = document.createElement("span");
        // 2. クラス設定
        CharaName.className = "NarratorName";
        // 3. キャラ名設定
        CharaName.textContent = Item.Narrator;
        // 4. span要素作成
        const TextSpan = document.createElement("span");
        // 5. ストーリーテキスト設定
        TextSpan.textContent = Item.StoryText;
        // 6. キャラ名格納
        StoryLine.appendChild(CharaName);
        // 7. ストーリーテキスト格納
        StoryLine.appendChild(TextSpan);
      
    } else {
      /* 3. キャラ名が存在しない場合(効果音のみのテキストの想定) */
      StoryLine.textContent = Item.StoryText;
    }
    /* 4. バックログに格納 */
    BacklogDialog.appendChild(StoryLine);
  });

 /* --------------------------------------------
  *  4. 閉じるボタンの作成
  * --------------------------------------------*/
  // 1. ボタン要素の作成
  const CloseButton = document.createElement("button");
  // 2. クラス設定
  CloseButton.classList.add("ButtonInfo", "PinkButton");
  // 3. ラベル設定
  CloseButton.textContent = "閉じる";

 /* --------------------------------------------
  *  5. 閉じるボタンのイベント定義
  * --------------------------------------------*/
  CloseButton.addEventListener("click", () => {
    // 1. ダイアログを削除
    if (BacklogContainer.parentNode) {
      BacklogContainer.parentNode.removeChild(BacklogContainer);
    }
  });

 /* --------------------------------------------
  *  6. 閉じるボタンをバックログに格納
  * --------------------------------------------*/
  BacklogDialog.appendChild(CloseButton);

 /* --------------------------------------------
  *  7. DOM構築
  * --------------------------------------------*/
  // 1. バックログコンテナにバックログ格納
  BacklogContainer.appendChild(BacklogDialog);
  // 2. ボディにバックログコンテナを格納
  document.body.appendChild(BacklogContainer);
}

/* =========================================================
 * セーブボタン押下時処理
 * =========================================================*/
async function SaveInfo(){
  try {
    /* ------------------------------
     * 1. スピナー表示
     * ------------------------------*/
    ShowSpinner("セーブしています。ブラウザを閉じないでください。");

    /* ------------------------------
     * 2. APIに対してリクエストを送信
     * ------------------------------*/
    const Response = await fetch(
      "../../backend/API/Update/UpdateSaveDataController.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        /* リクエストの内容を設定 */
        body: JSON.stringify({
          // 1. プレイヤーID
          PlayerId: PLAYER_ID,
          // 2. ストーリーID
          StoryId : STORY_ID,
          // 3. セーブスロットID
          SlotId: SAVE_SLOT_ID,
          // 4. バックログ配列
          BackLog : BACKLOG_INFO
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
      // 1.明示的にスピナー削除
      HiddenSpinner();
      // 2.メッセージダイアログを表示
      await MESSAGE_DIALOG.ShowDialog(Result.message);
      // 3.処理終了
      return;
    } else {
      /* ==========================================================
       * 通信失敗時
       * ========================================================== */
      // 1.明示的にスピナー削除
      HiddenSpinner();
      // 2.メッセージダイアログを表示
      await MESSAGE_DIALOG.ShowDialog(Result.message);
      // 3.処理終了
      return;
    }
    
  /* ==========================================================
   * 例外処理
   * ========================================================== */
  } catch (error) {
    // 1.エラーログ
    console.error("通信エラー :", error);
    // 2.明示的にスピナー削除
    HiddenSpinner();
    // 3.ダイアログ表示
    await MESSAGE_DIALOG.ShowDialog("セーブに失敗しました。");
    // 4.処理終了
    return
  }
}

/* =========================================================
 * ホームへ戻る処理
 * =========================================================*/
function HomeRedirect() {
  MESSAGE_DIALOG.ShowConfirmDialog("セーブスロット選択画面へ戻りますか？").then((Result) => {
    if(Result){
       /* --------------------------------------------
        *  1. リファラーを取得
        * --------------------------------------------*/
        const Referrer = document.referrer;

        /* --------------------------------------------
        *  2. 遷移先判定
        * --------------------------------------------*/
        if (Referrer && Referrer !== window.location.href) {
            // 1. リファラーが存在し、かつ現在の画面と異なる場合は遷移
            window.location.href = Referrer;
            // 2. 処理終了
            return;
        }

        /* --------------------------------------------
        *  3. リファラーが存在しない場合はホーム画面へ遷移
        * --------------------------------------------*/
        window.location.href = "../pages/SelectSaveSlot.php";
    }
  });
}
