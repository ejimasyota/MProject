/* =========================================================
 * ミニゲーム登録処理
 * =========================================================*/
const MiniGameRegistry = {
  // 1. ストーリーIDが11 : [対戦ゲーム]
  11: () => new QuestGame(),
};

/* =========================================================
 * ミニゲーム呼び出し処理
 * =========================================================*/
async function RunMiniGame(StoryId, ResultObject) {
  /* --------------------------------------------
   *  1. 引数チェック
   * --------------------------------------------*/
  /* 1. ストーリーIDが存在しない場合 */
  if (typeof StoryId === "undefined" || StoryId === null) {
    // 1. 呼び出し元にNULLを返す(呼び出し下では次のストーリーIDにNULLが設定されて、例外で処理が終了される)
    return Promise.resolve(null);
  }
  /* 2. 勝敗結果の設定オブジェクトが存在しない場合 */
  if (!ResultObject || (typeof ResultObject.Win === "undefined" && typeof ResultObject.Lose === "undefined")) {
    // 1. 呼び出し元にNULLを返す
    return Promise.resolve(null);
  }

  /* --------------------------------------------
   *  2. ミニゲーム取得
   * --------------------------------------------*/
  // 1. ストーリーIDに紐づくミニゲーム取得
  const Factory = MiniGameRegistry[StoryId];
  // 2. 登録がない場合はNULLを返す
  if (!Factory) {
    return Promise.resolve(null);
  }

  /* --------------------------------------------
   *  3. インスタンス生成
   * --------------------------------------------*/
  /* 1. 定義 */
  // 1. ゲームのインスタンスを保持する
  let GameInstance;

  /* 2. ゲームのインスタンスを保持する */
  try {
    // 1. インスタンスを保持
    GameInstance = Factory();
  /* 3. 例外処理 */
  } catch (error) {
    // 1. デバッグログ
    console.error("ミニゲームインスタンス生成エラー : ", error);
    // 2. 呼び出し元にNULLを返す
    return Promise.resolve(null);
  }

  /* --------------------------------------------
   *  4. バリデーションチェック
   * --------------------------------------------*/
  /* 1. インスタンスや振る舞いが存在しない場合 */
  if (!GameInstance || typeof GameInstance.GameRun !== "function") {
    // 1. デバッグログ
    console.error("ミニゲームが run() を実装していません。");
    // 2. 呼び出し元にNULLを返す
    return Promise.resolve(null);
  }

  /* --------------------------------------------
   *  5. ミニゲームの実行・結果の取得
   * --------------------------------------------*/
  /* 1. 定義 */
  // 1. ミニゲームの結果を保持する
  let Result;

  /* 2. ミニゲーム実行処理 */
  try {
    // 1. 結果を取得
    Result = GameInstance.GameRun();
  /* 3. 例外処理 */
  } catch (error) {
    // 1. デバッグログ
    console.error("ミニゲーム実行中に例外:", error);
    // 2. 呼び出し元にNULLを返す
    return Promise.resolve(null);
  }

 /* --------------------------------------------
  *  6. ミニゲームの結果をPromiseにして返す
  * --------------------------------------------*/
  return Promise.resolve(Result)
    .then((boolResult) => {
      /* 1. 結果がTRUE(ミニゲーム勝利)の場合 */
      if (boolResult === true) {
        // 1. 勝利時のストーリーIDを返す
        return ResultObject.Win;
      } else {
        /* 2. 結果がFALSE(ミニゲーム敗北)の場合 */
        // 1. 敗北時のストーリーIDを返す
        return ResultObject.Lose;
      }
    })
    /* 3. 例外処理 */
    .catch((err) => {
      // 1. デバッグログ
      console.error("ミニゲーム実行でエラー : ", err);
      // 2. 呼び出し元にNULLを返す
      return null;
    });
}