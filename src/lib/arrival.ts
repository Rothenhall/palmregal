// Shared boundaries keep the arrival and the horizontal suites on one scroll path.
export const isBaselineArrival = () => typeof window !== 'undefined'
  && new URLSearchParams(window.location.search).get('arrival') === 'baseline';

export const arrivalDistance = () => innerHeight * (isBaselineArrival()
  ? (innerWidth <= 760 ? 10.5 : 13)
  : (innerWidth <= 760 ? 5 : 6));
