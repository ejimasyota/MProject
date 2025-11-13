/* =========================================================
 * MessageBoxDialog クラス
 * =========================================================*/
class MessageBoxDialog {
  constructor() {
    this.DefaultIconPath = "../../asetts/img/icon/default_icon.png";
    this.MessageBoxHeight = 300;
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
    if (!document.getElementById("NovelMessageBox_Styles")) {
      this._AppendStyles();
    }
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
    MessageContainer.className = "NovelMessageContainer";
    MessageContainer.style.margin = "0 4px 0 4px";

    const MessageCard = document.createElement("div");
    MessageCard.className = "NovelMessageCard";
    MessageCard.style.height = `${this.MessageBoxHeight}px`;

    const AvatarWrapper = document.createElement("div");
    AvatarWrapper.className = "NovelAvatarWrapper";
    AvatarWrapper.style.width = "200px";
    AvatarWrapper.style.height = "200px";

    const AvatarImage = document.createElement("img");
    AvatarImage.className = "NovelAvatarImage";
    AvatarImage.width = 200;
    AvatarImage.height = 200;
    AvatarImage.alt = "avatar";

    const CharacterNameTag = document.createElement("div");
    CharacterNameTag.className = "NovelCharacterNameTag";

    const TextArea = document.createElement("div");
    TextArea.className = "NovelTextArea";
    TextArea.style.whiteSpace = "pre-wrap";

    const ClickMarker = document.createElement("div");
    ClickMarker.className = "NovelClickMarker";
    ClickMarker.style.opacity = "0";

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

  _AppendStyles() {
    const Style = document.createElement("style");
    Style.id = "NovelMessageBox_Styles";
    Style.textContent = `
      .NovelMessageContainer {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 8px;
        display: flex;
        justify-content: center;
        pointer-events: none;
        z-index: 9999;
      }
      .NovelMessageCard {
        box-sizing: border-box;
        width: calc(100% - 8px);
        max-width: 100%;
        height: ${this.MessageBoxHeight}px;
        background: rgba(20,20,30,0.95);
        color: #fff;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        transform: translateY(120%);
        transition: transform 420ms cubic-bezier(.2,.9,.2,1), opacity 300ms ease;
        opacity: 0;
        pointer-events: auto;
      }
      .NovelMessageCard.novel-show {
        transform: translateY(0%);
        opacity: 1;
      }
      .NovelMessageCard.novel-hide {
        transform: translateY(120%);
        opacity: 0;
      }
      .NovelAvatarWrapper {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255,255,255,0.04);
        border-radius: 6px;
        overflow: hidden;
      }
      .NovelAvatarImage {
        display: block;
        width: 200px;
        height: 200px;
        object-fit: cover;
      }
      .NovelCharacterNameTag {
        position: absolute;
        right: 12px;
        bottom: ${this.MessageBoxHeight - 48}px;
        background: rgba(255,255,255,0.06);
        padding: 8px 12px;
        border-radius: 6px;
        font-weight: 600;
        backdrop-filter: blur(4px);
      }
      .NovelTextArea {
        flex: 1 1 auto;
        min-height: 200px;
        max-height: 200px;
        overflow: auto;
        font-size: 18px;
        line-height: 1.6;
        word-break: break-word;
      }
      .NovelClickMarker {
        position: absolute;
        right: 18px;
        bottom: 14px;
        width: 16px;
        height: 16px;
        clip-path: polygon(0% 0%, 100% 50%, 0% 100%);
        opacity: 0;
        transition: opacity 260ms ease;
        animation: NovelClickPulse 1100ms infinite;
        background: #fff;
      }
      @keyframes NovelClickPulse {
        0% { transform: translateY(0); }
        50% { transform: translateY(4px); }
        100% { transform: translateY(0); }
      }
    `;
    document.head.appendChild(Style);
  }
}

window.MessageBoxDialog = MessageBoxDialog;