/**
 * add function
 * 
 * @param a target 1
 * @param b target 2
 * 
 * {@vueComponent add}
 * 
 * @public
 */
export function add(a: number, b: number): number {
  return a + b
}

/**
 * sub function
 * 
 * @param a target 1
 * @param b target 2
 * 
 * @public
 */
export function sub(a: number, b: number): number {
  return a - b
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