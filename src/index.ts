
/**
 * The version
 */
export const VERSION = '1.0.0'

/**
 * Error Code
 */
export enum ErrorCodes {
  /**
   * Success
   */
  Succcess,
  /**
   * Invalid format
   */
  InvalidFormat
}

/**
 * add function : `x`
 * 
 * @remarks
 * This is add function remarks
 * 
 * @param a target `1`
 * @param b target 2
 * @returns result as `a` + `b`
 * 
 * @throws `SyntaxError`
 * this is syntax error
 * 
 * @throws `Error`
 * this is general error
 * 
 * @example
 * example of `add` function:
 * ```javascript
 * console.log(add(1, 1))
 * ```
 * 
 * @public
 */
export function add(a: number, b: number): number {
  return a + b
}

/**
 * Widget interface
 * 
 * @public
 */
export interface IWidget {
  /**
   * add method 
   * @param a target 1
   * @param b target 2
   * @public
   */
  add(a: number, b: number): number
}

/**
 * Widget class
 * @public
 */
export class Widget implements IWidget {
  constructor () {
  }

  /**
   * add method 
   * @param a target 1
   * @param b target 2
   * @public
   */
  add(a: number, b: number): number {
    return a + b
  }
}