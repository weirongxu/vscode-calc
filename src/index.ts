import {
  commands,
  window,
  ExtensionContext,
  workspace,
  Position,
  languages,
  TextEditor,
} from 'vscode';
import { CalcProvider } from './calc-provider';

export function activate(context: ExtensionContext) {
  const { subscriptions } = context;
  const config = workspace.getConfiguration('calc');

  // eslint-disable-next-line no-console
  const onError = console.error.bind(console);

  const calcProvider = new CalcProvider(config, onError);

  subscriptions.push(
    languages.registerCompletionItemProvider('*', calcProvider, '=', ' '),
    workspace.onDidOpenTextDocument(() => {
      calcProvider.clearHighlight().catch(onError);
    }),
  );

  async function replaceResultWithPosition(
    editor: TextEditor,
    position: Position,
    expression: string,
    mode: 'append' | 'replace',
  ) {
    const {
      insertText,
      expressionWithEqualSignRange,
      expressionEndRange,
    } = calcProvider.calculateLine(position, expression);
    if (mode === 'append') {
      const endWithEqual = expression.trimRight().endsWith('=');
      await editor.edit((editBuilder) => {
        editBuilder.replace(
          expressionEndRange,
          endWithEqual ? insertText : ' = ' + insertText,
        );
      });
    } else if (mode === 'replace') {
      await editor.edit((editBuilder) => {
        editBuilder.replace(expressionWithEqualSignRange, insertText);
      });
    }
  }

  async function replaceResult(
    mode: 'append' | 'replace',
    withCursor: boolean,
  ) {
    const editor = window.activeTextEditor;
    if (!editor || !editor.selection.isEmpty) {
      return;
    }
    const doc = editor.document;
    const [position, expression] = ((): [Position, string] => {
      const cursor = editor.selection.active;
      if (withCursor) {
        return [
          cursor,
          doc.lineAt(cursor.line).text.slice(0, cursor.character),
        ];
      } else {
        const position = editor.selection.active;
        const line = doc.lineAt(position.line);
        return [line.range.end, line.text];
      }
    })();
    await replaceResultWithPosition(editor, position, expression, mode);
  }

  subscriptions.push(
    commands.registerTextEditorCommand(
      'extension.calcAppendWithCursor',
      async () => {
        await replaceResult('append', true);
      },
    ),
    commands.registerTextEditorCommand('extension.calcAppend', async () => {
      await replaceResult('append', false);
    }),
    commands.registerTextEditorCommand(
      'extension.calcReplaceWithCursor',
      async () => {
        await replaceResult('replace', true);
      },
    ),
    commands.registerTextEditorCommand('extension.calcReplace', async () => {
      await replaceResult('replace', false);
    }),
  );
}
