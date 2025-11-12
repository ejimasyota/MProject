/**
 * UUIDの生成を行う関数
 * @returns {string} 生成されたUUIDの文字列
 */
function CreateUUID() {
  // 1.乱数を利用した簡易UUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}