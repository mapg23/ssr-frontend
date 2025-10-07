import React, { useEffect, useRef } from 'react';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { basicSetup } from 'codemirror'; // basicSetup is fine from codemirror
import { autocompletion } from '@codemirror/autocomplete';

const CodeEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);

  const viewRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: value || '',
      extensions: [
        basicSetup,
        javascript(),
        keymap.of([indentWithTab, ...defaultKeymap]),
        autocompletion(),
        EditorView.updateListener.of(update => {
          if (update.docChanged) {
            onChange && onChange(update.state.doc.toString());
          }
        }),
      ],
    });

    viewRef.current = new EditorView({
      state,
      parent: editorRef.current,
    });
    return () => viewRef.current.destroy();
  }, [editorRef]);

    useEffect(() => {
    if (viewRef.current && value !== viewRef.current.state.doc.toString()) {
      const transaction = viewRef.current.state.update({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: value || '',
        },
      });
      viewRef.current.dispatch(transaction);
    }
  }, [value]);

  return <div ref={editorRef} style={{ border: '1px solid #ddd', minHeight: '200px' }} />;
};

export default CodeEditor;