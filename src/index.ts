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
    window.onDidChangeTextEditorSelection(() => {
      calcProvider.clearHighlight().catch(onError);
    }),
  );

  async function replaceResultsWithPositions(
    editor: TextEditor,
    positionsAndExpressions: [Position, string][],
    mode: 'append' | 'replace',
  ) {
    await editor.edit((editBuilder) => {
      for (const [position, expression] of positionsAndExpressions) {
        const lineCalcResult = calcProvider.calculateLine(position, expression);
        if (lineCalcResult == null) {
          continue;
        }
        const { insertText, expressionWithEqualSignRange, expressionEndRange } =
          lineCalcResult;

        if (mode === 'append') {
          const endWithEqual = expression.trimEnd().endsWith('=');
          editBuilder.replace(
            expressionEndRange,
            endWithEqual ? insertText : ` = ${insertText}`,
          );
        } else if (mode === 'replace') {
          editBuilder.replace(expressionWithEqualSignRange, insertText);
        }
      }
    });
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

    let positionsAndExpressions;
    if (withCursor) {
      positionsAndExpressions = editor.selections.map(
        (selection) =>
          <[Position, string]>[
            selection.active,
            doc
              .lineAt(selection.active.line)
              .text.slice(0, selection.active.character),
          ],
      );
    } else {
      const uniqueLineNumbers = [
        ...new Set(editor.selections.map((selection) => selection.active.line)),
      ];
      positionsAndExpressions = uniqueLineNumbers.map((number) => {
        const line = doc.lineAt(number);
        return <[Position, string]>[line.range.end, line.text];
      });
    }
    await replaceResultsWithPositions(editor, positionsAndExpressions, mode);
  }

  subscriptions.push(
    commands.registerTextEditorCommand('extension.calcAppendWithCursor', () => {
      replaceResult('append', true).catch(onError);
    }),
    commands.registerTextEditorCommand('extension.calcAppend', () => {
      replaceResult('append', false).catch(onError);
    }),
    commands.registerTextEditorCommand(
      'extension.calcReplaceWithCursor',
      () => {
        replaceResult('replace', true).catch(onError);
      },
    ),
    commands.registerTextEditorCommand('extension.calcReplace', () => {
      replaceResult('replace', false).catch(onError);
    }),
  );
}
