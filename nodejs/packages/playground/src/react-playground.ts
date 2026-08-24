import { examples } from './examples/index.js';

declare const React: any;

// Tier 2 ("component") real React component overrides for the "Activity Log"
// example's custom tags, layered on top of the shared Tier 1 ("expand")
// definitions used by the string/DOM/JSON-YAML playgrounds. This shows that a
// React app can render its own components for the same registered tag names
// instead of relying on template expansion — the React renderer prefers
// `component` when both are present on a definition.
function PersonPillComponent(props: Record<string, unknown> & { children?: unknown }) {
  const { className, 'data-person-id': personId, children } = props as any;
  return React.createElement(
    'span',
    {
      className,
      'data-person-id': personId,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        backgroundColor: '#e8f0fe',
        color: '#1a73e8',
        borderRadius: '999px',
        padding: '2px 10px',
        fontWeight: 'bold'
      }
    },
    '🧑 ',
    children
  );
}

function CalendarEventComponent(props: Record<string, unknown> & { children?: unknown }) {
  const { className, 'data-location': location, children } = props as any;
  return React.createElement(
    'span',
    {
      className,
      'data-location': location,
      title: location,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        backgroundColor: '#fce8e6',
        color: '#c5221f',
        borderRadius: '999px',
        padding: '2px 10px',
        fontWeight: 'bold'
      }
    },
    '📅 ',
    children
  );
}

const activityLog = examples['Activity Log'];
if (activityLog?.customTags) {
  const personPill = activityLog.customTags['person-pill'];
  const calendarEvent = activityLog.customTags['calendar-event'];
  if (personPill) {
    activityLog.customTags['person-pill'] = { ...personPill, component: PersonPillComponent };
  }
  if (calendarEvent) {
    activityLog.customTags['calendar-event'] = { ...calendarEvent, component: CalendarEventComponent };
  }
}

(window as any).TreebarkExamples = examples;

document.addEventListener('DOMContentLoaded', function () {
  const select = document.getElementById('example-select') as HTMLSelectElement;
  if (!select) return;

  const exampleIds = Object.keys(examples);
  exampleIds.forEach((id) => {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = id;
    select.appendChild(option);
  });

  if (exampleIds.length > 0) {
    select.value = exampleIds[0];
    select.dispatchEvent(new Event('change'));
  }
});
