import {useState, useCallback, KeyboardEvent} from "react";
import sanitizeHtml from 'sanitize-html';
import "./Editor.scss";
import { EDITOR_BUTTONS, EditorButton } from "./EditorButton";
import { useEditor, EditorContent } from '@tiptap/react';
import History from '@tiptap/extension-history';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Code from '@tiptap/extension-code';


export const Editor = (props: { sendReply(plain: string, formatted: string): void }) => {
    const CustomParagraph = Paragraph.extend({
        addKeyboardShortcuts() {
            return {
                'Enter': () => {
                    props.sendReply(this.editor.getText(), this.editor.getHTML())
                    this.editor.commands.clearContent();
                    return true;
                },
                'Shift-Enter': () => {
                    this.editor.commands.splitBlock();
                    return true;
                }
            }
        }
    });

    const editor = useEditor({ extensions: [
        History, Document, CustomParagraph, Text, Bold, Italic, Code,
    ] });
    if (!editor) return null;

    const toggleStyle = (style: string) => {
        let chain = editor.chain().focus();
        // TODO: Is there no better way of setting the style, via a string?
        switch (style) {
            case 'bold': chain = chain.toggleBold(); break;
            case 'italic': chain = chain.toggleItalic(); break;
            case 'code': chain = chain.toggleCode(); break;
        }
        chain.run();
    }
    const buttons = EDITOR_BUTTONS.map(([string, icon]) =>
        <EditorButton toggleStyle={toggleStyle} current={editor.isActive(string)} style={string} icon={icon}/>);

    return (
        <div className="editor">
            <div className="editor-buttons">{buttons}</div>
            <EditorContent editor={editor} />
        </div>
    );
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
