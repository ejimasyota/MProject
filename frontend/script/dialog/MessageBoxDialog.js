/* =========================================================
 * MessageBoxDialog クラス
 * 参考URL
 * - https://qiita.com/taku-hu/items/4d5ab526d1a645b199de
 * - https://into-the-program.com/javascript-typewriter/
 * - https://b-risk.jp/blog/2021/01/anim-reference/
 * - https://qiita.com/nolanlover0527/items/bf740adfe6963b6206f7
 * =========================================================*/
class MessageBoxDialog { // メッセージボックスを扱うクラス定義の開始
 /* =========================================================
  * コンストラクタ
  * =========================================================*/
  constructor() {
    // 1. デフォルトのアイコン画像パス
    this.DefaultIconPath = "/asetts/img/icon/default_icon.png";
    // 2. 文字をタイプ表示するインターバル（ミリ秒）
    this.TypeIntervalMs = 28;
    // 3. コンテナの参照
    this.MessageContainer = null;
    // 4. メッセージボックスの参照
    this.MessageCard = null;
    // 5. アイコン画像のラッパー要素の参照
    this.IconWrapper = null;
    // 6. アイコン画像要素の参照
    this.Iconmage = null;
    // 7. キャラクター名表示エリアの参照
    this.CharacterNameTag = null;
    // 8. メッセージ表示エリアの参照
    this.TextArea = null;
    // 9. クリックマーカーの参照
    this.ClickMarker = null;
    // 10. タイプ中判定フラグ
    this.TypingCheckFlg = false;
    // 11. タイプ中断用コントローラの参照
    this.TypingAbortController = null;
  }

 /* =========================================================
  * メッセージボックスコンテナ存在判定処理
  * =========================================================*/
  CheckMessageBox() { 
    // 1. メッセージボックスコンテナが存在すればTRUE、無ければFALSEを返す
    return !!this.MessageContainer; 
  }

 /* =========================================================
  * メッセージボックス表示処理
  * 引数1
  * - MessageText: 表示するメッセージテキスト
  * 引数2
  * - CharacterName: 表示するキャラクター名
  * 引数3
  * - ImagePath: 表示するアイコン画像パス
  * =========================================================*/
  async ShowMessage(MessageText = "", CharacterName = "???", ImagePath = "") { 
    /* --------------------------------------------
     * 1. 事前処理
     * --------------------------------------------*/
    if (this.CheckMessageBox()) {
      /* 1. 既にメッセージボックスコンテナが存在する場合 */
      // 1. 表示内容をクリア
      this._ClearContent();
    } else { 
      /* 2. メッセージボックスコンテナが存在しない場合 */
      // 1. DOMを構築
      this._BuildDom();
      // 2. ボディにコンテナを追加
      document.body.appendChild(this.MessageContainer); 
      // 3. アニメーション開始のためのクラス付与を次フレームに延期
      requestAnimationFrame(() => {
        this.MessageCard.classList.add("ShowMessageBox");
      });
    }

    /* --------------------------------------------
     * 2. アイコンとキャラクター名設定
     * --------------------------------------------*/
    // 1. 表示するアイコン画像パスを決定(ImagePathが空であればデフォルトパスの画像を使用する)
    const IconImagePath = ImagePath && ImagePath.trim().length > 0 ? ImagePath : this.DefaultIconPath;
    // 2. 画像パスをソースに設定
    this.Iconmage.src = IconImagePath;
    // 3. キャラクター名を設定
    this.CharacterNameTag.textContent = CharacterName;
    // 4. 表示位置を中央に設定
    this.CharacterNameTag.style.textAlign = "center";

    /* --------------------------------------------
     * 3. メッセージタイプ表示処理
     * --------------------------------------------*/
    // 1. メッセージテキストをタイプ表示
    await this._TypeText(MessageText);
    // 2. タイプ表示後にクリック促しを表示
    this.ClickMarker.style.opacity = "1";
    // 3. 呼び出し元のために完了Promiseを返す(同期にしなくてもいいかも。設計は要見直し)
    return Promise.resolve(); 
  }

 /* =========================================================
  * メッセージボックス非表示処理
  * =========================================================*/
  async HideMessage() {
    /* --------------------------------------------
     * 1. バリデーションチェック
     * --------------------------------------------*/
    // 1. メッセージボックスコンテナが存在しない場合は処理終了
    if (!this.CheckMessageBox()){
        return; 
    }

    /* --------------------------------------------
     * 2. 事前処理
     * --------------------------------------------*/
    // 1. メッセージボックス表示クラスを削除
    this.MessageCard.classList.remove("ShowMessageBox"); 
    // 2. メッセージボックス非表示クラスを追加
    this.MessageCard.classList.add("HideMessageBox");

    /* --------------------------------------------
     * 3. アニメーション完了待ち処理
     * --------------------------------------------*/
    await new Promise((Resolve) => { 
      const Handler = (Event) => {
        /* 1. イベント対象がメッセージボックスの場合 */
        if (Event.target === this.MessageCard) {
          // 1. イベントハンドラを削除
          this.MessageCard.removeEventListener("transitionend", Handler);
          // 2. Promiseを解決
          Resolve();
        }
      };
      /* 2. イベントハンドラ登録 */
      this.MessageCard.addEventListener("transitionend", Handler);
    });

    /* --------------------------------------------
     * 4. DOM削除処理
     * --------------------------------------------*/
    if (this.MessageContainer && this.MessageContainer.parentNode) {
      // 1. ボディからメッセージボックスコンテナを削除
      this.MessageContainer.parentNode.removeChild(this.MessageContainer);
    }

    /* --------------------------------------------
     * 5. 各属性クリア処理
     * --------------------------------------------*/
    // 1. メッセージボックスコンテナの参照をクリア
    this.MessageContainer = null;
    // 2. メッセージボックスの参照をクリア
    this.MessageCard = null;
    // 3. アイコン画像のラッパー要素の参照をクリア    
    this.IconWrapper = null;
    // 4. アイコン画像要素の参照をクリア 
    this.Iconmage = null;
    // 5. キャラクター名表示エリアの参照をクリア
    this.CharacterNameTag = null;
    // 6. メッセージ表示エリアの参照をクリア 
    this.TextArea = null;
    // 7. クリックマーカーの参照をクリア
    this.ClickMarker = null;
    // 8. タイプ中判定フラグをクリア
    this.TypingCheckFlg = false; 

    /* --------------------------------------------
     * 6. タイプの中断用コントローラが存在する場合の処理
     * --------------------------------------------*/
    if (this.TypingAbortController) {
      // 1. タイプ中断を発信
      this.TypingAbortController.abort();
      // 2. コントローラ参照をクリア
      this.TypingAbortController = null;
    }

    /* --------------------------------------------
     * 7. 処理終了
     * --------------------------------------------*/
    return Promise.resolve();
  }

 /* =========================================================
  * DOM構築処理
  * =========================================================*/
  _BuildDom() { 
    /* --------------------------------------------
     * 1. メッセージボックスのコンテナ作成
     * --------------------------------------------*/
    // 1. DIV要素作成
    const MessageContainer = document.createElement("div");
    // 2. クラス設定
    MessageContainer.className = "MessageBoxContainer";

    /* --------------------------------------------
     * 2. メッセージボックス作成
     * --------------------------------------------*/
    // 1. DIV要素作成
    const MessageCard = document.createElement("div");
    // 2. クラス設定
    MessageCard.className = "MessageBoxCard";

    /* --------------------------------------------
     * 3. アイコン画像のラッパー作成
     * --------------------------------------------*/
    // 1. DIV要素作成
    const IconWrapper = document.createElement("div");
    // 2. クラス設定
    IconWrapper.className = "IconWrapper";

    /* --------------------------------------------
     * 4. アイコン画像作成
     * --------------------------------------------*/
    // 1. IMG要素作成
    const Iconmage = document.createElement("img");
    // 2. クラス設定
    Iconmage.className = "IconImage"; 
    // 3. ALT属性設定
    Iconmage.alt = "avatar";

    /* --------------------------------------------
     * 5. キャラ名表示エリア作成
     * --------------------------------------------*/
    // 1. DIV要素作成
    const CharacterNameTag = document.createElement("div");
    // 2. クラス設定
    CharacterNameTag.className = "CharacterNameArea";

    /* --------------------------------------------
     * 6. メッセージ表示エリア作成
     * --------------------------------------------*/
    // 1. DIV要素作成
    const TextArea = document.createElement("div");
    // 2. クラス設定
    TextArea.className = "NovelTextArea"; 

    /* --------------------------------------------
     * 7. クリックマーカー表示エリア作成
     * --------------------------------------------*/
    // 1. DIV要素作成
    const ClickMarker = document.createElement("div");
    // 2. クラス設定
    ClickMarker.className = "ClickMarker"; 


    /* --------------------------------------------
     * 8. メッセージボックスクリック時処理
     * --------------------------------------------*/
    MessageCard.addEventListener("click", () => {
      /* 1. テキストをタイプ表示中の場合 */
      if (this.TypingCheckFlg) { 
        // 1. タイプを中断して全文表示を行う
        this._AbortTypingAndShowFullText(); 
        // 2. 処理終了
        return; 
      }
      /* 2. タイプ完了後のクリックでクリックマーカーを削除 */
      ClickMarker.style.opacity = "0";
    });
    
    /* --------------------------------------------
     * 9. DOMの組み立て
     * --------------------------------------------*/
    // 1. アイコンラッパーにアイコンを格納
    IconWrapper.appendChild(Iconmage);
    // 2. メッセージボックスにアイコンを格納
    MessageCard.appendChild(IconWrapper);
    // 3. メッセージボックスにキャラクター名エリアを格納
    MessageCard.appendChild(CharacterNameTag);
    // 4. メッセージボックスにメッセージ表示エリアを格納
    MessageCard.appendChild(TextArea);
    // 5. メッセージボックスにクリックマーカーを格納
    MessageCard.appendChild(ClickMarker);
    // 6. コンテナにメッセージボックスを格納
    MessageContainer.appendChild(MessageCard);

    /* --------------------------------------------
     * 10. 属性値の設定
     * --------------------------------------------*/
    // 1. メッセージボックスコンテナの参照を保存
    this.MessageContainer = MessageContainer; 
    // 2. メッセージボックスの参照を保存
    this.MessageCard = MessageCard;
    // 3. アイコン画像のラッパー要素の参照を保存
    this.IconWrapper = IconWrapper;
    // 4. アイコン画像要素の参照を保存
    this.Iconmage = Iconmage;
    // 5. キャラクター名表示エリアの参照を保存
    this.CharacterNameTag = CharacterNameTag;
    // 6. メッセージ表示エリアの参照を保存
    this.TextArea = TextArea;
    // 7. クリックマーカーの参照を保存
    this.ClickMarker = ClickMarker;
  }

 /* =========================================================
  * メッセージタイプ表示処理
  * =========================================================*/
  _TypeText(MessageText) {
    /* --------------------------------------------
     * 1. タイプ処理中の場合
     * --------------------------------------------*/
    if (this.TypingCheckFlg) {
      // 1. 既存のタイプを中断して全文を表示する
      this._AbortTypingAndShowFullText(); 
    }

    /* --------------------------------------------
     * 2. 事前処理
     * --------------------------------------------*/
    // 1. メッセージボックスの内容をクリア
    this._ClearContent(); 
    // 2. タイプの中断用コントローラを生成
    this.TypingAbortController = new AbortController();
    // 3. 中断信号を取得
    const AbortSignal = this.TypingAbortController.signal;
    // 4. タイプ中フラグを立てる
    this.TypingCheckFlg = true;
    // 5. 文字列を文字配列に分解
    const Chars = Array.from(MessageText);

    /* --------------------------------------------
     * 3. タイプ表示処理
     * --------------------------------------------*/
    return new Promise((Resolve) => { 
      /* 1. 定義部 */
      // 1. 現在のタイプ文字インデックス
      let Index = 0;

      /* 2. 処理部 */
      const Step = async () => {
        /* 中断が要求されている場合 */
        if (AbortSignal.aborted) {
          // 1. 残りの文字をすべて追加
          for (let i = Index; i < Chars.length; i++) {
            this._AppendCharToTextArea(Chars[i]);
          }
          // 2. タイプ中フラグを下ろす
          this.TypingCheckFlg = false; 
          // 3. Promiseを解決
          Resolve();
          // 4. 処理終了
          return;
        }
        /* 全ての文字を表示し終えた場合 */
        if (Index >= Chars.length) {
          // 1. タイプフラグを下ろす
          this.TypingCheckFlg = false;
          // 2. Promiseを解決
          Resolve();
          // 3. 処理終了 
          return;
        }
        /* 現在の文字をテキストエリアに追加 */
        this._AppendCharToTextArea(Chars[Index]);

        /* インデックスをインクリメント */
        Index += 1; 

        /* 指定間隔後に次の文字追加をスケジュール */
        setTimeout(Step, this.TypeIntervalMs);
      };
      /* 3. タイプ表示開始 */
      Step();
    });
  }

 /* =========================================================
  * 単一の文字をテキストエリアに追加するヘルパー関数
  * =========================================================*/
  _AppendCharToTextArea(Char) {
    /* 1. 改行文字だった場合 */
    if (Char === "\n") { 
      // 1. br要素を作成
      const Br = document.createElement("br"); 
      // 2. テキストエリアにbrを追加して改行を表現
      this.TextArea.appendChild(Br); 
      // 3. 処理終了
      return;
    }
    /* 2. 通常の文字処理 */
    // 1. テキストノードとして作成
    const TextNode = document.createTextNode(Char);
    // 2. テキストエリアにテキストノードを追加
    this.TextArea.appendChild(TextNode); 
  }

 /* =========================================================
  * タイプ表示を中断して残りを一気に表示する処理
  * =========================================================*/
  _AbortTypingAndShowFullText() {
    // 1. 中断コントローラが無ければ処理終了
    if (!this.TypingAbortController) {
      return; 
    }
    // 2. 中断を発信し、_TypeText内の処理を即時完了
    this.TypingAbortController.abort();
    // 3. コントローラ参照をクリア
    this.TypingAbortController = null;
  }

 /* =========================================================
  * テキストエリア等の表示内容を初期化する処理
  * =========================================================*/
  _ClearContent() { 
    // 1. テキストエリアが存在しなければ処理終了
    if (!this.TextArea){
      return;
    }
    // 2. テキストエリア内の全子要素を削除
    while (this.TextArea.firstChild) {
      this.TextArea.removeChild(this.TextArea.firstChild);
    }
    // 3. クリックマーカーが存在すればクリックマーカーを非表示にする
    if (this.ClickMarker) { 
      this.ClickMarker.style.opacity = "0";
    }
  }
}
/* =========================================================
 * グローバルに設定
 * =========================================================*/
window.MessageBoxDialog = MessageBoxDialog;
