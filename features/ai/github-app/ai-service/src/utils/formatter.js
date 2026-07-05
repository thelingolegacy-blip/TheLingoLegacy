function formatCommentaryPrompt({ repo, prNumber, diff, context }) {
  return `Repository: ${repo}\nPR: ${prNumber}\nContext: ${context || ''}\nDiff: ${diff}`;
}

function formatHighlightPrompt({ text, cursor }) {
  return `Text: ${text}\nCursor: ${cursor}`;
}

module.exports = { formatCommentaryPrompt, formatHighlightPrompt };
