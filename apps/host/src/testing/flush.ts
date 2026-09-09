/**
 * RNTL 14 on React 19: a state update from `fireEvent` only lands on the next async flush, and
 * two events fired back to back without one wedge the render loop — every later update is then
 * dropped silently. So each interaction is followed by a flush, either this one or a
 * `findBy*`/`waitFor` (DECISIONS 03).
 */
export const flush = () => new Promise((done) => setTimeout(done, 0));
