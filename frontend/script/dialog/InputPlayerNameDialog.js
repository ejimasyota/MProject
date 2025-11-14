/* =========================================================
 * NameFormDialog クラス
 * =========================================================*/
class NameFormDialog {
  ShowNameDialog(Title = "プレイヤー名を入力してください") {
    return new Promise((Resolve) => {
      /* --------------------------------------------
       * 1. バックドロップ作成
       * --------------------------------------------*/
      // 1. DIV要素作成
      const DialogContainer = document.createElement("div");
      // 2. クラス設定
      DialogContainer.className = "ConfirmContainer";

      /* --------------------------------------------
       * 2. ダイアログカード作成
       * --------------------------------------------*/
      // 1. DIV要素作成
      const DialogBox = document.createElement("div");
      // 2. クラス設定
      DialogBox.className = "DialogBox";
      // 3. 最小幅を設定
      DialogBox.style.minWidth = "300px"

      /* --------------------------------------------
       * 3. タイトル作成
       * --------------------------------------------*/
      // 1. P要素作成
      const TitleElement = document.createElement("p");
      // 2. タイトルテキストを設定
      TitleElement.textContent = Title;

      /* --------------------------------------------
       * 4. 入力フォームとボタンのラッパー要素作成
       * --------------------------------------------*/
      // 1. DIV要素作成
      const InputButtonForm = document.createElement("div");
      // 2. クラス設定
      InputButtonForm.className = "ConfirmInputButtonForm";

      /* --------------------------------------------
       * 5. 入力フォーム作成
       * --------------------------------------------*/
      // 1. フォーム要素作成
      const PlayerNameInput = document.createElement("input");
      // 2. 入力タイプ設定
      PlayerNameInput.type = "text";
      // 3. クラス設定
      PlayerNameInput.className = "TextInputForm";
      // 4. プレースホルダを設定
      PlayerNameInput.placeholder = "プレイヤー名（最大10文字）";
      // 5. 最大桁数を設定
      PlayerNameInput.maxLength = 10;
      // 6. フォーカス設定
      PlayerNameInput.focus();

      /* --------------------------------------------
       * 6. ボタンのラッパー要素作成
       * --------------------------------------------*/
      // 1. DIV要素作成
      const ButtonWrapper = document.createElement("div");
      // 2. クラス名設定
      ButtonWrapper.className = "ConfirmButtonWrapper";

      /* --------------------------------------------
       * 7. ボタン作成
       * --------------------------------------------*/
      // 1. ボタン要素作成
      const ResultButton = document.createElement("button");
      // 2. ラベル設定
      ResultButton.textContent = "決定";
      // 3. クラス設定
      ResultButton.classList.add("ButtonInfo", "PinkButton");
      // 4. 非活性に設定
      ResultButton.disabled = true;

      /* --------------------------------------------
       * 8. エラーメッセージ作成
       * --------------------------------------------*/
      // 1. ボタン要素作成
      const ErrorMessage = document.createElement("p");
      // 2. クラス設定
      ErrorMessage.className = "ErrorMessage"
      // 3. 表示位置設定
      ErrorMessage.style.textAlign = "center"
      // 4. 空文字を設定
      ErrorMessage.textContent = "";

      /* --------------------------------------------
       * 9. DOMの組み立て
       * --------------------------------------------*/
      // 1. ボタンラッパーにボタンを格納
      ButtonWrapper.appendChild(ResultButton);
      // 2. 入力フォームコンテナに入力フォームを格納
      InputButtonForm.appendChild(PlayerNameInput);
      // 3. 入力フォームコンテナにボタン要素を格納
      InputButtonForm.appendChild(ButtonWrapper);
      // 4. ダイアログにタイトルテキストを格納
      DialogBox.appendChild(TitleElement);
      // 5. ダイアログに入力フォームコンテナを格納
      DialogBox.appendChild(InputButtonForm);
      // 6. ダイアログにエラーメッセージを格納
      DialogBox.appendChild(ErrorMessage);
      // 7. ダイアログコンテナにダイアログを格納(コンテナというよりバックドロップ)
      DialogContainer.appendChild(DialogBox);
      // 8. ダイアログコンテナをボディに格納
      document.body.appendChild(DialogContainer);

      /* --------------------------------------------
       * 10. 入力状況によるボタンの状態制御処理
       * --------------------------------------------*/
      PlayerNameInput.addEventListener("input", () => {
        /* 1. 名前の入力値が空でない場合 */
        if (PlayerNameInput.value.trim().length > 0) {
          // 1. ボタンを活性化
          ResultButton.disabled = false;
        } else {
          /* 2. 名前の入力値が空の場合 */
          // 1. ボタンを非活性化
          ResultButton.disabled = true;
        }
      });

      /* --------------------------------------------
       * 11. 決定ボタン押下時処理
       * --------------------------------------------*/
      ResultButton.addEventListener("click", async () => {
        /* 1. 事前処理 */
        // 1. ボタンを非活性化(多重押下防止のため)
        ResultButton.disabled = true;
        // 2. ローカルストレージからプレイヤーIDを取得(セーブスロット選択画面にて発行しているため存在しない場合はありえない)
        const PlayerId = localStorage.getItem("M_PlayerId");
        // 3. エラーメッセージを初期化
        ErrorMessage.textContent = "";

        /* 2. 通信処理 */
        try {
          // 1. スピナー表示
          ShowSpinner();
          // 2. 通信処理
          const Response = await fetch(
            "../../backend/API/Insert/InsertPlayerNameController.php", 
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
                body: JSON.stringify({
                  // 3. プレイヤーID
                  PlayerName: PlayerNameInput.value.trim(),
                  // 4. セーブスロットID
                  PlayerId: PlayerId
                }),
          });

          /* 3. レスポンス処理 */
          // 1. レスポンスをJSONにパース
          const Result = await Response.json();

          /* 4. 通信成功時 */
          if (Result && Result.success) {
            // 1. ダイアログをDOMから削除
            document.body.removeChild(DialogContainer);
            // 2. セッションにプレイヤー名を保持
            sessionStorage.setItem("PlayerName",PlayerNameInput.value.trim())
            // 3. Promiseを成功で解決
            Resolve(Result);
            // 4. 処理終了
            return;
          } else {
            /* 5. 通信失敗時 */
            // 1. ボタンの活性を入力状態に応じて復帰
            ResultButton.disabled = PlayerNameInput.value.trim().length === 0;
            // 2. 処理終了
            return;
          }
        /* 6. 例外処理 */
        } catch (Error) {
          // 1. エラーメッセージ設定
          ErrorMessage.textContent = "通信エラーが発生しました。"
          // 2. ボタンの活性を入力状態に応じて復帰
          ResultButton.disabled = PlayerNameInput.value.trim().length === 0;
          // 3. 処理終了
          return;
        /* 7. 終了時処理 */
        } finally{
          // 1. スピナーを削除
          HiddenSpinner();
        }
      });
    });
  }
}

/* --------------------------------------------
 * 12. グローバルに設定
 * --------------------------------------------*/
window.NameFormDialog = NameFormDialog;