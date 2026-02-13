#!/usr/bin/env node

/**
 * Visual Comparison: Different HTML Tag Options for Text Formatting
 */

console.log('='.repeat(80));
console.log('HTML TAGS COMPARISON: WHAT SHOULD WE AUTO-CONVERT?');
console.log('='.repeat(80));

const sampleText = `Treebark is a safe HTML templating system.

It supports data binding and explicit structure.

Visit https://github.com/danmarshall/treebark for more info.`;

// ============================================================================
// Option 1: Just Line Breaks (Current Proposal)
// ============================================================================
console.log('\n📍 OPTION 1: Line Breaks Only (<br>)');
console.log('-'.repeat(80));
console.log('Input:');
console.log(sampleText);

const withBr = sampleText
  .replace(/\r?\n|\r/g, '<br>');

console.log('\nOutput (convertNewlinesToBr: true):');
console.log(withBr);

console.log('\nRendered as:');
console.log('┌────────────────────────────────────────────┐');
console.log('│ Treebark is a safe HTML templating system.│');
console.log('│                                             │');
console.log('│ It supports data binding and explicit      │');
console.log('│ structure.                                  │');
console.log('│                                             │');
console.log('│ Visit https://github.com/danmarshall/      │');
console.log('│ treebark for more info.                    │');
console.log('└────────────────────────────────────────────┘');

console.log('\n✅ Pros:');
console.log('  • Simple and predictable');
console.log('  • Cross-platform line ending support');
console.log('  • No security concerns');
console.log('  • Low complexity');

console.log('\n❌ Cons:');
console.log('  • URL not clickable');
console.log('  • Less semantic (paragraph breaks as <br><br>)');

// ============================================================================
// Option 2: Line Breaks + Auto-Linking
// ============================================================================
console.log('\n\n📍 OPTION 2: Line Breaks + Auto-Linking (<br> + <a>)');
console.log('-'.repeat(80));

const withBrAndLinks = sampleText
  .replace(/\r?\n|\r/g, '<br>')
  .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>');

console.log('Output (convertNewlinesToBr + autoLinkUrls):');
console.log(withBrAndLinks);

console.log('\nRendered as:');
console.log('┌────────────────────────────────────────────┐');
console.log('│ Treebark is a safe HTML templating system.│');
console.log('│                                             │');
console.log('│ It supports data binding and explicit      │');
console.log('│ structure.                                  │');
console.log('│                                             │');
console.log('│ Visit [github.com/danmarshall/treebark]    │');
console.log('│ for more info.                             │');
console.log('│       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^     │');
console.log('│       (clickable link)                     │');
console.log('└────────────────────────────────────────────┘');

console.log('\n✅ Pros:');
console.log('  • URLs become clickable');
console.log('  • Better user experience for UGC');
console.log('  • Common in forum/CMS systems');

console.log('\n❌ Cons:');
console.log('  • More complex implementation');
console.log('  • Security validation needed');
console.log('  • Edge cases (punctuation, parentheses)');

// ============================================================================
// Option 3: Smart Paragraphs
// ============================================================================
console.log('\n\n📍 OPTION 3: Smart Paragraphs (<p>)');
console.log('-'.repeat(80));

const paragraphs = sampleText.split(/\n\n+/);
const withP = paragraphs
  .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
  .join('');

console.log('Output (convertParagraphs: true):');
console.log(withP);

console.log('\nRendered as:');
console.log('┌────────────────────────────────────────────┐');
console.log('│ Treebark is a safe HTML templating system.│');
console.log('│                                             │');
console.log('│ It supports data binding and explicit      │');
console.log('│ structure.                                  │');
console.log('│                                             │');
console.log('│ Visit https://github.com/danmarshall/      │');
console.log('│ treebark for more info.                    │');
console.log('└────────────────────────────────────────────┘');

console.log('\n✅ Pros:');
console.log('  • Semantically correct HTML');
console.log('  • Better for accessibility');
console.log('  • Better for SEO');
console.log('  • CSS margins vs manual spacing');

console.log('\n❌ Cons:');
console.log('  • May conflict with existing <p> wrappers');
console.log('  • Changes document structure');
console.log('  • More complex logic');

// ============================================================================
// Option 4: All Together (Maximum Features)
// ============================================================================
console.log('\n\n📍 OPTION 4: All Features Combined');
console.log('-'.repeat(80));

const withAll = paragraphs
  .map(p => {
    const withBr = p.replace(/\n/g, '<br>');
    const withLinks = withBr.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>');
    return `<p>${withLinks}</p>`;
  })
  .join('');

console.log('Output (all options enabled):');
console.log(withAll);

console.log('\n✅ Pros:');
console.log('  • Best user experience');
console.log('  • Semantic HTML');
console.log('  • Clickable links');
console.log('  • Professional output');

console.log('\n❌ Cons:');
console.log('  • Highest complexity');
console.log('  • Most security concerns');
console.log('  • Potential conflicts with existing markup');
console.log('  • Scope creep danger');

// ============================================================================
// Real-World Examples
// ============================================================================
console.log('\n\n' + '='.repeat(80));
console.log('REAL-WORLD EXAMPLES');
console.log('='.repeat(80));

// Example 1: User Comment
console.log('\n📝 Example 1: User Comment');
console.log('-'.repeat(80));
const comment = `Great project! I tested it and it works well.

Check out my demo at https://example.com/demo

Looking forward to more features.`;

console.log('Input:', JSON.stringify(comment.substring(0, 50) + '...'));

console.log('\n🔧 Option 1 (just <br>):');
console.log(comment.replace(/\n/g, '<br>').substring(0, 100) + '...');
console.log('  → Line breaks preserved but URL not clickable');

console.log('\n✨ Option 2 (<br> + <a>):');
const commentWithLinks = comment
  .replace(/\n/g, '<br>')
  .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>');
console.log(commentWithLinks.substring(0, 120) + '...');
console.log('  → Line breaks + clickable URL (best for UGC)');

// Example 2: Address
console.log('\n\n📍 Example 2: Mailing Address');
console.log('-'.repeat(80));
const address = `John Doe\n123 Main Street\nNew York, NY 10001\nUSA`;

console.log('Input:', JSON.stringify(address));

console.log('\n🔧 With <br> (appropriate):');
console.log(address.replace(/\n/g, '<br>'));
console.log('  → Perfect for addresses');

console.log('\n❓ With <p> (wrong):');
console.log(address.split('\n').map(p => `<p>${p}</p>`).join(''));
console.log('  → Each line as paragraph? Too much spacing!');

// Example 3: Poem
console.log('\n\n📖 Example 3: Poetry');
console.log('-'.repeat(80));
const poem = `Roses are red\nViolets are blue\nTreebark is safe\nAnd easy too`;

console.log('Input:', JSON.stringify(poem));

console.log('\n🔧 With <br> (appropriate):');
console.log(`<blockquote>${poem.replace(/\n/g, '<br>')}</blockquote>`);
console.log('  → Preserves line structure within blockquote');

// ============================================================================
// Feature Comparison Table
// ============================================================================
console.log('\n\n' + '='.repeat(80));
console.log('FEATURE COMPARISON TABLE');
console.log('='.repeat(80));

console.log('\n┌──────────────────────┬──────────┬────────────┬──────────┬──────────┐');
console.log('│ Feature              │ Priority │ Complexity │ Security │ Scope    │');
console.log('├──────────────────────┼──────────┼────────────┼──────────┼──────────┤');
console.log('│ Line breaks (<br>)   │ ⭐⭐⭐⭐⭐  │ Low        │ Safe     │ ✅ Yes   │');
console.log('│ Auto-link URLs (<a>) │ ⭐⭐⭐⭐   │ High       │ Medium   │ ⚠️  Maybe│');
console.log('│ Paragraphs (<p>)     │ ⭐⭐⭐    │ Medium     │ Safe     │ ⚠️  Maybe│');
console.log('│ Smart typography     │ ⭐⭐      │ Low        │ Safe     │ 💡 Later │');
console.log('│ Emphasis (*text*)    │ ⭐       │ High       │ Safe     │ ❌ No    │');
console.log('│ Lists (- item)       │ ⭐       │ Very High  │ Safe     │ ❌ No    │');
console.log('└──────────────────────┴──────────┴────────────┴──────────┴──────────┘');

// ============================================================================
// Markdown Conflict Analysis
// ============================================================================
console.log('\n\n' + '='.repeat(80));
console.log('WHY NOT MARKDOWN-LIKE SYNTAX?');
console.log('='.repeat(80));

console.log('\n❌ Problem: Treebark + Markdown = Conflict');
console.log('');
console.log('Treebark is used INSIDE Markdown via markdown-it-treebark plugin.');
console.log('If Treebark also parses Markdown syntax, we get double-processing!');
console.log('');
console.log('Example conflict:');
console.log('  Markdown: **bold text**');
console.log('  → markdown-it: <strong>bold text</strong>');
console.log('  → treebark (if it parsed *): <em>bold text</em> (wrong!)');
console.log('');
console.log('Better: Let markdown-it handle Markdown, Treebark handles structure.');

// ============================================================================
// Security Comparison
// ============================================================================
console.log('\n\n' + '='.repeat(80));
console.log('SECURITY ANALYSIS');
console.log('='.repeat(80));

console.log('\n✅ SAFE: <br> tag');
console.log('  • Void element (no content)');
console.log('  • No attributes');
console.log('  • Cannot be exploited');

console.log('\n✅ SAFE: <p> tag');
console.log('  • No attributes added by us');
console.log('  • Content still escaped');
console.log('  • Cannot be exploited');

console.log('\n⚠️  NEEDS VALIDATION: <a> tag');
console.log('  • href attribute MUST be validated');
console.log('  • Block javascript:, data:, vbscript: protocols');
console.log('  • URL must be properly escaped');
console.log('  • Consider rel="noopener" for security');
console.log('');
console.log('Example attack:');
console.log('  Input: Click javascript:alert("XSS")');
console.log('  BAD:   <a href="javascript:alert(\\"XSS\\")">...</a>');
console.log('  GOOD:  (rejected, no link created)');

// ============================================================================
// Implementation Phases
// ============================================================================
console.log('\n\n' + '='.repeat(80));
console.log('RECOMMENDED IMPLEMENTATION PHASES');
console.log('='.repeat(80));

console.log('\n📦 Phase 1 (This PR): Line Breaks Only');
console.log('  • Convert \\n, \\r\\n, \\r → <br>');
console.log('  • Opt-in: convertNewlinesToBr: boolean');
console.log('  • Simple, safe, solves immediate need');
console.log('  • Effort: 5-8 hours');

console.log('\n📦 Phase 2 (Future): Auto-Linking');
console.log('  • Convert URLs → <a href="...">');
console.log('  • Opt-in: autoLinkUrls: boolean');
console.log('  • URL validation required');
console.log('  • Effort: 10-15 hours');

console.log('\n📦 Phase 3 (Future): Smart Paragraphs');
console.log('  • Convert \\n\\n → </p><p>');
console.log('  • Opt-in: convertParagraphs: boolean');
console.log('  • Context-aware (don\'t double-wrap)');
console.log('  • Effort: 8-12 hours');

console.log('\n📦 Phase 4 (Maybe): Typography');
console.log('  • Smart quotes, dashes, ellipsis');
console.log('  • Opt-in: smartTypography: boolean');
console.log('  • Polish, not essential');
console.log('  • Effort: 5-8 hours');

console.log('\n❌ Out of Scope: Markdown Syntax');
console.log('  • Conflicts with markdown-it-treebark');
console.log('  • Use Markdown parser instead');
console.log('  • Not Treebark\'s responsibility');

// ============================================================================
// Summary
// ============================================================================
console.log('\n\n' + '='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));

console.log('\n❓ Question: "Is <br> the only tag we ought to consider?"');

console.log('\n✅ Answer: For THIS feature, yes.');
console.log('');
console.log('Focus on <br> for line breaks because:');
console.log('  1. Simple and safe');
console.log('  2. Solves real, immediate problem');
console.log('  3. Cross-platform compatibility');
console.log('  4. No security concerns');
console.log('  5. Aligns with explicit structure philosophy');

console.log('\n⚠️  Future consideration: <a> and <p>');
console.log('');
console.log('Other useful features:');
console.log('  • Auto-linking URLs (<a>) - high user value');
console.log('  • Smart paragraphs (<p>) - better semantics');
console.log('  • Typography enhancements - polish');
console.log('');
console.log('Implement as separate opt-in features if there\'s demand.');

console.log('\n❌ Out of scope: Markdown-like syntax');
console.log('');
console.log('Do NOT implement:');
console.log('  • *emphasis* → <em>');
console.log('  • - lists → <ul><li>');
console.log('  • # headers → <h1>');
console.log('');
console.log('Why? Conflicts with Markdown parsers and Treebark philosophy.');

console.log('\n' + '='.repeat(80));
console.log('RECOMMENDATION: Start simple with <br>, expand carefully if needed');
console.log('='.repeat(80));
