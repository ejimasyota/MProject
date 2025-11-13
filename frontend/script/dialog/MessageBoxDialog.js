/* =========================================================
 * MessageBoxDialog クラス
 * =========================================================*/
class MessageBoxDialog {
  /* --------------------------------------------
   * 1. コンストラクタ
   * --------------------------------------------*/
  constructor() {
    // 1.デフォルトのアイコン画像パス
    this.DefaultIconPath = "../../asetts/img/icon/default_icon.png";
    this.TypeIntervalMs = 28;
    this.MessageContainer = null;
    this.MessageCard = null;
    this.AvatarWrapper = null;
    this.AvatarImage = null;
    this.CharacterNameTag = null;
    this.TextArea = null;
    this.ClickMarker = null;
    this.IsTyping = false;
    this.TypingAbortController = null;
  }

  HasBox() {
    return !!this.MessageContainer;
  }

  async ShowMessage(MessageText = "", CharacterName = "", ImagePath = "") {
    if (this.HasBox()) {
      this._ClearContent();
    } else {
      this._BuildDom();
      document.body.appendChild(this.MessageContainer);
      requestAnimationFrame(() => {
        this.MessageCard.classList.add("novel-show");
      });
    }

    const ResolvedImagePath = ImagePath && ImagePath.trim().length > 0 ? ImagePath : this.DefaultIconPath;
    this.AvatarImage.src = ResolvedImagePath;
    this.CharacterNameTag.textContent = CharacterName;

    await this._TypeText(MessageText);
    this.ClickMarker.style.opacity = "1";
    return Promise.resolve();
  }

  async HideMessage() {
    if (!this.HasBox()) return;
    this.MessageCard.classList.remove("novel-show");
    this.MessageCard.classList.add("novel-hide");
    await new Promise((Resolve) => {
      const Handler = (Evt) => {
        if (Evt.target === this.MessageCard) {
          this.MessageCard.removeEventListener("transitionend", Handler);
          Resolve();
        }
      };
      this.MessageCard.addEventListener("transitionend", Handler);
    });
    if (this.MessageContainer && this.MessageContainer.parentNode) {
      this.MessageContainer.parentNode.removeChild(this.MessageContainer);
    }
    this.MessageContainer = null;
    this.MessageCard = null;
    this.AvatarWrapper = null;
    this.AvatarImage = null;
    this.CharacterNameTag = null;
    this.TextArea = null;
    this.ClickMarker = null;
    this.IsTyping = false;
    if (this.TypingAbortController) {
      this.TypingAbortController.abort();
      this.TypingAbortController = null;
    }
    return Promise.resolve();
  }

  _BuildDom() {
    const MessageContainer = document.createElement("div");
    MessageContainer.className = "MessageBoxContainer";

    const MessageCard = document.createElement("div");
    MessageCard.className = "MessageBoxCard";

    const AvatarWrapper = document.createElement("div");
    AvatarWrapper.className = "IconWrapper";

    const AvatarImage = document.createElement("img");
    AvatarImage.className = "IconImage";
    AvatarImage.alt = "avatar";

    const CharacterNameTag = document.createElement("div");
    CharacterNameTag.className = "CharacterNameArea";

    const TextArea = document.createElement("div");
    TextArea.className = "NovelTextArea";

    const ClickMarker = document.createElement("div");
    ClickMarker.className = "ClickMarker";

    MessageCard.addEventListener("click", () => {
      if (this.IsTyping) {
        this._AbortTypingAndShowFullText();
        return;
      }
      ClickMarker.style.opacity = "0";
    });

    AvatarWrapper.appendChild(AvatarImage);
    MessageCard.appendChild(AvatarWrapper);
    MessageCard.appendChild(CharacterNameTag);
    MessageCard.appendChild(TextArea);
    MessageCard.appendChild(ClickMarker);
    MessageContainer.appendChild(MessageCard);

    this.MessageContainer = MessageContainer;
    this.MessageCard = MessageCard;
    this.AvatarWrapper = AvatarWrapper;
    this.AvatarImage = AvatarImage;
    this.CharacterNameTag = CharacterNameTag;
    this.TextArea = TextArea;
    this.ClickMarker = ClickMarker;
  }

  _TypeText(MessageText) {
    if (this.IsTyping) {
      this._AbortTypingAndShowFullText();
    }
    this._ClearContent();
    this.TypingAbortController = new AbortController();
    const AbortSignal = this.TypingAbortController.signal;
    this.IsTyping = true;
    const Chars = Array.from(MessageText);
    return new Promise((Resolve) => {
      let Index = 0;
      const Step = async () => {
        if (AbortSignal.aborted) {
          for (let I = Index; I < Chars.length; I++) {
            this._AppendCharToTextArea(Chars[I]);
          }
          this.IsTyping = false;
          Resolve();
          return;
        }
        if (Index >= Chars.length) {
          this.IsTyping = false;
          Resolve();
          return;
        }
        this._AppendCharToTextArea(Chars[Index]);
        Index += 1;
        setTimeout(Step, this.TypeIntervalMs);
      };
      Step();
    });
  }

  _AppendCharToTextArea(Char) {
    if (Char === "\n") {
      const Br = document.createElement("br");
      this.TextArea.appendChild(Br);
      return;
    }
    const TextNode = document.createTextNode(Char);
    this.TextArea.appendChild(TextNode);
  }

  _AbortTypingAndShowFullText() {
    if (!this.TypingAbortController) return;
    this.TypingAbortController.abort();
    this.TypingAbortController = null;
  }

  _ClearContent() {
    if (!this.TextArea) return;
    while (this.TextArea.firstChild) {
      this.TextArea.removeChild(this.TextArea.firstChild);
    }
    if (this.ClickMarker) {
      this.ClickMarker.style.opacity = "0";
    }
  }
}

window.MessageBoxDialog = MessageBoxDialog;