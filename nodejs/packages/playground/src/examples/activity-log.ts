import type { Example } from './types.js';

// Registers two custom tags (Tier 1 - template expansion) that expand into
// plain built-in-tag templates, so they render consistently across the
// string, DOM, and React renderers: "person-pill" for people mentioned in
// the log, and "calendar-event" for scheduled meetings/events. A team
// activity log mixes these pills with ordinary prose, driven entirely by
// the bound `entries` data, to show custom tags used in a realistic layout
// rather than in isolation.
export const activityLog: Example = {
  template: {
    div: {
      class: 'activity-log',
      $children: [
        { h2: 'Team Activity Log' },
        {
          div: {
            class: 'log-entries',
            $bind: 'entries',
            $children: [
              {
                $if: {
                  $check: 'type',
                  '$=': 'person',
                  $then: {
                    p: {
                      class: 'log-entry',
                      $children: [
                        '{{time}} — ',
                        { 'person-pill': { 'data-person-id': '{{personId}}', $children: ['{{name}}'] } },
                        ' {{action}}.'
                      ]
                    }
                  }
                }
              },
              {
                $if: {
                  $check: 'type',
                  '$=': 'event',
                  $then: {
                    p: {
                      class: 'log-entry',
                      $children: [
                        '{{time}} — ',
                        { 'calendar-event': { 'data-location': '{{location}}', $children: ['{{eventName}}'] } },
                        ' is scheduled.'
                      ]
                    }
                  }
                }
              },
              {
                $if: {
                  $check: 'type',
                  '$=': 'note',
                  $then: {
                    p: { class: 'log-entry', $children: ['{{time}} — {{text}}'] }
                  }
                }
              }
            ]
          }
        }
      ]
    }
  } as any,
  data: {
    entries: [
      { type: 'note', time: '9:00 AM', text: 'Sprint planning kicked off.' },
      { type: 'person', time: '9:15 AM', personId: 'person-123', name: 'Alex', action: 'joined the call' },
      { type: 'event', time: '10:00 AM', eventName: 'Design Review', location: 'Room 204' },
      { type: 'person', time: '10:05 AM', personId: 'person-456', name: 'Sam', action: 'shared the roadmap doc' },
      { type: 'note', time: '11:30 AM', text: 'Team broke for lunch.' },
      { type: 'event', time: '1:00 PM', eventName: 'Sprint Demo', location: 'Main Hall' }
    ]
  },
  customTags: {
    'person-pill': {
      attrs: ['data-person-id'],
      expand: (attrs, children) => ({
        span: {
          class: 'person-pill',
          style: {
            'background-color': '#e8f0fe',
            color: '#1a73e8',
            'border-radius': '999px',
            padding: '2px 10px',
            'font-weight': 'bold'
          },
          ...attrs,
          $children: children
        }
      })
    },
    'calendar-event': {
      attrs: ['data-location'],
      expand: (attrs, children) => ({
        span: {
          class: 'calendar-event',
          style: {
            'background-color': '#fce8e6',
            color: '#c5221f',
            'border-radius': '999px',
            padding: '2px 10px',
            'font-weight': 'bold'
          },
          ...attrs,
          $children: children
        }
      })
    }
  }
};
