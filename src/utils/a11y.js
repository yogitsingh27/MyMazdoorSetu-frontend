// Make a non-native interactive element (a <div>/<a> acting as a button)
// keyboard-activatable: fire the handler on Enter or Space, like a real button.
// Pair with role="button" and tabIndex={0} on the element.
export const onActivate = (handler) => (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handler(e);
  }
};
