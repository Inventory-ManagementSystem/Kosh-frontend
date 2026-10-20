function formatBoldText(text, keyPrefix) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (/^\*\*.*\*\*$/.test(part)) {
      return <strong key={`${keyPrefix}-${index}`}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function formatTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableSeparator(line) {
  return /^\|?[\s:|-]+\|?$/.test(line) && line.includes("-");
}

function formatAssistantMessage(message) {
  const lines = message.split("\n");
  const formattedLines = [];
  let index = 0;

  while (index < lines.length) {
    const trimmedLine = lines[index].trim();

    if (!trimmedLine) {
      formattedLines.push(<div key={`blank-${index}`} className="h-2" />);
      index++;
      continue;
    }

    if (
      trimmedLine.includes("|") &&
      index + 1 < lines.length &&
      isTableSeparator(lines[index + 1].trim())
    ) {
      const headers = formatTableRow(trimmedLine);
      const rows = [];
      index += 2;

      while (index < lines.length && lines[index].trim().includes("|")) {
        rows.push(formatTableRow(lines[index]));
        index++;
      }

      formattedLines.push(
        <div
          key={`table-${index}`}
          className="my-3 w-full overflow-x-auto rounded-lg border border-(--border-color)"
        >
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-(--input-background)">
              <tr>
                {headers.map((header, headerIndex) => (
                  <th
                    key={headerIndex}
                    className="border-b border-(--border-color) px-3 py-2 font-semibold text-(--text-color)"
                  >
                    {formatBoldText(header, `table-header-${headerIndex}`)}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-(--border-color) last:border-b-0"
                >
                  {headers.map((_, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-3 py-2 align-top text-(--text-color)"
                    >
                      {formatBoldText(
                        row[cellIndex] || "",
                        `table-${rowIndex}-${cellIndex}`,
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );

      continue;
    }

    const headingMatch = trimmedLine.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      formattedLines.push(
        <p
          key={`heading-${index}`}
          className="mb-1 font-semibold text-(--text-color)"
        >
          {formatBoldText(headingMatch[2], `heading-${index}`)}
        </p>,
      );

      index++;
      continue;
    }

    const bulletMatch = trimmedLine.match(/^[-*]\s+(.*)$/);
    if (bulletMatch) {
      formattedLines.push(
        <div key={`bullet-${index}`} className="flex items-start gap-2 pl-2">
          <span>•</span>
          <p className="min-w-0 flex-1">
            {formatBoldText(bulletMatch[1], `bullet-${index}`)}
          </p>
        </div>,
      );
      index++;
      continue;
    }

    const numberMatch = trimmedLine.match(/^(\d+)\.\s+(.*)$/);
    if (numberMatch) {
      formattedLines.push(
        <div key={`number-${index}`} className="flex items-start gap-2 pl-2">
          <span>{numberMatch[1]}.</span>
          <p className="min-w-0 flex-1">
            {formatBoldText(numberMatch[2], `number-${index}`)}
          </p>
        </div>,
      );
      index++;
      continue;
    }

    formattedLines.push(
      <p key={`paragraph-${index}`}>
        {formatBoldText(trimmedLine, `paragraph-${index}`)}
      </p>,
    );

    index++;
  }
  return formattedLines;
}
export default formatAssistantMessage;
