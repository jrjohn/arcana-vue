/**
 * DAO layer — public exports and DI token
 */

// Interface
export type { IUserDao } from './interfaces/user.dao'

// Implementation
export { UserDaoImpl } from './impl/user.dao.impl'

/**
 * DI token for {@link IUserDao}.
 * Bind this in the container:
 *   container.bind<IUserDao>(USER_DAO_TOKEN).toConstantValue(new UserDaoImpl(apiService))
 */
export const USER_DAO_TOKEN: unique symbol = Symbol.for('UserDao')
