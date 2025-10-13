import { renderToString } from './dist/index.js';

console.log('Testing attribute validation from comment...\n');

// Test 1: a tag should not have src
console.log('Test 1: a tag with src attribute');
try {
  const result = renderToString({
    template: [
      {
        a: {
          src: "a should not have src",
        }
      }
    ]
  });
  console.log('Result:', result);
  console.log('Status: Runtime should reject this\n');
} catch (e) {
  console.log('Error:', e.message);
  console.log('Status: ✅ Rejected as expected\n');
}

// Test 2: img tag should not have href
console.log('Test 2: img tag with href attribute');
try {
  const result = renderToString({
    template: [
      {
        img: {
          href: "img should not have href",
        }
      }
    ]
  });
  console.log('Result:', result);
  console.log('Status: Runtime should reject this\n');
} catch (e) {
  console.log('Error:', e.message);
  console.log('Status: ✅ Rejected as expected\n');
}

// Test 3: Valid a tag with href
console.log('Test 3: Valid a tag with href');
try {
  const result = renderToString({
    template: [
      {
        a: {
          href: "http://example.com",
          target: "_blank"
        }
      }
    ]
  });
  console.log('Result:', result);
  console.log('Status: ✅ Accepted as expected\n');
} catch (e) {
  console.log('Error:', e.message);
  console.log('Status: Should not error\n');
}

// Test 4: Valid img tag with src
console.log('Test 4: Valid img tag with src');
try {
  const result = renderToString({
    template: [
      {
        img: {
          src: "image.jpg",
          alt: "An image"
        }
      }
    ]
  });
  console.log('Result:', result);
  console.log('Status: ✅ Accepted as expected\n');
} catch (e) {
  console.log('Error:', e.message);
  console.log('Status: Should not error\n');
}
