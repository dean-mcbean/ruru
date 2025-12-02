module.exports = function convertMarkdown(md) {
  // Convert markdown to limited HTML tags
  let html = md
    // Headings: # Heading 1, ## Heading 2, etc.
    .replace(/^###### (.*)$/gm, '<strong>$1</strong>')
    .replace(/^##### (.*)$/gm, '<strong>$1</strong>')
    .replace(/^#### (.*)$/gm, '<strong>$1</strong>')
    .replace(/^### (.*)$/gm, '<strong>$1</strong>')
    .replace(/^## (.*)$/gm, '<h1>$1</h1>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    // Bold: **bold** or __bold__
    .replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>')
    // Italic: *italic* or _italic_
    .replace(/(\*|_)(.*?)\1/g, '<em>$2</em>')
    // Strikethrough: ~~strike~~
    .replace(/~~(.*?)~~/g, '<strike>$1</strike>')
    // Links: [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Blockquote: > quote
    .replace(/^> (.*)$/gm, '<blockquote>$1</blockquote>')
    // Ordered list item: 1. item
    .replace(/^\d+\.\s+(.*)$/gm, '<li>$1</li>')
    // Unordered list item: - item or * item
    .replace(/^[*-]\s+(.*)$/gm, '<li>$1</li>')
    // Code block: ```code```
    .replace(/```([\s\S]*?)```/g, '<pre>$1</pre>')
    // Line breaks: single newline
    .replace(/\n/g, '<br>')
    // Wrap everything in a div
    .replace(/^(?!<h\d>|<ul>|<ol>|<pre>|<blockquote>)(.+)$/gm, '<div>$1</div>');

  // Group consecutive <li> into <ol>
  html = html.replace(/((?:<li>.*?<\/li><br>)+)/g, function(match) {
    // If the first <li> was preceded by a number, it's an <ol>
    if (/^\s*<li>/.test(match)) {
      // Check if the original markdown line started with a digit
      const lines = match.split('<br>');
      if (/^\d+\./.test(lines[0].replace(/<li>(.*?)<\/li>/, '$1'))) {
        return '<ol>' + match.replace(/<br>/g, '') + '</ol><br>';
      }
    }
    return '<ul>' + match.replace(/<br>/g, '') + '</ul><br>';
  });

  return html;
};