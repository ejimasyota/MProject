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
           if(Result.Items && Result.Items.length > 0){
            // 1. ストーリーIDを渡す
            GameDisplayInfo(Result.Items.storyid);
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
    *  1. バリデーションチェック
    * --------------------------------------------*/
    // 1. ストーリーIDが存在しない場合
    if(!StoryId){
        // 1. デバッグログ
        console.error("ストーリーID取得失敗");
        // 2. 処理終了
        return;
    }

   /* --------------------------------------------
    *  2. ストーリーIDに紐づく要素を取得
    * --------------------------------------------*/
    const StoryItem = STORY_INFO.find(Item => {
        // 1. Item内と引数のStoryIdの値が完全一致するものを検索
        return Number(Item.StoryId) === Number(StoryId);
    });

    /* --------------------------------------------
    *  3. テキスト内のプレイヤー名置換処理
    * --------------------------------------------*/
    // 1. ストーリーテキストを取得
    let StoryText = StoryItem.StoryText;

    // 2. {PlayerName} が含まれている場合はプレイヤー名で置換処理を実行
    if (typeof StoryText === "string" && StoryText.includes("{PlayerName}")) {
        StoryText = StoryText.replaceAll("{PlayerName}", PLAYER_NAME);
    }

    /* --------------------------------------------
    *  4. キャラ名のプレイヤー名置換処理
    * --------------------------------------------*/
    // 1. キャラ名を取得
    let CharaName = StoryItem.Narrator;

    // 2. {PlayerName} が含まれている場合はプレイヤー名で置換処理を実行
    if (typeof CharaName === "string" && CharaName.includes("{PlayerName}")) {
        CharaName = CharaName.replaceAll("{PlayerName}", PLAYER_NAME);
    }

   /* --------------------------------------------
    *  5. メッセージボックス表示FLGがTRUEの場合
    * --------------------------------------------*/
   console.log("StoryItem.Flg[0].MessageBoxFlg",StoryItem.Flg[0].MessageBoxFlg)
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
        *  5. メッセージボックス表示FLGがFALSEの場合
        * --------------------------------------------*/
       // 1. メッセージボックスの非表示処理を実行
       await MESSAGE_BOX_DIALOG.HideMessage();
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
