/* =========================================================
 * DialogInfo クラス
 * =========================================================*/
class DialogInfo {
  /* --------------------------------------------
   *  ダイアログの表示処理
   * --------------------------------------------*/
  ShowDialog(message = "") {
    // 1.ダイアログの親要素の作成
    const dialogContainer = document.createElement("div");
    // 2.ダイアログの親要素のクラス名を設定
    dialogContainer.className = "ConfirmContainer";
    // 3.ダイアログ表示テキストの作成
    const dialogMessage = document.createElement("p");
    // 4.ダイアログ表示テキストにメッセージを設定
    dialogMessage.textContent = message;
    // 5.表示テキストをセット
    dialogContainer.appendChild(dialogMessage);
    // 6.閉じるボタンの要素を作成
    const closeButton = document.createElement("button");
    // 7.閉じるボタンのテキストを設定
    closeButton.textContent = "閉じる";
    // 8.閉じるボタンのクラス名を設定
    closeButton.classList.add("ButtonInfo", "BlueButton");
    // 9.閉じるボタンをダイアログに追加
    dialogContainer.appendChild(closeButton);
    // 10.ダイアログ本体をボディに追加
    document.body.appendChild(dialogContainer);

    /* 閉じるボタンの押下時イベントを定義 */
    closeButton.onclick = () => {
      // 1.ダイアログを閉じる
      document.body.removeChild(dialogContainer);
    };
  }

  /* --------------------------------------------
   *  コンファームの表示処理
   * --------------------------------------------*/
  ShowConfirmDialog(message = "") {
    return new Promise((resolve) => {
      // 1.ダイアログの親要素の作成
      const dialogContainer = document.createElement("div");
      // 2.ダイアログの親要素のクラス名を設定
      dialogContainer.className = "ConfirmContainer";
      // 3.ダイアログ表示テキストの作成
      const dialogMessage = document.createElement("p");
      // 4.ダイアログ表示テキストにメッセージを設定
      dialogMessage.textContent = message;
      // 5.表示テキストをセット
      dialogContainer.appendChild(dialogMessage);
      // 6.[はい]ボタンの要素を作成
      const yesButton = document.createElement("button");
      // 7.[はい]ボタンのテキストを設定
      yesButton.textContent = "はい";
      // 8.[はい]ボタンのクラス名を設定
      yesButton.classList.add("ButtonInfo", "RedButton");
      // 9.[いいえ]ボタンの要素を作成
      const noButton = document.createElement("button");
      // 10.[いいえ]ボタンのテキストを設定
      noButton.textContent = "いいえ";
      // 11.[いいえ]ボタンのクラス名を設定
      noButton.classList.add("ButtonInfo", "BlueButton");
      // 12.ボタン要素の親クラスを作成
      const ButtonForm = document.createElement("div");
      // 13.ボタン親要素のクラス名を設定
      ButtonForm.className = "ConfirmButtonForm";
      // 14.[はい]ボタンを親要素に設定
      ButtonForm.appendChild(yesButton);
      // 15.[いいえ]ボタンを親要素に設定
      ButtonForm.appendChild(noButton);
      // 16.ボタン要素をダイアログに設定
      dialogContainer.appendChild(ButtonForm);
      // 17.ダイアログ本体をボディに追加
      document.body.appendChild(dialogContainer);

      /* [はい]ボタンの押下時イベントを定義 */
      yesButton.onclick = () => {
        // 1.ダイアログを閉じる
        document.body.removeChild(dialogContainer);
        // 2.結果を返す
        resolve(true);
      };

      /* [いいえ]ボタンの押下時イベントを定義 */
      noButton.onclick = () => {
        // 1.ダイアログを閉じる
        document.body.removeChild(dialogContainer);
        // 2.結果を返す
        resolve(false);
      };
    });
  }
}

/* クラスの公開 */
// 1.ダイアログクラス
window.DialogInfo = DialogInfo;
