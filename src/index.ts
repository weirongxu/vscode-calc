import {
  commands,
  window,
  ExtensionContext,
  workspace,
  Position,
  languages,
} from 'vscode';
import { CalcProvider } from './calc-provider';

export function activate(context: ExtensionContext) {
  const { subscriptions } = context;
  const config = workspace.getConfiguration('calc');

  // tslint:disable-next-line: no-console
  const onError = console.error.bind(console);

  const calcProvider = new CalcProvider(config, onError);

  subscriptions.push(
    languages.registerCompletionItemProvider('*', calcProvider, '=', ' '),
    workspace.onDidOpenTextDocument(() => {
      calcProvider.clearHighlight().catch(onError);
    }),
  );

  async function replaceResult(mode: 'append' | 'replace') {
    const editor = window.activeTextEditor;
    if (!editor || !editor.selection.isEmpty) {
      return;
    }
    const position = editor.selection.active;
    const doc = editor.document;
    const line = doc.lineAt(position.line);
    const equalPosition = line.text.indexOf('=', position.character - 1);
    const character =
      equalPosition === -1 ? line.text.length : equalPosition + 1;
    const exprLine = line.text.slice(0, character);
    const {
      newText,
      expressionWithEqualSignRange,
      expressionEndRange,
    } = calcProvider.calculateLine(
      new Position(position.line, character),
      exprLine,
    );
    if (mode === 'append') {
      const endWithEqual = exprLine.trimRight().endsWith('=');
      editor.edit((editBuilder) => {
        editBuilder.replace(
          expressionEndRange,
          endWithEqual ? newText : ' = ' + newText,
        );
      });
    } else if (mode === 'replace') {
      editor.edit((editBuilder) => {
        editBuilder.replace(expressionWithEqualSignRange, newText);
      });
    }
  }

  subscriptions.push(
    commands.registerTextEditorCommand('extension.calcAppend', async () => {
      await replaceResult('append');
    }),
    commands.registerTextEditorCommand('extension.calcReplace', async () => {
      await replaceResult('replace');
    }),
  );
}
