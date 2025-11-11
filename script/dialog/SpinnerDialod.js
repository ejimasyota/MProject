/**
 * スピナーダイアログの作成処理
 */
function CreateSpinnerDialog() { 
  /* ------------------------------
   *  1. コンテナ作成
   * ------------------------------*/
  // 1.DIV要素作成
  const Container = document.createElement('div');
  // 2.ID設定
  Container.id = 'SpinnerDialog';
  // 3.クラス設定
  Container.classList.add('DisplayHidden','SpinerContainer');

  /* ------------------------------
   *  2. スピナー表示領域作成
   * ------------------------------*/
  // 1.DIV要素作成
  const SpinerBox = document.createElement('div');
  // 2.クラス設定
  SpinerBox.className = 'SpinerBox';

  /* ------------------------------
   *  3. スピナー作成
   * ------------------------------*/
  // 1.DIV要素作成
  const Spinner = document.createElement('div');
  // 2.クラス設定
  Spinner.className = 'Spinner';

  /* ------------------------------
   *  4. スピナー表示テキスト作成
   * ------------------------------*/
  // 1.DIV要素作成
  const Spinnerext = document.createElement('div');
  // 2.表示内容の設定
  Spinnerext.textContent = 'Now Loading...';

  /* ------------------------------
   *  5. 各要素の格納
   * ------------------------------*/
  // 1.スピナー表示領域にスピナーを格納
  SpinerBox.appendChild(Spinner);
  // 2.スピナー表示領域に表示テキストを格納
  SpinerBox.appendChild(Spinnerext);
  // 3.コンテナにスピナー表示領域を格納
  Container.appendChild(SpinerBox);
  // 4.ボディにコンテナを格納
  document.body.appendChild(Container);
}

/**
 * スピナーダイアログの表示処理
 */
function ShowSpinner() {
    // 1.コンテナからDisplayHiddenクラスを除去
    document.getElementById('SpinnerDialog').classList.remove('DisplayHidden'); 
}

/**
 * スピナーダイアログの表示処理
 */
function HideSpinner() {
    // 1.コンテナにDisplayHiddenクラスを設定
    document.getElementById('SpinnerDialog').classList.add('DisplayHidden');
}