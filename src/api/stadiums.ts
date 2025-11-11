// Stadiums feature has been removed from the product.
// To avoid compile-time imports causing accidental usage,
// we keep a minimal stub here that returns rejected promises.

export type Stadium = { id: string }

const removed = (name = 'stadiums') => Promise.reject(new Error(`${name} API removed`))

export function getStadiums() { return removed('getStadiums') }
export function getAdminStadiums() { return removed('getAdminStadiums') }
export function createStadium() { return removed('createStadium') }
export function updateStadium() { return removed('updateStadium') }
export function deleteStadium() { return removed('deleteStadium') }
