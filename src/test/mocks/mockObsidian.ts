/**
 * We use this module as our mock of Obsidian for the test environment.
 *
 * Jest is unable to resolve the obsidian module, so instead we
 * point it here.
 */

export class Notice {}
export class WorkspaceParent {}

export function debounce() {}
