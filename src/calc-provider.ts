import {
  CompletionItemProvider,
  CompletionContext,
  WorkspaceConfiguration,
  TextDocument,
  CompletionItem,
  CompletionItemKind,
  Range,
  Position,
  CancellationToken,
  window,
} from 'vscode';
import { calculate } from 'editor-calc';

export class CalcProvider implements CompletionItemProvider {
  public enableActive: boolean;

  private replacePosition?: Range;
  private enableReplaceOriginalExpression: boolean;
  private decorationType: import('vscode').TextEditorDecorationType;

  constructor(
    public config: WorkspaceConfiguration,
    private onError: (error: Error) => any,
  ) {
    this.enableActive = false;
    this.enableReplaceOriginalExpression = this.config.get<boolean>(
      'replaceOriginalExpression',
      true,
    );
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
    newText: string;
    expressionRange: Range;
    expressionWithEqualSignRange: Range;
    expressionEndRange: Range;
  } {
    const { skip, result } = calculate(exprLine);
    const formulaRaw = exprLine.slice(skip);
    const leftMatches = formulaRaw.match(/^\s+/);
    const leftEmpty = leftMatches ? leftMatches[0].length : 0;
    const rightMatches = formulaRaw.match(/[\s=]+$/);
    const rightEmpty = rightMatches ? rightMatches[0].length : 0;

    const newText = exprLine.endsWith(' =') ? ' ' + result : result;

    return {
      skip,
      result,
      newText,
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
    try {
      const {
        skip,
        result,
        expressionRange,
        expressionWithEqualSignRange,
        expressionEndRange,
        newText,
      } = this.calculateLine(position, exprLine);

      this.clearHighlight().catch(this.onError);

      this.highlight(expressionRange).catch(this.onError);

      this.replacePosition = expressionWithEqualSignRange;

      return [
        {
          label: result,
          kind: CompletionItemKind.Constant,
          documentation: '`' + exprLine.slice(skip).trimLeft() + newText + '`',
          textEdit: {
            range: expressionEndRange,
            newText,
          },
        } as CompletionItem,
      ];
    } catch (error) {
      // tslint:disable-next-line: no-console
      console.error(error.message, 'error');
      return [];
    }
  }

  async resolveCompletionItem(
    item: CompletionItem,
    _token: CancellationToken,
  ): Promise<CompletionItem> {
    if (this.enableReplaceOriginalExpression) {
      item.textEdit = {
        range: this.replacePosition!,
        newText: item.textEdit!.newText.trim(),
      };
    }
    return item;
  }
}
