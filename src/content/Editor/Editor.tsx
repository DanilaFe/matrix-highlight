import {useState} from "react";
import {EditorState, RichUtils, getDefaultKeyBinding, KeyBindingUtil, ContentState, convertToRaw} from "draft-js";
import * as Draft from "draft-js";
import draftToHtml from 'draftjs-to-html';
import sanitizeHtml from 'sanitize-html';
const {hasCommandModifier} = KeyBindingUtil;
export const SEND_COMMAND = 'draft-editor-send';
import {EDITOR_BUTTONS, EditorButton} from "./EditorButton";
import commonStyles from "../../common/common.scss";
import styles from "./Editor.scss"

/* No idea where to get SyntheticKeyboardEvent. */
function keyBindingFn(e: Parameters<typeof hasCommandModifier>[0]) {
    if (e.code === "Enter" && !e.shiftKey) {
        return SEND_COMMAND;
    }
    return getDefaultKeyBinding(e); 
}

export const Editor = (props: { sendReply(plain: string, formatted: string): void }) => {
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    const [focused, setFocused] = useState(false);
    const handleKeyCommand = (command: string, editorState: EditorState) => {
      const newState = RichUtils.handleKeyCommand(editorState, command);
      if (newState) {
          setEditorState(newState);
          return 'handled';
      } else if (command === SEND_COMMAND) {
          const plainText = editorState.getCurrentContent().getPlainText();
          const formattedText = sanitizeHtml(draftToHtml(convertToRaw(editorState.getCurrentContent())));
          props.sendReply(plainText, formattedText);
          setEditorState(EditorState.push(editorState, ContentState.createFromText(""), 'remove-range'));
          return 'handled'
      }
      return 'not-handled';
    }
    const toggleStyle = (style: string) => setEditorState(RichUtils.toggleInlineStyle(editorState, style));
    const inlineStyles = editorState.getCurrentInlineStyle();
    const buttons = EDITOR_BUTTONS.map(([string, icon]) =>
        <EditorButton toggleStyle={toggleStyle} currentStyles={inlineStyles} style={string} icon={icon}/>);
    return (
      <div className={`${styles.editor} ${focused ? commonStyles.focused : ""}`}>
          <div className={styles.editorButtons}>{buttons}</div>
          <div className={styles.editorBox}>
              <Draft.Editor keyBindingFn={keyBindingFn}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  editorState={editorState}
                  onChange={setEditorState}
                  handleKeyCommand={handleKeyCommand}/>
          </div>
      </div>
    );
}
