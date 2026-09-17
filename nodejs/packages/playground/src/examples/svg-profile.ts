import type { Example } from './types.js';

export const svgProfile: Example = {
  template: {
    svg: {
      viewBox: '0 0 240 120',
      role: 'img',
      'aria-label': 'Static SVG profile example',
      style: {
        width: '240px',
        height: '120px',
        border: '1px solid #cbd5e1',
        'border-radius': '8px'
      },
      $children: [
        {
          defs: {
            $children: [
              {
                linearGradient: {
                  id: 'sky',
                  x1: '0',
                  y1: '0',
                  x2: '1',
                  y2: '1',
                  $children: [
                    { stop: { offset: '0%', 'stop-color': '#38bdf8' } },
                    { stop: { offset: '100%', 'stop-color': '#6366f1' } }
                  ]
                }
              },
              {
                symbol: {
                  id: 'star',
                  viewBox: '0 0 24 24',
                  $children: [
                    { polygon: { points: '12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9', fill: '#facc15' } }
                  ]
                }
              },
              {
                clipPath: {
                  id: 'round',
                  $children: [{ rect: { x: '10', y: '10', width: '220', height: '100', rx: '12' } }]
                }
              }
            ]
          }
        },
        { rect: { x: '10', y: '10', width: '220', height: '100', fill: 'url(#sky)', 'clip-path': 'url(#round)' } },
        { use: { href: '#star', x: '25', y: '25', width: '32', height: '32' } },
        {
          text: {
            x: '70',
            y: '55',
            fill: '#ffffff',
            'font-size': '20',
            'font-family': 'system-ui',
            $children: [
              { tspan: 'Static SVG' },
              { tspan: { x: '70', dy: '26', 'font-size': '14', $children: ['Gradient, symbol, clip, and text'] } }
            ]
          }
        }
      ]
    }
  },
  data: {}
};
