import ts from "typescript";

export type ArithmeticKind =
  | "add" | "subtract" | "multiply" | "divide" | "remainder"
  | "add_assign" | "subtract_assign" | "multiply_assign" | "divide_assign" | "remainder_assign"
  | "less_than" | "less_than_or_equal" | "greater_than" | "greater_than_or_equal"
  | "negate" | "math" | "to_fixed" | "number" | "parse_float" | "parse_int";

export type ArithmeticRecord = { line: number; kind: ArithmeticKind };

export function findArithmetic(sourceText: string): ArithmeticRecord[] {
  const source = ts.createSourceFile("scan.ts", sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const records: ArithmeticRecord[] = [];
  const add = (node: ts.Node, kind: ArithmeticKind) => records.push({ line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1, kind });
  const binaryKinds = new Map<ts.SyntaxKind, ArithmeticKind>([
    [ts.SyntaxKind.PlusToken, "add"], [ts.SyntaxKind.MinusToken, "subtract"], [ts.SyntaxKind.AsteriskToken, "multiply"],
    [ts.SyntaxKind.SlashToken, "divide"], [ts.SyntaxKind.PercentToken, "remainder"],
    [ts.SyntaxKind.PlusEqualsToken, "add_assign"], [ts.SyntaxKind.MinusEqualsToken, "subtract_assign"],
    [ts.SyntaxKind.AsteriskEqualsToken, "multiply_assign"], [ts.SyntaxKind.SlashEqualsToken, "divide_assign"],
    [ts.SyntaxKind.PercentEqualsToken, "remainder_assign"], [ts.SyntaxKind.LessThanToken, "less_than"],
    [ts.SyntaxKind.LessThanEqualsToken, "less_than_or_equal"], [ts.SyntaxKind.GreaterThanToken, "greater_than"],
    [ts.SyntaxKind.GreaterThanEqualsToken, "greater_than_or_equal"],
  ]);
  const visit = (node: ts.Node): void => {
    if (ts.isBinaryExpression(node)) {
      const kind = binaryKinds.get(node.operatorToken.kind);
      if (kind !== undefined && !(kind === "add" && ts.isStringLiteral(node.left) && ts.isStringLiteral(node.right))) add(node, kind);
    }
    if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken) add(node, "negate");
    if (ts.isCallExpression(node)) {
      if (ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === "toFixed") add(node, "to_fixed");
      if (ts.isPropertyAccessExpression(node.expression) && ts.isIdentifier(node.expression.expression) && node.expression.expression.text === "Math") add(node, "math");
      if (ts.isIdentifier(node.expression)) {
        const calls: Record<string, ArithmeticKind> = { Number: "number", parseFloat: "parse_float", parseInt: "parse_int" };
        const callKind = calls[node.expression.text];
        if (callKind !== undefined) add(node, callKind);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return records;
}
