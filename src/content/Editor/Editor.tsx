import {useState} from "react";
import sanitizeHtml from 'sanitize-html';
import "./Editor.scss"

export const Editor = (props: { sendReply(plain: string, formatted: string): void }) => {
    return <p>broken</p>;
//    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
//    const [focused, setFocused] = useState(false);
//    const handleKeyCommand = (command: string, editorState: EditorState) => {
//      const newState = RichUtils.handleKeyCommand(editorState, command);
//      if (newState) {
//          setEditorState(newState);
//          return 'handled';
//      } else if (command === SEND_COMMAND) {
//          const plainText = editorState.getCurrentContent().getPlainText();
//          const formattedText = sanitizeHtml(draftToHtml(convertToRaw(editorState.getCurrentContent())));
//          props.sendReply(plainText, formattedText);
//          setEditorState(EditorState.push(editorState, ContentState.createFromText(""), 'remove-range'));
//          return 'handled'
//      }
//      return 'not-handled';
//    }
//    const toggleStyle = (style: string) => setEditorState(RichUtils.toggleInlineStyle(editorState, style));
//    const inlineStyles = editorState.getCurrentInlineStyle();
//    const buttons = EDITOR_BUTTONS.map(([string, icon]) =>
//        <EditorButton toggleStyle={toggleStyle} currentStyles={inlineStyles} style={string} icon={icon}/>);
//    return (
//      <div className={`editor ${focused ? "focused" : ""}`}>
//          <div className="editor-buttons">{buttons}</div>
//          <div className={`editor-box`}>
//              <Draft.Editor keyBindingFn={keyBindingFn}
//                  onFocus={() => setFocused(true)}
//                  onBlur={() => setFocused(false)}
//                  editorState={editorState}
//                  onChange={setEditorState}
//                  handleKeyCommand={handleKeyCommand}/>
//          </div>
//      </div>
//    );
}
