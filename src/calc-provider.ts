import {
  CompletionItemProvider,
  CompletionContext,
  TextEditorDecorationType,
  WorkspaceConfiguration,
  TextDocument,
  CompletionItem,
  CompletionItemKind,
  Range,
  Position,
  CancellationToken,
  window,
  TextEdit,
} from 'vscode';
import { calculate } from 'editor-calc';

export class CalcProvider implements CompletionItemProvider {
  public enableActive: boolean;

  private decorationType: TextEditorDecorationType;

  constructor(
    public config: WorkspaceConfiguration,
    private onError: (error: Error) => any,
  ) {
    this.enableActive = false;
    this.decorationType = window.createTextEditorDecorationType({
      dark: {
        border: '1px dashed gray',
      },
      light: {
        border: '1px dashed black',
      },
    });
  }

  public async highlight(range: Range) {
    const editor = window.activeTextEditor;
    if (editor) {
      editor.setDecorations(this.decorationType, [range]);
    }
  }

  public async clearHighlight() {
    const editor = window.activeTextEditor;
    if (editor) {
      editor.setDecorations(this.decorationType, []);
    }
  }

  public calculateLine(
    position: Position,
    exprLine: string,
  ): {
    skip: number;
    result: string;
    insertText: string;
    expressionRange: Range;
    expressionWithEqualSignRange: Range;
    expressionEndRange: Range;
  } | null {
    var skip, result;
    try {
      ({ skip, result } = calculate(exprLine));
    } catch(error) {
      // eslint-disable-next-line no-console
      this.onError(error.message, 'error');
      return null;
    }
    const formulaRaw = exprLine.slice(skip);
    const leftMatches = formulaRaw.match(/^\s+/);
    const leftEmpty = leftMatches ? leftMatches[0].length : 0;
    const rightMatches = formulaRaw.match(/[\s=]+$/);
    const rightEmpty = rightMatches ? rightMatches[0].length : 0;

    const insertText = exprLine.endsWith(' =') ? ' ' + result : result;

    return {
      skip,
      result,
      insertText,
      expressionRange: new Range(
        position.line,
        skip + leftEmpty,
        position.line,
        position.character - rightEmpty,
      ),
      expressionWithEqualSignRange: new Range(
        position.line,
        skip + leftEmpty,
        position.line,
        position.character,
      ),
      expressionEndRange: new Range(
        position.line,
        position.character,
        position.line,
        position.character,
      ),
    };
  }

  public async provideCompletionItems(
    document: TextDocument,
    position: Position,
    _token: CancellationToken,
    _context: CompletionContext,
  ): Promise<CompletionItem[]> {
    const exprLine = document.getText(
      new Range(new Position(position.line, 0), position),
    );
    if (!this.enableActive && !exprLine.trimRight().endsWith('=')) {
      return [];
    }
    const lineCalcResult = this.calculateLine(position, exprLine);
    if (lineCalcResult == null) {
      return [];
    }
    const {
      skip,
      result,
      expressionRange,
      expressionWithEqualSignRange,
      expressionEndRange,
      insertText,
    } = lineCalcResult;

    this.clearHighlight().catch(this.onError);

    this.highlight(expressionRange).catch(this.onError);

    return [
      {
        label: result,
        detail: 'calc append',
        kind: CompletionItemKind.Constant,
        documentation: '`' + result + '`',
        range: expressionEndRange,
        insertText,
      },
      {
        label: result,
        kind: CompletionItemKind.Constant,
        detail: 'calc replace',
        documentation:
          '`' + exprLine.slice(skip).trimLeft() + insertText + '`',
        additionalTextEdits: [
          TextEdit.replace(expressionWithEqualSignRange, result),
        ],
        insertText: '',
      },
    ];
  }

  async resolveCompletionItem(
    item: CompletionItem,
    _token: CancellationToken,
  ): Promise<CompletionItem> {
    return item;
  }
}
