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
// 8. ボイスのボリューム
let VOICE_VOLUME = 1.0;
// 9. SEのボリューム
let SE_VOLUME = 1.0;
// 10.BGMのボリューム
let BGM_VOLUME = 1.0;

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
    // 3. 画面クリックイベント設定
    DisplayClickEvent();
});

/* =========================================================
 * 画面クリックイベント
 * =========================================================*/
function DisplayClickEvent(){
  /* --------------------------------------------
   *  1. 事前処理
   * --------------------------------------------*/
  // 1. ゲームコンテナ取得
  const GameContainer = document.querySelector(".GameContainer");

  /* --------------------------------------------
   *  2. バリデーションチェック
   * --------------------------------------------*/
  /* 1. ゲームコンテナが存在しない場合 */
  if (!GameContainer){
    // 1. 処理終了 
    return;
  }

  /* --------------------------------------------
   *  3. クリックイベント定義
   * --------------------------------------------*/
  GameContainer.addEventListener("click", () => {
    /* 1. 事前処理 */
    // 1. 選択肢のコンテナ取得
    const SelectContainer = document.getElementById("SelectContainer");
    // 2. 選択肢表示中は処理終了(そもそもバックドロップがあるのでクリックできないが念のため)
    if (SelectContainer && SelectContainer.childElementCount > 0) {
      return;
    }

    /* 2. 次のストーリーIDがある場合 */
    if (typeof NEXT_STORY_ID !== "undefined" && NEXT_STORY_ID) {
      // 1. 画面表示を設定
      GameDisplayInfo(NEXT_STORY_ID);
      // 2. 保持している次のシーンIDを初期化
      NEXT_STORY_ID = null;
    }
  });
}

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
            *  5. 取得内容が存在を判定
            * --------------------------------------------*/
            // 1. セーブデータを保持するSaveInfoを取得
            const SaveInfo = Result.items && Result.items.SaveInfo ? Result.items.SaveInfo : null;

            // 2. SaveInfoの有無を判定
            const SaveInfoCheckFlg = SaveInfo
              ? (Array.isArray(SaveInfo) ? SaveInfo.length > 0 : Object.keys(SaveInfo).length > 0)
              : false;

           /* --------------------------------------------
            *  6. 取得内容が存在する場合
            * --------------------------------------------*/
           if(SaveInfoCheckFlg){
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
                *  7. 取得内容が存在しない場合
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
    *  7. 背景画像パスが指定されている場合
    * --------------------------------------------*/
    /* 1. 定義 */
    // 1. ゲーム画面のコンテナの取得
    const GameContainer = document.querySelector(".GameContainer");

    /* 2. ゲーム画面のコンテナの取得が行えない場合 */
    if (!GameContainer) {
      // 1. 処理終了
      return;
    }
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

    /* --------------------------------------------
    *  8. キャラ画像のいずれかが存在する場合
    * --------------------------------------------*/
   const ImagePath = StoryItem?.CharaImgPath?.[0];
   if (
      ImagePath &&
      ["Center", "Left", "Right"].some(pos =>
        typeof ImagePath[pos] === "string" && ImagePath[pos].trim() !== ""
      )
    ) {
      ShowCharaImages(ImagePath, StoryItem);
    } else {
     /* --------------------------------------------
      *  9. キャラ画像のいずれかも存在しない場合
      * --------------------------------------------*/
      HideCharaImages();
    }

   /* --------------------------------------------
    *  10. メッセージボックス表示FLGがTRUEの場合
    * --------------------------------------------*/
    if(StoryItem.Flg[0].MessageBoxFlg){
      await MESSAGE_BOX_DIALOG.ShowMessage(
        // 1. テキスト設定
        StoryText,
        // 2. キャラ名設定
        CharaName,
        // 3. 顔アイコンの表示
        StoryItem.FaceImgPath
      );
    }else{
       /* --------------------------------------------
        *  11. メッセージボックス表示FLGがFALSEの場合
        * --------------------------------------------*/
       // 1. メッセージボックスの非表示処理を実行
       await MESSAGE_BOX_DIALOG.HideMessage();
    }
    /* --------------------------------------------
     *  10. バックログ内容の作成
     * --------------------------------------------*/
    // 1. 選択肢表示時のストーリーテキストとキャラ名は除外する
    if(!StoryItem.Flg[0].NarratorFlg){
      BACKLOG_INFO.push({
          // 2. ストーリーテキストをセット
          StoryText :  StoryText,
          // 3. キャラ名
          Narrator : CharaName,
      })
    }

    /* --------------------------------------------
     *  12. 選択肢表示を行わない場合
     * --------------------------------------------*/
    if(StoryItem.Select.length === 0 && StoryItem.Next){
        // 1. 次のシーンIDを保持
        NEXT_STORY_ID = StoryItem.Next;
    }else{
      /* --------------------------------------------
       *  13. 選択肢表示を行う場合
       * --------------------------------------------*/
       // 1. 選択肢の表示
       DisplaySelectButton(StoryItem.Select);
    }

    /* --------------------------------------------
    *  14. ボイス再生処理
    * --------------------------------------------*/
    if (StoryItem.Voice && StoryItem.Voice !== "") {
      LoadVoice(StoryItem.Voice);
    }

    /* --------------------------------------------
    *  15. SE再生処理
    * --------------------------------------------*/
    if (StoryItem.SePath && StoryItem.SePath !== "") {
      LoadSe(StoryItem.SePath);
    }

    /* --------------------------------------------
    *  16. BGM再生処理
    * --------------------------------------------*/
    if (StoryItem.BgmPath && StoryItem.BgmPath !== "") {
      PlayBgm(StoryItem.BgmPath);
    }
}

/* =========================================================
 * キャラクター画像表示処理
 * =========================================================*/
function ShowCharaImages(ImgPath, StoryItem) {
 /* --------------------------------------------
  *  1. 事前処理
  * --------------------------------------------*/
  // 1. ゲームコンテナ取得
  const GameContainer = document.querySelector(".GameContainer");
  // 2. キャラレイヤー取得
  let CharaLayer = document.getElementById("CharaLayer");
  // 3. 表示位置
  const Positions = ["Center", "Left", "Right"];

 /* --------------------------------------------
  *  2. バリデーションチェック
  * --------------------------------------------*/
  /* 1. ゲームコンテナが存在しない場合 */
  if (!GameContainer){
    // 1. 処理終了
    return;
  }
  /* 2. キャラレイヤーが存在しない場合 */
  if (!CharaLayer) {
    // 1. DIV要素作成
    CharaLayer = document.createElement("div");
    // 2. ID設定
    CharaLayer.id = "CharaLayer";
    // 3. クラス設定
    CharaLayer.className = "CharaLayer";
    // 4. ゲームコンテナの直下に追加
    GameContainer.appendChild(CharaLayer);
  }
  /* 3. 画像パスオブジェクトが存在しない場合 */
  if (!ImgPath){
    // 1. 処理終了
    return;
  }

 /* --------------------------------------------
  *  3. 位置ごとの表示処理
  * --------------------------------------------*/
  Positions.forEach(Position => {
    /* 1. 定義 */
    // 1. 位置ごとの画像パスを取得
    const ImagePath = ImgPath[Position] ?? "";

    /* 2. 各アニメーションFLG定義(画像表示アニメーションは今後も追加していく想定) */
    // 1. フェードインFLG
    const FadeInFlg = StoryItem?.Effect?.[0]?.FadeIn?.[0] ?? {};
    // 2. フェードアウトFLG
    const FadeOutFlg = StoryItem?.Effect?.[0]?.FadeOut?.[0] ?? {};

    /* 3. 画像パスが存在する場合 */
    if (ImagePath && typeof ImagePath === "string" && ImagePath.trim() !== "") {
      /* 事前処理 */
      // 1. 同位置のimg要素を取得
      const Existing = CharaLayer.querySelector(`img.CharaImage.Position-${Position}`);

      /* 同位置に存在する画像があれば削除 */
      if (Existing) {
        // 1. フェードインクラスの除去
        Existing.classList.remove("FadeIn");
        // 2. フェードアウトクラスを設定
        if (FadeOutFlg[Position]) {
          Existing.classList.add("FadeOut");
        } 
        // 3. 要素の除去
        setTimeout(() => {
          try { Existing.remove(); } catch (e) {}
        }, 300);
      }

      /* 画像の作成処理 */
      // 1. IMG要素作成
      const Img = document.createElement("img");
      // 2. ALT属性設定
      Img.alt = Position + " Character";
      // 3. クラス設定
      Img.classList.add("CharaImage", `Position-${Position}`);
      // 4. パスを設定
      Img.src = ImagePath;
      // 5. 画像の読み込み準備
      Img.decoding = "async";
      // 6. 画像読込
      Img.loading = "lazy";

      /* アニメーション設定 */
      Img.addEventListener("load", () => {
        /* フレームでの設定 */
        requestAnimationFrame(() => {
          /* 事前処理 */
          // 1. フェードアウトを外す
          Img.classList.remove("FadeOut");

          // 2. フェードアウトFLGがFALSEの場合はクラスを除去
          if(!FadeOutFlg[Position]){
            Img.classList.remove("FadeOut");
          }
          
          /* アニメーション設定 */
          // 1. フェードイン
          if (FadeInFlg[Position]) {
            Img.classList.add("FadeIn");
          }
        });
      });

      /* 例外発生時に画像を削除 */
      Img.addEventListener('error', () => { try { Img.remove(); } catch(e){} });

      /* 画像の追加 */
      CharaLayer.appendChild(Img);
    }
  });
}

/* =========================================================
 * キャラクター画像非表示処理
 * =========================================================*/
function HideCharaImages(Positions = null) {
  /* --------------------------------------------
   *  1. 事前処理
   * --------------------------------------------*/
  // 1. キャラクターレイヤーを取得
  const CharaLayer = document.getElementById("CharaLayer");
  // 2. 非表示対象のノードリストを保持する
  let TargetNodeList;

  /* --------------------------------------------
   *  2. バリデーションチェック
   * --------------------------------------------*/
  // 1. キャラクターレイヤーが存在しない場合は処理終了
  if (!CharaLayer) return;

  /* --------------------------------------------
   *  3. 非表示対象の画像を取得
   * --------------------------------------------*/
  if (!Positions) {
    /* 1. Positionsが指定されていない場合 */
    // 1. すべての画像を指定
    TargetNodeList = Array.from(CharaLayer.querySelectorAll("img.CharaImage"));
  } else {
    /* 2. Positionsが指定されている場合 */
    // 1. ノードリストを初期化
    TargetNodeList = [];
    // 2. 初期化処理を実行
    Positions.forEach(Position => {
      // 3. 指定位置のimg要素を取得
      const Element = CharaLayer.querySelector(`img.CharaImage.Position-${Position}`);
      // 4. 存在する場合のみリストに追加
      if (Element) {
        TargetNodeList.push(Element);
      }
    });
  }

  /* --------------------------------------------
   *  4. 非表示アニメーション処理
   * --------------------------------------------*/
  TargetNodeList.forEach((Element) => {
    /* 1. 事前処理 */
    // 1. 既に非表示処理中の要素はスキップ
    if (Element.classList.contains("FadeOut")){
       return;
    }
    // 2. フェードインクラス除去
    Element.classList.remove("FadeIn");
    // 3. クラス設定
    Element.classList.add("FadeOut");

    /* 2. DOMからの削除処理 */
    setTimeout(() => {
      // 1. エラー発生時(まぁ関係なく削除)
      try { Element.remove(); } catch (e) {}
      // 2. キャラレイヤーの削除
      if (CharaLayer && CharaLayer.children.length === 0) {
        try { CharaLayer.remove(); } catch (e) {}
      }
    }, 300); 
  });
}

/* =========================================================
 * BGM再生処理
 * =========================================================*/
function PlayBgm(LoadPath) {
    /* --------------------------------------------
     *  1. 既にBGMが再生中の場合は停止・破棄
     * --------------------------------------------*/
    if (window.BgmAudio) {
        // 1. 再生中の BGM を停止
        try { window.BgmAudio.pause(); } catch (e) {}

        // 2. 音源パスをクリア（解放処理）
        try { window.BgmAudio.src = ""; } catch (e) {}

        // 3. オブジェクトの破棄
        window.BgmAudio = null;
    }

    /* --------------------------------------------
     *  2. BGM 用Audio オブジェクト作成
     * --------------------------------------------*/
    // 1. 新しいAudioオブジェクトを生成
    window.BgmAudio = new Audio();

    // 2. 音声データを事前読み込み
    window.BgmAudio.preload = "auto";

    // 3. 読み込むBGMのパスを設定
    window.BgmAudio.src = LoadPath;

    // 4. 音量を設定
    window.BgmAudio.volume = BGM_VOLUME;

    // 5. BGM は自動でループ再生
    window.BgmAudio.loop = true;

    /* --------------------------------------------
     *  3. 各種イベント処理
     * --------------------------------------------*/
    // 1. BGMファイルが読み込めない・再生不可の場合
    window.BgmAudio.addEventListener("error", (ev) => {
        console.warn("BGM 再生エラー:", ev);
    });

    // 2. ループ再生のためendedは基本使わないが、念のための停止時の後処理
    window.BgmAudio.addEventListener("ended", () => {
        try { window.BgmAudio.src = ""; } catch (e) {}
        window.BgmAudio = null;
    });

    /* --------------------------------------------
     *  4. 再生開始
     * --------------------------------------------*/
    window.BgmAudio.play().catch(err => {
        console.warn("BGM 自動再生に失敗:", err);
    });
}



/* =========================================================
 * ボイス再生処理
 * =========================================================*/
function LoadVoice(LoadPath) {
    /* --------------------------------------------
     *  1. 既にボイスが再生されている場合は破棄
     * --------------------------------------------*/
    if (window.VoiceAudio) {
        // 1. 再生中のボイスを停止
        try { window.VoiceAudio.pause(); } catch (e) {}

        // 2. 音声ファイルの読み込み元をクリア
        try { window.VoiceAudio.src = ""; } catch (e) {}

        // 3. Audio オブジェクトそのものを破棄
        window.VoiceAudio = null;
    }

    /* --------------------------------------------
     *  2. 新しいボイスを再生する準備
     * --------------------------------------------*/
    // 1. Audioオブジェクトを生成
    window.VoiceAudio = new Audio();

    // 2. ブラウザ側で事前読み込みを許可
    window.VoiceAudio.preload = "auto";

    // 3. 再生する音声ファイルのパスを設定
    window.VoiceAudio.src = LoadPath;

    // 4. 音量を設定
    window.VoiceAudio.volume = VOICE_VOLUME;

    // 5. ループ再生は行わない
    window.VoiceAudio.loop = false;

    /* --------------------------------------------
     *  3. 各種イベント設定
     * --------------------------------------------*/
    // 1. 読み込みや再生に失敗した場合のエラー処理
    window.VoiceAudio.addEventListener("error", (e) => {
        console.warn("Voice 再生エラー : ", e);
    });

    // 2. 再生が終了したタイミングでAudioを破棄
    window.VoiceAudio.addEventListener("ended", () => {
        /* 1. 音声データを明示的にクリア */
        try { window.VoiceAudio.src = ""; } catch (e) {}
        /* 2. Audioオブジェクトの破棄 */
        window.VoiceAudio = null;
    });

    /* --------------------------------------------
     *  4. 再生開始処理
     * --------------------------------------------*/
    window.VoiceAudio.play().catch(e => {
        console.warn("再生に失敗:", e);
    });
}


/* =========================================================
 * SE再生処理
 * =========================================================*/
function LoadSe(LoadPath) {
    /* --------------------------------------------
     *  1. SEのパスが未指定の場合
     * --------------------------------------------*/
    if (!LoadPath){
      // 1. 処理終了
      return;
    }

   /* --------------------------------------------
    *  2. 効果音用Audioオブジェクトの生成
    * --------------------------------------------*/
    // 1. 一時的に再生するAudioを生成
    const SeAudio = new Audio();

    // 2. ブラウザ側に音声の事前読み込みを指示
    SeAudio.preload = "auto";

    // 3. 読み込むSEファイルのパスを設定
    SeAudio.src = LoadPath;

    // 4. 音量を設定
    SeAudio.volume = SE_VOLUME;

    // 5. ループ再生は行わない
    SeAudio.loop = false;

    /* --------------------------------------------
     *  3. 各種イベント処理
     * --------------------------------------------*/
    // 1. SEが読み込めない・再生できない場合
    SeAudio.addEventListener("error", (ev) => {
        console.warn("SE 再生エラー:", ev);
    });

    // 2. 再生終了後のクリア処理
    SeAudio.addEventListener("ended", () => {
        try { SeAudio.src = ""; } catch (e) {}
    });

    /* --------------------------------------------
     *  4. 効果音の再生開始
     * --------------------------------------------*/
    SeAudio.play().catch(err => {
        console.warn("SE 自動再生に失敗:", err);
    });
}

/* =========================================================
 * 選択肢ボタン表示処理
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
                   SelectBackdrop.remove();
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
function ShowBacklogDialog(Event) {
 /* --------------------------------------------
  *  1. 画面クリックイベントを停止
  * --------------------------------------------*/
  Event.stopPropagation();

 /* --------------------------------------------
  *  2. バックログコンテナを作成
  * --------------------------------------------*/
  // 1. DIV要素の作成
  const BacklogContainer = document.createElement("div");
  // 2. クラス設定
  BacklogContainer.className = "ConfirmContainer";

 /* --------------------------------------------
  *  3. ダイアログのカード作成
  * --------------------------------------------*/
  // 1. DIV要素の作成
  const BacklogDialog = document.createElement("div");
  // 2. クラス設定
  BacklogDialog.className = "DialogBox";

 /* --------------------------------------------
  *  4. バックログ内容の作成
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
  *  5. 閉じるボタンの作成
  * --------------------------------------------*/
  // 1. ボタン要素の作成
  const CloseButton = document.createElement("button");
  // 2. クラス設定
  CloseButton.classList.add("ButtonInfo", "PinkButton");
  // 3. ラベル設定
  CloseButton.textContent = "閉じる";

 /* --------------------------------------------
  *  6. 閉じるボタンのイベント定義
  * --------------------------------------------*/
  CloseButton.addEventListener("click", () => {
    // 1. ダイアログを削除
    if (BacklogContainer.parentNode) {
      BacklogContainer.parentNode.removeChild(BacklogContainer);
    }
  });

 /* --------------------------------------------
  *  7. 閉じるボタンをバックログに格納
  * --------------------------------------------*/
  BacklogDialog.appendChild(CloseButton);

 /* --------------------------------------------
  *  8. DOM構築
  * --------------------------------------------*/
  // 1. バックログコンテナにバックログ格納
  BacklogContainer.appendChild(BacklogDialog);
  // 2. ボディにバックログコンテナを格納
  document.body.appendChild(BacklogContainer);
}

/* =========================================================
 * セーブボタン押下時処理
 * =========================================================*/
async function SaveInfo(Event){
  try {
    /* --------------------------------------------
     *  1. 画面クリックイベントを停止
     * --------------------------------------------*/
    Event.stopPropagation();

    /* ------------------------------
     * 2. スピナー表示
     * ------------------------------*/
    ShowSpinner("セーブしています。ブラウザを閉じないでください。");

    /* ------------------------------
     * 3. APIに対してリクエストを送信
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
     * 4. 処理結果の取得
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
function HomeRedirect(Event) {
 /* --------------------------------------------
  *  1. 画面クリックイベントを停止
  * --------------------------------------------*/
  Event.stopPropagation();
  MESSAGE_DIALOG.ShowConfirmDialog("セーブスロット選択画面へ戻りますか？").then((Result) => {
    if(Result){
       /* --------------------------------------------
        *  2. リファラーを取得
        * --------------------------------------------*/
        const Referrer = document.referrer;

        /* --------------------------------------------
        *  3. 遷移先判定
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
