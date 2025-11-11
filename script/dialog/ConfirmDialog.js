/* =========================================================
 * DialogInfo クラス
 * =========================================================*/
class DialogInfo {
  /* --------------------------------------------
   *  ダイアログの表示処理
   * --------------------------------------------*/
  ShowDialog(message = "") {
    // 1.ダイアログの親要素の作成（バックドロップ）
    const dialogContainer = document.createElement("div");
    // 2.ダイアログの親要素のクラス名を設定
    dialogContainer.className = "ConfirmContainer";
    // 3.ダイアログ本体カードの作成
    const dialogBox = document.createElement("div");
    // 4.カードのクラス名を設定
    dialogBox.className = "DialogBox";
    // 5.ダイアログ表示テキストの作成
    const dialogMessage = document.createElement("p");
    // 6.ダイアログ表示テキストにメッセージを設定
    dialogMessage.textContent = message;
    // 7.表示テキストをカードにセット
    dialogBox.appendChild(dialogMessage);
    // 8.閉じるボタンの要素を作成
    const closeButton = document.createElement("button");
    // 9.閉じるボタンのテキストを設定
    closeButton.textContent = "閉じる";
    // 10.閉じるボタンのクラス名を設定
    closeButton.classList.add("ButtonInfo", "BlueButton");
    // 11.閉じるボタンをカードに追加
    dialogBox.appendChild(closeButton);
    // 12.カードをバックドロップに追加
    dialogContainer.appendChild(dialogBox);
    // 13.ダイアログ本体をボディに追加
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
      // 1.ダイアログの親要素の作成（バックドロップ）
      const dialogContainer = document.createElement("div");
      // 2.ダイアログの親要素のクラス名を設定
      dialogContainer.className = "ConfirmContainer";
      // 3.ダイアログ本体カードの作成
      const dialogBox = document.createElement("div");
      // 4.カードのクラス名を設定
      dialogBox.className = "DialogBox";
      // 5.ダイアログ表示テキストの作成
      const dialogMessage = document.createElement("p");
      // 6.ダイアログ表示テキストにメッセージを設定
      dialogMessage.textContent = message;
      // 7.表示テキストをカードにセット
      dialogBox.appendChild(dialogMessage);
      // 8.[はい]ボタンの要素を作成
      const yesButton = document.createElement("button");
      // 9.[はい]ボタンのテキストを設定
      yesButton.textContent = "はい";
      // 10.[はい]ボタンのクラス名を設定
      yesButton.classList.add("ButtonInfo", "RedButton");
      // 11.[いいえ]ボタンの要素を作成
      const noButton = document.createElement("button");
      // 12.[いいえ]ボタンのテキストを設定
      noButton.textContent = "いいえ";
      // 13.[いいえ]ボタンのクラス名を設定
      noButton.classList.add("ButtonInfo", "BlueButton");
      // 14.ボタン要素の親クラスを作成
      const ButtonForm = document.createElement("div");
      // 15.ボタン親要素のクラス名を設定
      ButtonForm.className = "ConfirmButtonForm";
      // 16.[はい]ボタンを親要素に設定
      ButtonForm.appendChild(yesButton);
      // 17.[いいえ]ボタンを親要素に設定
      ButtonForm.appendChild(noButton);
      // 18.ボタン要素をカードに設定
      dialogBox.appendChild(ButtonForm);
      // 19.カードをバックドロップに追加
      dialogContainer.appendChild(dialogBox);
      // 20.ダイアログ本体をボディに追加
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
